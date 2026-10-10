export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode");
  if (mode !== "pyth" && mode !== "manual") {
    return Response.json({ ok: false, error: "Invalid demo mode." }, { status: 400 });
  }
  const programId = mode === "pyth" ? "7Smr7aaiTiXquYeRYqGnweNoTNKMHoqtvAKQYhcJudRC" : "6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy";
  try {
    const response = await fetch(process.env.SOLANA_DEVNET_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com", {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getAccountInfo", params: [programId, { encoding: "base64", commitment: "confirmed" }] }),
    });
    const data = await response.json();
    if (!response.ok || data.error || !data.result || !("value" in data.result)) throw new Error("RPC unavailable");
    const account = data.result.value;
    if (account !== null && typeof account?.executable !== "boolean") throw new Error("Invalid account");
    return Response.json({ ok: true, deployed: account?.executable === true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "Could not check the contract. Solana Devnet is temporarily unavailable." }, { status: 503 });
  }
}
