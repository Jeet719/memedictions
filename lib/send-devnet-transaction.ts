import { Connection } from "@solana/web3.js";
import { assertInstruction, readTransactionRequest, TransactionRequestError } from "./signed-devnet-request";

export async function sendDevnetTransaction(request: Request, connectionFactory: () => Connection,
  instruction?: { program: string; discriminator: readonly number[] }) {
  let signature: string | undefined;
  try {
    const body = await readTransactionRequest(request);
    if (instruction) assertInstruction(body.transaction, instruction.program, instruction.discriminator);
    const connection = connectionFactory();
    signature = await connection.sendRawTransaction(body.raw, {
      skipPreflight: false, preflightCommitment: "confirmed", maxRetries: 3,
    });
    try {
      const confirmation = await connection.confirmTransaction({ signature,
        blockhash: body.blockhash, lastValidBlockHeight: body.lastValidBlockHeight }, "confirmed");
      if (confirmation.value.err) throw new Error("Transaction rejected");
    } catch (error) {
      const statuses = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true });
      const status = statuses.value[0];
      if (!status || status.err || (status.confirmationStatus !== "confirmed" &&
          status.confirmationStatus !== "finalized")) throw error;
    }
    return Response.json({ ok: true, network: "devnet", signature });
  } catch (error) {
    if (error instanceof TransactionRequestError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    // Never return provider URLs or raw RPC errors, which may contain credentials.
    return Response.json({ ok: false, signature, error: signature
      ? "Transaction sent but confirmation failed. Recover on-chain state before retrying."
      : "Transaction was rejected. Check your Devnet balance, wallet signatures and oracle freshness." },
      { status: 409 });
  }
}
