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
            "Transacción de cierre Devnet inválida.",
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
          `El cierre de la ronda fue rechazado: ${JSON.stringify(
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
        "No se pudo confirmar el cierre de la ronda en Devnet."
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
            : "No se pudo enviar el cierre de la ronda a Devnet.",
      },
      {
        status: 500,
      }
    );
  }
}