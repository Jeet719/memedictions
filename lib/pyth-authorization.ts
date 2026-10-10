import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Transaction } from "@solana/web3.js";
import { TransactionRequestError } from "./signed-devnet-request";

// Requires one shared secret across all serverless instances; never NEXT_PUBLIC_.
function secret(): Buffer {
  const hex = process.env.PYTH_TX_AUTH_SECRET;
  if (!hex || !/^[0-9a-fA-F]{64,}$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error("PYTH_TX_AUTH_SECRET must be at least 32 random bytes encoded as hex");
  }
  return Buffer.from(hex, "hex");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function messageHash(tx: Transaction): string {
  return createHash("sha256").update(tx.serializeMessage()).digest("hex");
}

export function authorizePythTransaction(tx: Transaction, blockhash: string, lastValidBlockHeight: number): string {
  // Authorizations are time-bound, message-bound, and network-specific.
  const expiresAt = Date.now() + 120_000;
  const payload = JSON.stringify({ v: 1, network: "devnet", message: messageHash(tx), blockhash, lastValidBlockHeight, expiresAt });
  return Buffer.from(payload, "utf8").toString("base64url") + "." + sign(payload);
}

export function verifyPythAuthorization(token: unknown, tx: Transaction, blockhash: string, lastValidBlockHeight: number) {
  if (typeof token !== "string" || token.length > 1024 || !/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/.test(token)) {
    throw new TransactionRequestError("Missing or invalid Pyth preparation authorization.", 403);
  }
  const [encoded, mac] = token.split(".");
  let payload: string;
  let value: { v?: unknown; network?: unknown; message?: unknown; blockhash?: unknown; lastValidBlockHeight?: unknown; expiresAt?: unknown };
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
    if (Buffer.from(payload, "utf8").toString("base64url") !== encoded) throw new Error("Noncanonical payload");
    value = JSON.parse(payload);
    const expected = Buffer.from(sign(payload), "hex");
    if (!timingSafeEqual(expected, Buffer.from(mac, "hex"))) throw new Error("Bad MAC");
  } catch {
    throw new TransactionRequestError("Pyth preparation authorization is invalid.", 403);
  }
  if (value?.v !== 1 || value.network !== "devnet" || value.message !== messageHash(tx) ||
      value.blockhash !== blockhash || value.lastValidBlockHeight !== lastValidBlockHeight ||
      !Number.isSafeInteger(value.expiresAt) || (value.expiresAt as number) <= Date.now() ||
      (value.expiresAt as number) > Date.now() + 120_000) {
    throw new TransactionRequestError("Pyth authorization expired or does not match this transaction.", 403);
  }
}
