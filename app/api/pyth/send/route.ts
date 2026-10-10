import { VersionedTransaction } from "@solana/web3.js";
import { pythConnection } from "@/lib/pyth-round";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let signature: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.transaction !== "string" || body.transaction.length > 1800 || typeof body.blockhash !== "string" || !Number.isSafeInteger(body.lastValidBlockHeight)) {
      return Response.json({ ok: false, error: "Invalid signed transaction." }, { status: 400 });
    }
    const raw = Buffer.from(body.transaction, "base64");
    const tx = VersionedTransaction.deserialize(raw);
    if (tx.message.recentBlockhash !== body.blockhash || tx.signatures.some(sig => sig.every(byte => byte === 0))) {
      return Response.json({ ok: false, error: "A required signature is missing or the blockhash changed." }, { status: 400 });
    }
    const connection = pythConnection();
    signature = await connection.sendRawTransaction(raw, { skipPreflight: false, preflightCommitment: "confirmed", maxRetries: 3 });
    const confirmed = await connection.confirmTransaction({ signature, blockhash: body.blockhash, lastValidBlockHeight: body.lastValidBlockHeight }, "confirmed");
    if (confirmed.value.err) throw new Error("Transaction rejected");
    return Response.json({ ok: true, signature });
  } catch {
    return Response.json({ ok: false, signature, error: signature
      ? "Transaction sent but confirmation failed. Recover on-chain state before retrying."
      : "Transaction was rejected. Check your Devnet balance, wallet signatures and oracle freshness." }, { status: 409 });
  }
}
