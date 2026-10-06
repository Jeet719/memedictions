import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
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

interface CloseRoundRequest {
  round: string;
  authority: string;
  closingPrice: number;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as CloseRoundRequest;

    if (
      !body.round ||
      !body.authority ||
      !Number.isSafeInteger(
        body.closingPrice
      ) ||
      body.closingPrice <= 0
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Invalid Devnet resolution data.",
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

    const authority =
      new PublicKey(
        body.authority
      );

    const connection =
      new Connection(
        DEVNET_RPC,
        "confirmed"
      );

    /*
     * Confirmamos primero que
     * Memedictions exista realmente
     * en Devnet.
     */
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
            "The Memedictions program is not deployed on Solana Devnet.",

          programId:
            PROGRAM_ID.toBase58(),

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

    /*
     * Leemos la ronda real desde
     * Devnet.
     */
    const roundAccount =
      await (
        program.account as any
      ).round.fetch(
        round
      );

    /*
     * Solamente la autoridad que
     * creó la ronda puede cerrarla.
     */
    if (
      roundAccount.authority
        .toBase58() !==
      authority.toBase58()
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "This wallet is not the round authority.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Leemos directamente el Clock Sysvar.
     * Es la misma fuente temporal que utiliza
     * Clock::get()?.unix_timestamp dentro
     * del contrato Anchor.
     */
    const clockAccount =
      await connection.getAccountInfo(
        SYSVAR_CLOCK_PUBKEY,
        "confirmed"
      );

    if (
      !clockAccount ||
      clockAccount.data.length < 40
    ) {
      throw new Error(
        "Could not retrieve the Solana Devnet Clock sysvar."
      );
    }

    const chainTime =
      Number(
        clockAccount.data.readBigInt64LE(
          32
        )
      );

    const closingTime =
      Number(
        roundAccount
          .closingTime
          .toString()
      );

    /*
     * No permitimos resolver antes
     * de que termine la ronda según
     * el reloj de Solana.
     */
    if (
      chainTime <
      closingTime
    ) {
      return Response.json(
        {
          ok: false,

          code:
            "ROUND_NOT_FINISHED",

          error:
            "The round has not ended yet.",

          chainTime,

          closingTime,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * El contrato utiliza:
     *
     * seeds = [
     *   b"round_result",
     *   round
     * ]
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

    const existingResult =
      await connection
        .getAccountInfo(
          resultPda,
          "confirmed"
        );

    if (
      existingResult
    ) {
      return Response.json(
        {
          ok: false,

          code:
            "ROUND_ALREADY_RESOLVED",

          error:
            "This round already has an on-chain result.",

          resultAddress:
            resultPda.toBase58(),
        },
        {
          status: 409,
        }
      );
    }

    const instruction =
      await program.methods
        .closeRound(
          new BN(
            body.closingPrice
          ),
          new BN(
            closingTime
          )
        )
        .accountsPartial({
          round,

          roundResult:
            resultPda,

          authority,

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

    /*
     * Phantom será:
     *
     * - authority
     * - fee payer
     *
     * Esta transacción todavía
     * NO está firmada.
     */
    const transaction =
      new Transaction({
        feePayer:
          authority,

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
        PROGRAM_ID.toBase58(),

      roundAddress:
        round.toBase58(),

      resultAddress:
        resultPda.toBase58(),

      authority:
        authority.toBase58(),
    closingPrice:
      body.closingPrice,

    closingPriceTimestamp:
      closingTime,

      chainTime,

      closingTime,

      transaction:
        serialized.toString(
          "base64"
        ),

      blockhash,

      lastValidBlockHeight,
    });

  } catch (error) {
    console.error(
      "V2_DEVNET_PREPARE_CLOSE_ROUND_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not prepare the Devnet round resolution.",
      },
      {
        status: 500,
      }
    );
  }
}