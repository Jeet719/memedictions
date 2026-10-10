import "server-only";
import { BN, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { HermesClient } from "@pythnetwork/hermes-client";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import idl from "@/lib/idl/memedictions_v2_2_pyth.json";
import { DOGE_FEED } from "@/lib/pyth-market";

export const PYTH_PROGRAM = new PublicKey(idl.address);
export { DOGE_FEED } from "@/lib/pyth-market";
export const pythConnection = () => new Connection(process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com", "confirmed");
export const pythProgram = (connection: Connection) => new Program(idl as any, { connection } as any);

export class PythRequestError extends Error {
  constructor(message: string, public code: string, public status = 409) { super(message); }
}

export function pythError(error: unknown) {
  if (error instanceof PythRequestError) {
    return Response.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
  }
  // Provider errors may contain authentication headers/URLs. Keep them server-side.
  return Response.json({ ok: false, error: "Could not prepare the Pyth transaction. Check the oracle configuration and try again." }, { status: 503 });
}

export async function chainClock(connection: Connection) {
  const info = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  if (!info || info.data.length < 40) throw new Error("Clock unavailable");
  return Number(info.data.readBigInt64LE(32));
}

// Wait for a small provider/chain clock skew before preparing anything to sign.
// A future price is never accepted: the Solana clock must actually catch up.
export async function oracleClockForPrice(connection: Connection, publishTime: number) {
  let now = await chainClock(connection);
  if (publishTime - now <= 5) {
    for (let attempt = 0; now < publishTime && attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      now = await chainClock(connection);
    }
  }
  if (now < publishTime) {
    throw new PythRequestError(`The Pyth price is ${publishTime - now}s ahead of the Solana clock. Try again shortly.`, "PYTH_PRICE_AHEAD");
  }
  return now;
}

export function oracleRoundPda(authority: PublicKey, id: BN) {
  return PublicKey.findProgramAddressSync([
    Buffer.from("pyth_round"), authority.toBuffer(), id.toArrayLike(Buffer, "le", 8),
  ], PYTH_PROGRAM)[0];
}

export async function assertOracleRound(connection: Connection, round: PublicKey) {
  const account = await (pythProgram(connection).account as any).round.fetch(round);
  if (!oracleRoundPda(account.authority, account.roundId).equals(round) || account.market !== "DOGEUSD") {
    throw new PythRequestError("This is not a Pyth DOGE/USD round.", "INVALID_ORACLE_ROUND", 400);
  }
  return account;
}

export async function preparePriceBatch(
  connection: Connection,
  authority: PublicKey,
  instruction: (priceUpdate: PublicKey) => Promise<TransactionInstruction | TransactionInstruction[]>,
  closingTime?: number,
) {
  const key = process.env.PYTH_API_KEY;
  if (!key) throw new PythRequestError("Pyth is not configured on this server yet.", "PYTH_NOT_CONFIGURED", 503);
  const programInfo = await connection.getAccountInfo(PYTH_PROGRAM);
  if (!programInfo?.executable) throw new PythRequestError("The Pyth program is not deployed on Devnet.", "V2_DEVNET_PROGRAM_NOT_DEPLOYED");
  if (await connection.getBalance(authority) < 50_000_000) {
    throw new PythRequestError("Keep at least 0.05 Devnet SOL available for temporary oracle accounts and fees. PTS have no monetary value.", "INSUFFICIENT_DEVNET_SOL", 400);
  }
  const client = new HermesClient("https://pyth.dourolabs.app/hermes", { accessToken: key });
  const update = await client.getLatestPriceUpdates([DOGE_FEED], { encoding: "base64", parsed: true });
  const price = update.parsed?.find(p => p.id.replace(/^0x/, "") === DOGE_FEED.slice(2))?.price;
  if (!price || !update.binary?.data.length || price.expo !== -8 || BigInt(price.price) <= BigInt(0)) {
    throw new PythRequestError("Pyth did not return a valid DOGE/USD update.", "INVALID_PYTH_PRICE", 503);
  }
  const now = await oracleClockForPrice(connection, price.publish_time);
  // The deployed contract requires BOTH an update within 60s of closing AND age <=60s now.
  if (closingTime !== undefined && (price.publish_time < closingTime || price.publish_time > closingTime + 60)) {
    throw new PythRequestError("A Pyth update for the closing time is not available yet. Try again in a few seconds.", "PYTH_CLOSE_NOT_READY");
  }
  const priceAge = now - price.publish_time;
  if (priceAge > 20) {
    throw new PythRequestError(`The Pyth price is ${priceAge}s old; preparation requires at most 20s. Fetch a fresh update and try again.`, "PYTH_PRICE_NOT_FRESH");
  }
  // No authority keypair exists on the server. Only temporary Pyth signers are generated.
  const wallet = {
    publicKey: authority,
    signTransaction: async () => { throw new Error("Wallet signing happens in the browser"); },
    signAllTransactions: async () => { throw new Error("Wallet signing happens in the browser"); },
  };
  const receiver = new PythSolanaReceiver({ connection, wallet: wallet as any });
  const builder = receiver.newTransactionBuilder({ closeUpdateAccounts: true });
  await builder.addPostPriceUpdates(update.binary.data);
  const priorityText = process.env.PYTH_PRIORITY_FEE_MICROLAMPORTS ?? "5000";
  if (!/^\d+$/.test(priorityText) || !Number.isSafeInteger(Number(priorityText)) || Number(priorityText) > 50000) {
    throw new PythRequestError("The oracle priority fee configuration is invalid.", "INVALID_PRIORITY_FEE", 503);
  }
  const computeUnitPriceMicroLamports = Number(priorityText);
  let consumers: TransactionInstruction[] = [];
  await builder.addPriceConsumerInstructions(async getAccount => {
    const prepared = await instruction(getAccount(DOGE_FEED));
    consumers = Array.isArray(prepared) ? prepared : [prepared];
    return consumers.map(instruction => ({ instruction, signers: [] }));
  });
  const built = builder.buildLegacyTransactions({ computeUnitPriceMicroLamports, tightComputeBudget: false });
  // SDK packing may split consumers. Reject before sending if the combined action is not atomic.
  const consumerTransactions = built.filter(({ tx }) => consumers.some(ix => tx.instructions.includes(ix)));
  if (!consumers.length || consumerTransactions.length !== 1 ||
      !consumers.every(ix => consumerTransactions[0].tx.instructions.includes(ix))) {
    throw new PythRequestError("The combined action does not fit in one transaction. Turn off combined creation and try again.", "COMBINED_ACTION_TOO_LARGE", 400);
  }
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  let consumerIndex = -1;
  const transactions = built.map(({ tx, signers }, index) => {
    tx.feePayer = authority;
    tx.recentBlockhash = blockhash;
    if (signers.length) tx.partialSign(...signers);
    if (tx.instructions.some(ix => ix.programId.equals(PYTH_PROGRAM))) consumerIndex = index;
    const raw = tx.serialize({ requireAllSignatures: false, verifySignatures: true });
    if (raw.length > 1232) throw new Error("Oracle transaction exceeds the wire size limit");
    return { transaction: Buffer.from(raw).toString("base64"), blockhash, lastValidBlockHeight };
  });
  if (consumerIndex < 0 || transactions.length > 12) throw new Error("Invalid oracle batch");
  const finalTime = await chainClock(connection);
  if (finalTime - price.publish_time > 20) throw new PythRequestError("The prepared oracle update aged. Prepare again.", "PYTH_PRICE_NOT_FRESH");
  return {
    transactions, consumerIndex, price: Number(price.price) / 1e8,
    priceRaw: price.price, priceExponent: price.expo, pricePublishTime: price.publish_time,
    computeUnitPriceMicroLamports, preparedAt: Date.now(), programId: PYTH_PROGRAM.toBase58(), network: "devnet",
  };
}
