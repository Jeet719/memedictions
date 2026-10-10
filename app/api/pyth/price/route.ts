import { HermesClient } from "@pythnetwork/hermes-client";
import { DOGE_FEED } from "@/lib/pyth-market";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Quote = { price: number; publishTime: number };
let cached: { quote: Quote; fetchedAt: number } | undefined;
let pending: Promise<Quote> | undefined;

export async function GET() {
  const key = process.env.PYTH_API_KEY;
  if (!key) return Response.json({ ok: false, error: "The price chart is not configured yet." }, { status: 503 });
  try {
    if (!cached || Date.now() - cached.fetchedAt >= 4000) {
      pending ??= (async () => {
        const client = new HermesClient("https://pyth.dourolabs.app/hermes", { accessToken: key, timeout: 6000 });
        const update = await client.getLatestPriceUpdates([DOGE_FEED], { parsed: true });
        const price = update.parsed?.find(p => p.id.replace(/^0x/, "") === DOGE_FEED.slice(2))?.price;
        if (!price || price.expo !== -8 || !Number.isSafeInteger(price.publish_time)) throw new Error("Invalid quote");
        const value = Number(price.price) / 1e8;
        if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid quote");
        const quote = { price: value, publishTime: price.publish_time };
        cached = { quote, fetchedAt: Date.now() };
        return quote;
      })();
      try { await pending; } finally { pending = undefined; }
    }
    return Response.json({ ok: true, source: "Pyth", market: "DOGEUSD", ...cached!.quote }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "Price updates are temporarily unavailable. Your prediction can still be submitted." }, { status: 503 });
  }
}
