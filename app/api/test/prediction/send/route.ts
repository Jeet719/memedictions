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

interface SendRequest {
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as SendRequest;

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
            "Transacción Devnet inválida.",
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
     * Validamos que los bytes
     * representen una transacción
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

    const confirmation =
      await connection
        .confirmTransaction(
          {
            signature,

            blockhash:
              body.blockhash,

            lastValidBlockHeight:
              body
                .lastValidBlockHeight,
          },
          "confirmed"
        );

    if (
      confirmation.value.err
    ) {
      throw new Error(
        `La transacción Devnet fue rechazada: ${JSON.stringify(
          confirmation.value.err
        )}`
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
      "DEVNET_SEND_PREDICTION_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la predicción a Devnet.",
      },
      {
        status: 500,
      }
    );
  }
}