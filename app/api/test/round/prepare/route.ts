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

interface PrepareRoundRequest {
  authority: string;
  market: string;
  durationSeconds: number;
  openingPrice: number;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json() as PrepareRoundRequest;

    if (
      !body.authority ||
      !/^[A-Z0-9]{2,16}$/.test(
        body.market
      ) ||
      !Number.isSafeInteger(
        body.durationSeconds
      ) ||
      body.durationSeconds < 60 ||
      body.durationSeconds > 604800 ||
      !Number.isSafeInteger(
        body.openingPrice
      ) ||
      body.openingPrice <= 0
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "Invalid Devnet round data.",
        },
        {
          status: 400,
        }
      );
    }

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
     * Antes de preparar nada,
     * confirmamos que el contrato
     * realmente exista en Devnet.
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

    /*
     * El contrato espera:
     *
     * seeds = [
     *   b"round",
     *   authority,
     *   round_id.to_le_bytes()
     * ]
     */
    const roundId =
      new BN(
        Date.now()
      );

    const closingTime =
      new BN(
        chainTime +
          body.durationSeconds
      );

    const [
      roundPda,
    ] =
      PublicKey
        .findProgramAddressSync(
          [
            Buffer.from(
              "round"
            ),

            authority.toBuffer(),

            roundId.toArrayLike(
              Buffer,
              "le",
              8
            ),
          ],

          PROGRAM_ID
        );

    const existingRound =
      await connection
        .getAccountInfo(
          roundPda,
          "confirmed"
        );

    if (existingRound) {
      return Response.json(
        {
          ok: false,
          error:
            "The derived round account already exists.",
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

    console.log(
      "V2_ROUND_TIME_DEBUG",
      {
        chainTime,
        durationSeconds:
          body.durationSeconds,
        closingTime:
          Number(
            closingTime.toString()
          ),
        difference:
          Number(
            closingTime.toString()
          ) - chainTime,
      }
    );

    const instruction =
      await program.methods
        .initializeRound(
          roundId,
          body.market,
          closingTime,
          new BN(body.openingPrice),
          new BN(chainTime)
        )
        .accountsPartial({
          round:
            roundPda,

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
     * Phantom será el fee payer
     * y también la authority.
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

    /*
     * Se devuelve SIN firmar.
     * La firma ocurre en Phantom.
     */
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

      authority:
        authority
          .toBase58(),

      market:
        body.market,

      roundId:
        roundId.toString(),

      roundAddress:
        roundPda
          .toBase58(),

      chainTime,

      closingTime:
        Number(
          closingTime
            .toString()
        ),

      transaction:
        serialized.toString(
          "base64"
        ),

      blockhash,

      lastValidBlockHeight,
    });

  } catch (error) {
    console.error(
      "V2_DEVNET_PREPARE_ROUND_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not prepare the Devnet round.",
      },
      {
        status: 500,
      }
    );
  }
}