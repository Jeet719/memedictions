import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  BN,
  Program,
} from "@coral-xyz/anchor";

import idl from "@/lib/idl/memedictions_v2_devnet.json";

export const dynamic =
  "force-dynamic";

const PROGRAM_ID =
  new PublicKey(
    (idl as any).address
  );

const DEVNET_RPC =
  process.env.SOLANA_DEVNET_RPC_URL ||
  "https://api.devnet.solana.com";

interface PrepareRequest {
  round: string;
  user: string;
  direction:
    | "SUBE"
    | "BAJA";
  points: number;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as PrepareRequest;

    if (
      !body.round ||
      !body.user ||
      ![
        "SUBE",
        "BAJA",
      ].includes(
        body.direction
      ) ||
      !Number.isSafeInteger(
        body.points
      ) ||
      body.points < 1 ||
      body.points > 10000
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Datos de predicción inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    const round =
      new PublicKey(
        body.round
      );

    const user =
      new PublicKey(
        body.user
      );

    const connection =
      new Connection(
        DEVNET_RPC,
        "confirmed"
      );

    const programInfo =
      await connection
        .getAccountInfo(
          PROGRAM_ID,
          "confirmed"
        );

    if (
      !programInfo?.executable
    ) {
      return Response.json(
        {
          ok: false,

          code:
            "V2_DEVNET_PROGRAM_NOT_DEPLOYED",

          error:
            "El contrato Memedictions todavía no está desplegado en Solana Devnet.",

          programId:
            PROGRAM_ID
              .toBase58(),

          rpc:
            DEVNET_RPC,
        },
        {
          status: 409,
        }
      );
    }

    const program =
      new Program(
        idl as any,
        {
          connection,
        } as any
      );

    const roundAccount =
      await (
        program.account as any
      ).round.fetch(
        round
      );

    const slot =
      await connection.getSlot(
        "confirmed"
      );

    const chainTime =
      await connection.getBlockTime(
        slot
      );

    if (
      chainTime === null
    ) {
      throw new Error(
        "No se pudo obtener el reloj de Solana Devnet."
      );
    }

    const closingTime =
      Number(
        roundAccount
          .closingTime
          .toString()
      );

    if (
      chainTime >=
      closingTime
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "La ronda ya terminó según el reloj de Solana.",
        },
        {
          status: 400,
        }
      );
    }

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

            user.toBuffer(),
          ],

          PROGRAM_ID
        );

    const existing =
      await connection
        .getAccountInfo(
          predictionPda,
          "confirmed"
        );

    if (existing) {
      return Response.json(
        {
          ok: false,

          error:
            "Esta wallet ya tiene una predicción en esta ronda.",
        },
        {
          status: 409,
        }
      );
    }

    const direction =
      body.direction ===
      "SUBE"
        ? 0
        : 1;

    const instruction =
      await program.methods
        .submitPrediction(
          direction,
          new BN(
            body.points
          )
        )
        .accountsPartial({
          round,

          prediction:
            predictionPda,

          user,

          systemProgram:
            SystemProgram.programId,
        })
        .instruction();

    const {
      blockhash,
      lastValidBlockHeight,
    } =
      await connection
        .getLatestBlockhash(
          "confirmed"
        );

    const transaction =
      new Transaction({
        feePayer:
          user,

        recentBlockhash:
          blockhash,
      }).add(
        instruction
      );

    const serialized =
      transaction.serialize({
        requireAllSignatures:
          false,

        verifySignatures:
          false,
      });

    return Response.json({
      ok: true,

      network:
        "devnet",

      rpc:
        DEVNET_RPC,

      programId:
        PROGRAM_ID
          .toBase58(),

      transaction:
        serialized.toString(
          "base64"
        ),

      predictionAddress:
        predictionPda
          .toBase58(),

      blockhash,

      lastValidBlockHeight,

      market:
        roundAccount.market,

      chainTime,

      closingTime,
    });

  } catch (error) {
    console.error(
      "V2_DEVNET_PREPARE_PREDICTION_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "No se pudo preparar la predicción en Devnet.",
      },
      {
        status: 500,
      }
    );
  }
}