"use client";

import { useEffect, useId, useRef, useState } from "react";
import DogeIcon from "./doge-icon";

type Sample = { price: number; publishTime: number };
const usd = (value: number) => `$${value.toFixed(8)}`;
const utc = (time: number) => new Date(time * 1000).toISOString().slice(11, 19);

export default function PythPriceChart({ openingPrice, expanded }: { openingPrice?: number; expanded?: boolean }) {
  const [localOpen, setOpen] = useState(false);
  const open = expanded ?? localOpen;
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState("");
  const [age, setAge] = useState(0);
  const [selectedQuote, setSelectedQuote] = useState<Sample>();
  const hadOpeningPrice = useRef(false);
  const chartId = useId();
  const latest = samples[samples.length - 1];

  useEffect(() => {
    if (openingPrice && openingPrice > 0) hadOpeningPrice.current = true;
    else if (hadOpeningPrice.current) {
      setSelectedQuote(undefined);
      hadOpeningPrice.current = false;
    }
  }, [openingPrice]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    async function poll() {
      if (cancelled) return;
      const startedAt = performance.now();
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 8000);
      try {
        const response = await fetch("/api/pyth/price", { cache: "no-store", signal: controller.signal });
        const quote = await response.json();
        if (!response.ok || !quote.ok || !Number.isFinite(quote.price) || quote.price <= 0 || !Number.isSafeInteger(quote.publishTime)) throw new Error("Quote unavailable");
        if (!cancelled) {
          setError("");
          setSamples(previous => {
            const last = previous[previous.length - 1];
            if (last && quote.publishTime <= last.publishTime) return previous;
            return [...previous, { price: quote.price, publishTime: quote.publishTime }].slice(-180);
          });
        }
      } catch {
        if (!cancelled) setError("Price updates are unavailable. You can still submit your prediction.");
      } finally {
        clearTimeout(timeout);
        // Start-to-start cadence; never overlap requests or add 5s to provider latency.
        if (!cancelled) timer = setTimeout(poll, Math.max(250, 5000 - (performance.now() - startedAt)));
      }
    }
    void poll();
    return () => { cancelled = true; controller?.abort(); clearTimeout(timer); };
  }, [open]);

  useEffect(() => {
    if (!open || !latest) return;
    const tick = () => setAge(Math.floor(Date.now() / 1000) - latest.publishTime);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [open, latest]);

  const baseline = openingPrice && openingPrice > 0 ? openingPrice : undefined;
  const prices = [...samples.map(s => s.price), ...(baseline ? [baseline] : []), ...(selectedQuote ? [selectedQuote.price] : [])];
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 1;
  const padding = Math.max((max - min) * 0.18, max * 0.00002, 0.00000001);
  const low = min - padding, high = max + padding;
  const firstTime = samples[0]?.publishTime ?? 0;
  const lastTime = Math.max(firstTime + 30, latest?.publishTime ?? 0);
  const x = (time: number) => 100 + (time - firstTime) / (lastTime - firstTime) * 510;
  const y = (price: number) => 20 + (high - price) / (high - low) * 160;
  // Break the line across gaps; never invent a price for missing updates.
  const path = samples.map((sample, i) => `${i === 0 || sample.publishTime - samples[i - 1].publishTime > 20 ? "M" : "L"}${x(sample.publishTime)},${y(sample.price)}`).join(" ");

  return <div style={{ display: expanded === false ? "none" : undefined, margin: "18px 0", padding: 16, border: "1px solid rgba(167,139,250,.3)", borderRadius: 14, background: "rgba(10,8,20,.45)" }}>
    {expanded === undefined && <button type="button" aria-expanded={open} aria-controls={chartId} onClick={() => setOpen(value => !value)} style={{ color: "#c4b5fd", background: "transparent", border: 0, padding: "5px 0", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
      {open ? "Hide DOGE/USD chart ▴" : "View DOGE/USD chart ▾"}
    </button>}
    {open && <div id={chartId}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginTop: 12 }}>
        <strong style={{ display: "flex", alignItems: "center", gap: 8 }}><DogeIcon /> DOGE/USD · Pyth</strong>
        <span>{latest ? usd(latest.price) : "Loading price…"}</span>
      </div>
      {latest && <p style={{ color: age > 30 || age < -5 ? "#fbbf24" : "#a7f3d0", fontSize: 12 }}>
        {age > 30 ? `Delayed update · ${age}s old` : age < -5 ? "Price timestamp is ahead of your device clock" : `Latest update · ${Math.max(0, age)}s ago`} · {utc(latest.publishTime)} UTC
      </p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", margin: "12px 0" }}>
        <button type="button" disabled={!latest || age > 30 || age < -5 || !!error || !!baseline} onClick={() => latest && setSelectedQuote({ ...latest })} style={{ background: "#292039", border: "1px solid #a78bfa", color: "#ddd6fe", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>Mark current price</button>
        {selectedQuote && <><span style={{ color: "#67e8f9", fontSize: 13 }}>Selected quote: {usd(selectedQuote.price)} · {utc(selectedQuote.publishTime)} UTC</span><button type="button" onClick={() => setSelectedQuote(undefined)} style={{ background: "transparent", border: 0, color: "#c4b5fd", cursor: "pointer" }}>Clear marker</button></>}
      </div>
      {samples.length > 0 && <svg viewBox="0 0 640 230" role="img" aria-label="DOGE/USD prices observed from Pyth while this chart is open" style={{ width: "100%", display: "block" }}>
        {[0, 0.5, 1].map(fraction => {
          const value = high - fraction * (high - low), position = y(value);
          return <g key={fraction}><line x1="100" x2="610" y1={position} y2={position} stroke="#373044" /><text x="94" y={position + 4} textAnchor="end" fill="#b8b1c7" fontSize="11">{usd(value)}</text></g>;
        })}
        {baseline && <g><line x1="100" x2="610" y1={y(baseline)} y2={y(baseline)} stroke="#fbbf24" strokeDasharray="6 4" /><text x="610" y={Math.max(12, y(baseline) - 7)} textAnchor="end" fill="#fbbf24" fontSize="11">Round opening</text></g>}
        {selectedQuote && <g><line x1="100" x2="610" y1={y(selectedQuote.price)} y2={y(selectedQuote.price)} stroke="#67e8f9" strokeDasharray="3 4" /><text x="105" y={Math.min(194, y(selectedQuote.price) + 14)} fill="#67e8f9" fontSize="11">Selected quote · {usd(selectedQuote.price)}</text></g>}
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
        {latest && <circle cx={x(latest.publishTime)} cy={y(latest.price)} r="4" fill="#a7f3d0" />}
        <text x="100" y="211" fill="#b8b1c7" fontSize="11">{utc(firstTime)} UTC</text>
        {samples.length > 1 && <text x="610" y="211" textAnchor="end" fill="#b8b1c7" fontSize="11">{utc(latest.publishTime)} UTC</text>}
      </svg>}
      {samples.length === 1 && <p style={{ color: "#b8b1c7", fontSize: 12 }}>Collecting price samples. The line appears as new updates arrive.</p>}
      {error && <p role="status" style={{ color: "#fbbf24", fontSize: 13 }}>{error}</p>}
      <p style={{ color: "#b8b1c7", fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>New prices are checked about every 5 seconds while this chart is open, up to 180 samples. Updates may take longer when the connection or price source is delayed. Historical prices before opening are not loaded. This is a reference chart; the official opening and closing prices are verified on-chain.</p>
      <p style={{ color: "#b8b1c7", fontSize: 12, lineHeight: 1.6 }}>The cyan marker records your selected quote for reference. It does not place an order or lock an entry price. The yellow line marks the confirmed round opening price, which may differ from your selected quote.</p>
    </div>}
  </div>;
}
