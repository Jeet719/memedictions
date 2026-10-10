import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assertOracleRound, chainClock, preparePriceBatch, PYTH_PROGRAM, pythConnection, pythError, pythProgram, PythRequestError } from "@/lib/pyth-round";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authority = new PublicKey(body.authority);
    const round = new PublicKey(body.round);
    const connection = pythConnection();
    const account = await assertOracleRound(connection, round);
    if (!account.authority.equals(authority)) throw new PythRequestError("Only the round creator can resolve this round.", "WRONG_AUTHORITY", 403);
    const closingTime = Number(account.closingTime.toString());
    const now = await chainClock(connection);
    if (now < closingTime) throw new PythRequestError("The round is still open according to Solana.", "ROUND_NOT_FINISHED");
    const [result] = PublicKey.findProgramAddressSync([Buffer.from("round_result"), round.toBuffer()], PYTH_PROGRAM);
    if (await connection.getAccountInfo(result)) throw new PythRequestError("The round is already resolved. Recover its on-chain state.", "ROUND_ALREADY_RESOLVED");
    if (now > closingTime + 40) throw new PythRequestError("The oracle resolution window has passed. Create a new round; no tokens were staked.", "PYTH_WINDOW_EXPIRED");
    const program = pythProgram(connection);
    const batch = await preparePriceBatch(connection, authority, priceUpdate => program.methods.closeRound()
      .accountsStrict({ round, roundResult: result, authority, priceUpdate, systemProgram: SystemProgram.programId }).instruction(), closingTime);
    return Response.json({ ok: true, ...batch, roundAddress: round.toBase58(), resultAddress: result.toBase58(), closingPrice: batch.price });
  } catch (error) { return pythError(error); }
}
