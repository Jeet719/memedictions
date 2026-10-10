import { chainClock, pythConnection } from "@/lib/pyth-round";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ ok: true, chainTime: await chainClock(pythConnection()) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "Solana Devnet clock unavailable." }, { status: 503 });
  }
}
