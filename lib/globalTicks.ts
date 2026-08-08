/**
 * Global market context, via Twelve Data.
 *
 * SAHMK covers Tadawul and has no reason to carry Wall Street, gold, or the
 * dollar crosses — but a Gulf business reader checking markets at 7am wants
 * those on the same strip. Twelve Data fills that gap.
 *
 * ── Why these symbols and not the obvious ones ─────────────────────────────
 * The first version asked for SPX, IXIC and WTI/USD. Gold and EUR/USD came
 * back; the other three silently did not, because index and commodity feeds
 * are licensed products that the free plan does not carry — forex, crypto,
 * US equities and ETFs are what it does carry.
 *
 * So the index exposure here is via the ETFs that track them, and they are
 * labelled with their own tickers rather than dressed up as the index. SPY is
 * not the S&P 500; it is a fund that tracks it, and the two do not print the
 * same number. Anyone who reads a ticker strip knows SPY, QQQ and BNO on
 * sight, and mislabelling them to look more impressive is exactly the kind of
 * thing this codebase keeps having to undo.
 *
 * ── Budget ─────────────────────────────────────────────────────────────────
 * Free plan: 800 credits/day, 8/minute. A `/quote` call with N symbols costs
 * N credits — Twelve Data bills per symbol, not per HTTP request. Six symbols
 * on the same 30-minute window as SAHMK:
 *
 *     6 symbols × 48 refreshes/day = 288 credits/day, inside the 800 limit.
 *
 * Symbols that fail are skipped, never substituted or invented.
 */

import type { MarketTick } from "./types";

const BASE = "https://api.twelvedata.com";

/** Matches lib/market.ts. See the budget note above before changing. */
const REVALIDATE = 1800;

const SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: "SPY", label: "SPY" }, // S&P 500 tracker
  { symbol: "QQQ", label: "QQQ" }, // Nasdaq 100 tracker
  { symbol: "BNO", label: "BNO" }, // Brent crude tracker
  { symbol: "XAU/USD", label: "Gold" },
  { symbol: "EUR/USD", label: "EUR/USD" },
  { symbol: "GBP/USD", label: "GBP/USD" },
];

interface TwelveDataQuote {
  symbol?: string;
  close?: string;
  percent_change?: string;
  status?: string;
  code?: number;
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
 * One batched call per refresh. Returns [] — never fabricated data — if the
 * key is unset, the request fails, or the response does not parse.
 */
export async function getGlobalTicks(timeoutMs = 6000): Promise<MarketTick[]> {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const symbolParam = SYMBOLS.map((s) => s.symbol).join(",");
    const res = await fetch(`${BASE}/quote?symbol=${encodeURIComponent(symbolParam)}&apikey=${key}`, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as Record<string, TwelveDataQuote> | TwelveDataQuote;

    // Twelve Data returns a flat quote object for one symbol and a symbol-keyed
    // map for several. Normalise to a lookup either way.
    const bySymbol = new Map<string, TwelveDataQuote>();
    if (data && typeof (data as TwelveDataQuote).symbol === "string") {
      const q = data as TwelveDataQuote;
      bySymbol.set(q.symbol as string, q);
    } else {
      for (const [k, v] of Object.entries(data as Record<string, TwelveDataQuote>)) {
        if (v && typeof v === "object") bySymbol.set(v.symbol ?? k, v);
      }
    }

    const ticks: MarketTick[] = [];
    for (const meta of SYMBOLS) {
      const q = bySymbol.get(meta.symbol);
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
