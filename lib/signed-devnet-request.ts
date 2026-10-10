import { PublicKey, Transaction } from "@solana/web3.js";

export class TransactionRequestError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}

// These checks protect browser requests; Origin is not authentication.
export async function readTransactionRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin !== null && origin !== new URL(request.url).origin)) {
    throw new TransactionRequestError("Cross-site requests are not allowed.", 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new TransactionRequestError("Use application/json.", 415);
  }
  const limit = 4096;
  const reader = request.body?.getReader();
  if (!reader) throw new TransactionRequestError("Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new TransactionRequestError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new TransactionRequestError("Invalid JSON body."); }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      typeof body.transaction !== "string" || body.transaction.length > 1644 ||
      typeof body.blockhash !== "string" ||
      !Number.isSafeInteger(body.lastValidBlockHeight) || body.lastValidBlockHeight <= 0) {
    throw new TransactionRequestError("Invalid signed transaction.");
  }
  let raw: Buffer;
  let transaction: Transaction;
  try {
    raw = Buffer.from(body.transaction, "base64");
    if (!raw.length || raw.length > 1232 || raw.toString("base64") !== body.transaction ||
        new PublicKey(body.blockhash).toBase58() !== body.blockhash) throw new Error();
    // Current prepare endpoints produce legacy transactions, including Pyth batches.
    transaction = Transaction.from(raw);
    if (transaction.recentBlockhash !== body.blockhash || !transaction.verifySignatures()) throw new Error();
  } catch {
    throw new TransactionRequestError("Invalid transaction, signature or blockhash.");
  }
  return { raw, transaction, blockhash: body.blockhash as string,
    lastValidBlockHeight: body.lastValidBlockHeight as number };
}

export function assertInstruction(transaction: Transaction, program: string, discriminator: readonly number[]) {
  const instructions = transaction.instructions;
  if (instructions.length !== 1 || instructions[0].programId.toBase58() !== program ||
      !instructions[0].data.subarray(0, discriminator.length).equals(Buffer.from(discriminator))) {
    throw new TransactionRequestError("This endpoint only accepts its Memedictions instruction.");
  }
}
