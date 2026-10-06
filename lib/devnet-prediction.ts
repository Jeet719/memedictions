import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  Buffer,
} from "buffer";

export type Direction =
  | "up"
  | "down";

const MEMO_PROGRAM =
  new PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  );

export const DEVNET_RPC =
  process.env
    .NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
  "https://api.devnet.solana.com";

export interface PhantomProvider {
  isPhantom?: boolean;

  publicKey?: PublicKey;

  connect: () => Promise<{
    publicKey: PublicKey;
  }>;

  disconnect: () => Promise<void>;

  signAndSendTransaction?: (
    tx: Transaction
  ) => Promise<{
    signature: string;
  }>;

  signTransaction: <
    T extends
      | Transaction
      | VersionedTransaction
  >(
    tx: T
  ) => Promise<T>;

  signMessage?: (
    message: Uint8Array,
    display?: "utf8" | "hex"
  ) => Promise<{
    signature: Uint8Array;
    publicKey: PublicKey;
  }>;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };

    solana?: PhantomProvider;
  }
}

export function phantom():
  | PhantomProvider
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const provider =
    window.phantom?.solana ??
    window.solana;

  return provider?.isPhantom
    ? provider
    : null;
}

export function explorerUrl(
  signature: string
) {
  return (
    "https://explorer.solana.com/tx/" +
    encodeURIComponent(
      signature
    ) +
    "?cluster=devnet"
  );
}

export async function recordDevnetMemo(
  wallet: PhantomProvider,
  market: string,
  direction: Direction,
  points: number
) {
  if (!wallet.publicKey) {
    throw new Error(
      "Connect Phantom before submitting a prediction."
    );
  }

  if (
    !/^[A-Z0-9]{2,16}$/.test(
      market
    ) ||
    ![
      "up",
      "down",
    ].includes(
      direction
    ) ||
    !Number.isSafeInteger(
      points
    ) ||
    points < 1 ||
    points > 10000
  ) {
    throw new Error(
      "Invalid prediction data."
    );
  }

  const connection =
    new Connection(
      DEVNET_RPC,
      "confirmed"
    );

  const balanceLamports =
    await connection.getBalance(
      wallet.publicKey,
      "confirmed"
    );

  if (
    balanceLamports <= 0
  ) {
    throw new Error(
      "The wallet has no Devnet SOL to pay the transaction fee."
    );
  }

  const {
    blockhash,
    lastValidBlockHeight,
  } =
    await connection
      .getLatestBlockhash(
        "confirmed"
      );

  const payload = {
    app:
      "memedictions",

    version:
      1,

    kind:
      "demo_prediction",

    market,

    direction,

    points,

    nonce:
      crypto.randomUUID(),

    timestamp:
      new Date()
        .toISOString(),

    disclaimer:
      "Fictitious points; not a betting contract or oracle result",
  };

  const memoData =
    Buffer.from(
      JSON.stringify(
        payload
      ),
      "utf8"
    );

  const transaction =
    new Transaction({
      feePayer:
        wallet.publicKey,

      recentBlockhash:
        blockhash,
    }).add(
      new TransactionInstruction({
        keys: [],

        programId:
          MEMO_PROGRAM,

        data:
          memoData,
      })
    );

  const signedTransaction =
    await wallet.signTransaction(
      transaction
    );

  const simulation =
    await connection
      .simulateTransaction(
        signedTransaction
      );

  console.log(
    "Memedictions Devnet simulation:",
    {
      rpc:
        DEVNET_RPC,

      error:
        simulation.value.err,

      logs:
        simulation.value.logs,
    }
  );

  if (
    simulation.value.err
  ) {
    throw new Error(
      `Simulation error: ${JSON.stringify(
        simulation.value.err
      )}`
    );
  }

  const signature =
    await connection
      .sendRawTransaction(
        signedTransaction
          .serialize(),
        {
          skipPreflight:
            false,

          preflightCommitment:
            "confirmed",

          maxRetries:
            3,
        }
      );

  const confirmation =
    await connection
      .confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

  if (
    confirmation.value.err
  ) {
    throw new Error(
      `Transaction failed: ${JSON.stringify(
        confirmation.value.err
      )}. Signature: ${signature}`
    );
  }

  return signature;
}