import {
  Connection,
  PublicKey,
} from "@solana/web3.js";

import {
  Program,
} from "@coral-xyz/anchor";

import idl from "@/lib/idl/memedictions_v2_devnet.json";

export const dynamic = "force-dynamic";

const PROGRAM_ID =
  new PublicKey(
    (idl as any).address
  );

const DEVNET_RPC =
  process.env.SOLANA_DEVNET_RPC_URL ||
  "https://api.devnet.solana.com";

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const roundParam =
      url.searchParams.get("round");

    const walletParam =
      url.searchParams.get("wallet");

    if (!roundParam) {
      return Response.json(
        {
          ok: false,
          error:
            "Round address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const round =
      new PublicKey(
        roundParam
      );

    const wallet =
      walletParam
        ? new PublicKey(walletParam)
        : null;

    const connection =
      new Connection(
        DEVNET_RPC,
        "confirmed"
      );

    const program =
      new Program(
        idl as any,
        {
          connection,
        } as any
      );

    /*
     * ===========================
     * RONDA
     * ===========================
     */

    const roundInfo =
      await connection.getAccountInfo(
        round,
        "confirmed"
      );

    if (!roundInfo) {
      return Response.json(
        {
          ok: false,
          code:
            "ROUND_NOT_FOUND",
          error:
            "The round does not exist on Devnet.",
        },
        {
          status: 404,
        }
      );
    }

    const roundAccount =
      await (
        program.account as any
      ).round.fetch(
        round
      );

    const closingTime =
      Number(
        roundAccount
          .closingTime
          .toString()
      );

    /*
     * ===========================
     * PREDICCIÓN DE LA WALLET
     * ===========================
     */

    let prediction = null;

    if (wallet) {
      const [
        predictionPda,
      ] =
        PublicKey
          .findProgramAddressSync(
            [
              Buffer.from(
                "prediction"
              ),

              round.toBuffer(),

              wallet.toBuffer(),
            ],

            PROGRAM_ID
          );

      const predictionInfo =
        await connection
          .getAccountInfo(
            predictionPda,
            "confirmed"
          );

      if (predictionInfo) {
        const predictionAccount =
          await (
            program.account as any
          ).prediction.fetch(
            predictionPda
          );

        prediction = {
          address:
            predictionPda
              .toBase58(),

          direction:
            Number(
              predictionAccount
                .direction
            ) === 0
              ? "SUBE"
              : "BAJA",

          points:
            Number(
              predictionAccount
                .points
                .toString()
            ),
        };
      }
    }

    /*
     * ===========================
     * RESULTADO
     * ===========================
     */

    const [
      resultPda,
    ] =
      PublicKey
        .findProgramAddressSync(
          [
            Buffer.from(
              "round_result"
            ),

            round.toBuffer(),
          ],

          PROGRAM_ID
        );

    const resultInfo =
      await connection
        .getAccountInfo(
          resultPda,
          "confirmed"
        );

    let result = null;

    if (resultInfo) {
      const resultAccount =
        await (
          program.account as any
        ).roundResult.fetch(
          resultPda
        );

      result = {
        address:
          resultPda
            .toBase58(),

        openingPrice:
          Number(
            resultAccount
              .openingPrice
              .toString()
          ),

        closingPrice:
          Number(
            resultAccount
              .closingPrice
              .toString()
          ),

        closingPriceTimestamp:
          Number(
            resultAccount
              .closingPriceTimestamp
              .toString()
          ),

        outcome:
          Number(
            resultAccount
              .outcome
          ) === 0
            ? "SUBE"
            : Number(
                resultAccount
                  .outcome
              ) === 1
              ? "BAJA"
              : "VOID",
      };
    }

    /*
     * ===========================
     * RELOJ DE SOLANA
     * ===========================
     */

    const slot =
      await connection.getSlot(
        "confirmed"
      );

    const chainTime =
      await connection.getBlockTime(
        slot
      );

    return Response.json(
      {
        ok: true,

        network:
          "devnet",

        round: {
          address:
            round.toBase58(),

          market:
            roundAccount.market,

          roundId:
            roundAccount.roundId
              .toString(),

          authority:
            roundAccount.authority
              .toBase58(),

          openingPrice:
            Number(
              roundAccount
                .openingPrice
                .toString()
            ),

          openingPriceTimestamp:
            Number(
              roundAccount
                .openingPriceTimestamp
                .toString()
            ),

          closingTime,

          isOpen:
            chainTime !== null
              ? chainTime <
                closingTime
              : null,
        },

        wallet:
          wallet
            ? wallet.toBase58()
            : null,

        prediction,

        result,

        chainTime,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {

    console.error(
      "V2_STATE_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not retrieve the Devnet state.",
      },
      {
        status: 500,
      }
    );
  }
}
