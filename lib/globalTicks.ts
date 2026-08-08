/**
 * Global market context, via Twelve Data.
 *
 * SAHMK covers Tadawul. It has no reason to carry the S&P 500, Nasdaq, gold,
 * crude, or the dollar's cross rates — but a Gulf business reader checking
 * markets at 7am wants those on the same strip. Twelve Data fills that gap.
 *
 * ── The request budget is the same kind of constraint as SAHMK ─────────────
 * Free plan: 800 API credits/day, 8 credits/minute. A `/quote` call with N
 * symbols in one request costs N credits (not 1) — Twelve Data bills per
 * symbol, not per HTTP call. Five symbols on a 15-minute revalidate window:
 *
 *     5 symbols x 4 calls/hour x 24h = 480 credits/day, inside the 800 limit.
 *
 * That leaves headroom; it is not pushed to the ceiling on purpose, since
 * this budget is shared with anything else built on the same key later.
 *
 * Same rule as SAHMK: never proxy the raw response to the browser, never
 * loop per-symbol requests (that is how a per-minute credit cap gets hit),
 * and degrade to nothing (not a fabricated number) when unkeyed or failing.
 */

import type { MarketTick } from "./types";

const BASE = "https://api.twelvedata.com";

// Five symbols, chosen for what a Gulf business reader actually checks
// alongside Tadawul: the two US benchmarks, gold, Brent crude, and the euro
// cross (the dollar leg against the riyal is already the fixed peg above).
const SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: "SPX", label: "S&P 500" },
  { symbol: "IXIC", label: "Nasdaq" },
  { symbol: "XAU/USD", label: "Gold" },
  { symbol: "WTI/USD", label: "WTI" },
  { symbol: "EUR/USD", label: "EUR/USD" },
];

interface TwelveDataQuote {
  symbol?: string;
  close?: string;
  percent_change?: string;
  status?: string;
}

function direction(pct?: string): MarketTick["direction"] {
  const n = pct ? parseFloat(pct) : NaN;
  if (!Number.isFinite(n) || Math.abs(n) < 0.001) return "flat";
  return n > 0 ? "up" : "down";
}

function fmt(close?: string): string | null {
  const n = close ? parseFloat(close) : NaN;
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * One batched call, once per revalidate window. Returns [] (never fabricated
 * data) if unkeyed, timed out, or the response doesn't parse.
 */
export async function getGlobalTicks(timeoutMs = 6000): Promise<MarketTick[]> {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const symbolParam = SYMBOLS.map((s) => s.symbol).join(",");
    const res = await fetch(
      `${BASE}/quote?symbol=${encodeURIComponent(symbolParam)}&apikey=${key}`,
      {
        signal: controller.signal,
        // 15 minutes: same cadence as SAHMK, keeps the day's credit spend at
        // roughly 480 rather than chasing a real-time refresh this budget
        // can't afford.
        next: { revalidate: 900 },
      },
    );

    if (!res.ok) return [];

    const data = (await res.json()) as Record<string, TwelveDataQuote> | TwelveDataQuote;

    // Twelve Data returns one flat quote object for a single symbol and a
    // symbol-keyed map for multiple — normalise to an array either way.
    const quotes: TwelveDataQuote[] =
      "symbol" in data && typeof (data as TwelveDataQuote).symbol === "string"
        ? [data as TwelveDataQuote]
        : Object.values(data as Record<string, TwelveDataQuote>);

    const ticks: MarketTick[] = [];
    for (const meta of SYMBOLS) {
      const q = quotes.find((q) => q.symbol === meta.symbol);
      if (!q || q.status === "error") continue;
      const value = fmt(q.close);
      if (!value) continue;
      ticks.push({ label: meta.label, value, direction: direction(q.percent_change) });
    }
    return ticks;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
