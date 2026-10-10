import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { chainClock, oracleRoundPda, preparePriceBatch, pythConnection, pythError, pythProgram, PythRequestError } from "@/lib/pyth-round";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.market !== "DOGEUSD" || ![120, 180, 300].includes(body.durationSeconds) || typeof body.authority !== "string") {
      throw new PythRequestError("Choose DOGE/USD and a supported round duration.", "INVALID_ROUND", 400);
    }
    const combined = body.prediction !== undefined;
    if (combined && (!body.prediction || !["SUBE", "BAJA"].includes(body.prediction.direction) ||
        !Number.isSafeInteger(body.prediction.points) || body.prediction.points < 1 || body.prediction.points > 10000)) {
      throw new PythRequestError("Choose UP or DOWN and between 1 and 10,000 fictitious PTS.", "INVALID_PREDICTION", 400);
    }
    const authority = new PublicKey(body.authority);
    const connection = pythConnection();
    const roundId = new BN(Date.now());
    const round = oracleRoundPda(authority, roundId);
    const closingTime = await chainClock(connection) + body.durationSeconds;
    const program = pythProgram(connection);
    const prediction = PublicKey.findProgramAddressSync([
      Buffer.from("prediction"), round.toBuffer(), authority.toBuffer(),
    ], program.programId)[0];
    const batch = await preparePriceBatch(connection, authority, async priceUpdate => {
      const initialize = await program.methods
        .initializeRound(roundId, "DOGEUSD", new BN(closingTime))
        .accountsStrict({ round, authority, priceUpdate, systemProgram: SystemProgram.programId }).instruction();
      if (!combined) return initialize;
      const submit = await program.methods
        .submitPrediction(body.prediction.direction === "SUBE" ? 0 : 1, new BN(body.prediction.points))
        .accountsStrict({ round, prediction, user: authority, systemProgram: SystemProgram.programId }).instruction();
      return [initialize, submit];
    });
    return Response.json({ ok: true, ...batch, roundAddress: round.toBase58(), roundId: roundId.toString(), closingTime, openingPrice: batch.price,
      predictionAddress: combined ? prediction.toBase58() : undefined });
  } catch (error) { return pythError(error); }
}
