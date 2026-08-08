/**
 * Saudi market data, via SAHMK.
 *
 * SAHMK is Tadawul-licensed, which matters: the previous ticker was a set of
 * hardcoded strings drifting on a timer under a badge that said LIVE, and no
 * amount of styling makes invented prices acceptable on a business site. These
 * are real, licensed, exchange-sourced numbers.
 *
 * ── The request budget is the whole design constraint ──────────────────────
 * The free developer plan allows **100 requests per day**. A page revalidating
 * every 5 minutes burns 288 calls on a single endpoint — the quota would be
 * gone before mid-morning and the ticker would silently die every day around
 * 10am, which is worse than no ticker at all.
 *
 * So this module makes exactly ONE call per refresh (the market summary, not a
 * quote per symbol) and the pages that use it revalidate on a 15-minute window:
 *
 *     4 calls/hour × 24 = 96 requests/day, inside the 100 limit.
 *
 * 15 minutes is also exactly the delay on the free tier's prices, so caching
 * for that long costs nothing in freshness — we are never showing anything more
 * stale than SAHMK is willing to give us.
 *
 * ── Licensing ──────────────────────────────────────────────────────────────
 * SAHMK's developer terms say the developer plans are "intended for
 * development, internal tools, and small-scale applications", and that
 * "large-scale public market data platforms, commercial display services, or
 * data redistribution may require an enterprise agreement". Marsa displaying a
 * ticker publicly sits near that line. Fine while this is small; talk to them
 * before it is not. Reselling the data or re-exposing it as a feed is out.
 *
 * That is also why nothing here is proxied to the browser as raw JSON — the
 * data is rendered server-side into the page, never re-served as an API.
 */

import type { MarketTick } from "./types";
import { getGlobalTicks } from "./globalTicks";

const BASE = process.env.SAHMK_BASE_URL ?? "https://api.sahmk.sa/api/v1";

export interface MarketSnapshot {
  ticks: MarketTick[];
  /** True when the numbers came from SAHMK rather than the static fallback. */
  live: boolean;
  delayed: boolean;
  fetchedAt: string;
}

/**
 * Shown when no key is configured or SAHMK is unreachable.
 *
 * These are clearly-labelled reference levels, not a simulated feed: they do
 * not move, they are marked indicative in the UI, and the pegged riyal sits
 * still because it is pegged. A frozen honest number beats a moving invented
 * one.
 */
const FALLBACK: MarketTick[] = [
  { label: "TASI", value: "11,842.3", direction: "flat" },
  { label: "Brent", value: "$81.40", direction: "flat" },
  { label: "USD/SAR", value: "3.7500", direction: "flat" },
];

interface SahmkQuote {
  symbol?: string;
  name_en?: string;
  name?: string;
  price?: number;
  change?: number;
  change_percent?: number;
  is_delayed?: boolean;
}

interface SahmkSummary {
  tasi?: { value?: number; change?: number; change_percent?: number };
  nomu?: { value?: number; change?: number; change_percent?: number };
  gainers?: SahmkQuote[];
  losers?: SahmkQuote[];
  is_delayed?: boolean;
}

function direction(change?: number): MarketTick["direction"] {
  if (typeof change !== "number" || Math.abs(change) < 0.0001) return "flat";
  return change > 0 ? "up" : "down";
}

function num(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * One call, once per revalidate window. Never called per-symbol in a loop —
 * that is how a 100/day budget disappears.
 */
export async function getMarketSnapshot(timeoutMs = 6000): Promise<MarketSnapshot> {
  const key = process.env.SAHMK_API_KEY;
  const fetchedAt = new Date().toISOString();

  // Global context (S&P 500, Nasdaq, gold, WTI, EUR/USD) rides on the same
  // strip regardless of whether SAHMK answers — it's a separate provider on
  // a separate budget, so one going down shouldn't take the other with it.
  const globalTicks = await getGlobalTicks(timeoutMs);

  if (!key) return { ticks: [...FALLBACK, ...globalTicks], live: false, delayed: true, fetchedAt };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}/market/summary/`, {
      signal: controller.signal,
      headers: { "X-API-Key": key, accept: "application/json" },
      // 15 minutes: matches the free tier's price delay and keeps the day's
      // request count at 96.
      next: { revalidate: 900 },
    });

    if (!res.ok) return { ticks: [...FALLBACK, ...globalTicks], live: false, delayed: true, fetchedAt };

    const data = (await res.json()) as SahmkSummary;
    const ticks: MarketTick[] = [];

    if (typeof data.tasi?.value === "number") {
      ticks.push({
        label: "TASI",
        value: num(data.tasi.value, 1),
        direction: direction(data.tasi.change ?? data.tasi.change_percent),
      });
    }
    if (typeof data.nomu?.value === "number") {
      ticks.push({
        label: "NOMU",
        value: num(data.nomu.value, 1),
        direction: direction(data.nomu.change ?? data.nomu.change_percent),
      });
    }

    // A few movers give the strip something that actually changes during the
    // session, and they come from the same single request.
    for (const q of [...(data.gainers ?? []).slice(0, 3), ...(data.losers ?? []).slice(0, 3)]) {
      if (!q.symbol || typeof q.price !== "number") continue;
      ticks.push({
        label: q.symbol,
        value: num(q.price),
        direction: direction(q.change ?? q.change_percent),
      });
    }

    // The riyal's dollar peg is a fact, not a quote.
    ticks.push({ label: "USD/SAR", value: "3.7500", direction: "flat" });

    if (ticks.length < 2) return { ticks: [...FALLBACK, ...globalTicks], live: false, delayed: true, fetchedAt };

    return { ticks: [...ticks, ...globalTicks], live: true, delayed: data.is_delayed !== false, fetchedAt };
  } catch {
    return { ticks: [...FALLBACK, ...globalTicks], live: false, delayed: true, fetchedAt };
  } finally {
    clearTimeout(timer);
  }
}
