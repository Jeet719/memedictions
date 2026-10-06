import {
  Connection,
  Transaction,
} from "@solana/web3.js";

export const dynamic =
  "force-dynamic";

const DEVNET_RPC =
  process.env
    .SOLANA_DEVNET_RPC_URL ||
  "https://api.devnet.solana.com";

interface SendCloseRequest {
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as SendCloseRequest;

    if (
      !body.transaction ||
      !body.blockhash ||
      !Number.isSafeInteger(
        body.lastValidBlockHeight
      )
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Invalid Devnet round resolution transaction.",
        },
        {
          status: 400,
        }
      );
    }

    const raw =
      Buffer.from(
        body.transaction,
        "base64"
      );

    /*
     * Confirmamos que los bytes
     * correspondan a una Transaction
     * Solana legacy válida.
     */
    Transaction.from(
      raw
    );

    const connection =
      new Connection(
        DEVNET_RPC,
        "confirmed"
      );

    const signature =
      await connection
        .sendRawTransaction(
          raw,
          {
            skipPreflight:
              false,

            preflightCommitment:
              "confirmed",

            maxRetries:
              3,
          }
        );

    let confirmed = false;

    try {
      const confirmation =
        await connection.confirmTransaction(
          {
            signature,
            blockhash:
              body.blockhash,
            lastValidBlockHeight:
              body.lastValidBlockHeight,
          },
          "confirmed"
        );

      if (confirmation.value.err) {
        throw new Error(
          `Round resolution was rejected: ${JSON.stringify(
            confirmation.value.err
          )}`
        );
      }

      confirmed = true;
    } catch (error) {
      const statuses =
        await connection.getSignatureStatuses(
          [signature],
          {
            searchTransactionHistory: true,
          }
        );

      const status =
        statuses.value[0];

      if (
        status &&
        !status.err &&
        (
          status.confirmationStatus === "confirmed" ||
          status.confirmationStatus === "finalized"
        )
      ) {
        confirmed = true;
      } else {
        throw error;
      }
    }

    if (!confirmed) {
      throw new Error(
        "Could not confirm the round resolution on Devnet."
      );
    }

    return Response.json({
      ok: true,

      network:
        "devnet",

      signature,
    });

  } catch (error) {
    console.error(
      "DEVNET_SEND_CLOSE_ROUND_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not send the round resolution transaction to Devnet.",
      },
      {
        status: 500,
      }
    );
  }
}