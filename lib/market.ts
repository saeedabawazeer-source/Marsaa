/**
 * Saudi market data, via SAHMK (Tadawul-licensed).
 *
 * ── History, because it explains the shape of this file ────────────────────
 * v1 of the ticker was hardcoded strings drifting on a timer under a badge
 * reading LIVE. v2 replaced it with a real SAHMK call — but written against a
 * guessed response shape (`{tasi: {value}, gainers: []}`) that does not exist.
 * Every request silently failed the `ticks.length < 2` check and fell back, so
 * the live site showed INDICATIVE with a frozen TASI even though the key was
 * set correctly. This version is written against the documented schema:
 *
 *   GET /market/summary/?index=TASI
 *     → { index, is_delayed, timestamp, index_value, index_change,
 *         index_change_percent, total_volume, advancing, declining,
 *         unchanged, market_mood }
 *
 *   GET /market/gainers/?limit=6&index=TASI
 *     → { index, is_delayed, gainers: [{ symbol, name, name_en, price,
 *         change, change_percent, volume, updated_at }], count }
 *
 * ── The request budget is the design constraint ────────────────────────────
 * Free plan = 100 requests/day. This module makes TWO calls per refresh
 * (index summary + gainers) on a 30-minute window:
 *
 *     2 calls × 48 refreshes/day = 96 requests/day, inside the 100 limit.
 *
 * That is the whole budget. Adding NOMU as a third call would be 144/day and
 * the ticker would die every afternoon. If you want NOMU, either drop gainers
 * or move to the Starter plan — do not just add the call.
 *
 * ── Licensing ──────────────────────────────────────────────────────────────
 * SAHMK's terms: developer plans are "intended for development, internal
 * tools, and small-scale applications", and "large-scale public market data
 * platforms, commercial display services, or data redistribution may require
 * an enterprise agreement". A public ticker sits near that line — fine while
 * Marsa is small, worth a conversation with them before it is not. Reselling
 * or re-exposing the data as a feed is not permitted, which is why nothing
 * here is proxied to the browser as raw JSON.
 */

import type { MarketTick } from "./types";
import { getGlobalTicks } from "./globalTicks";

const BASE = process.env.SAHMK_BASE_URL ?? "https://api.sahmk.sa/api/v1";

/** 30 minutes. See the request-budget note above before changing this. */
const REVALIDATE = 1800;

export interface MarketSnapshot {
  ticks: MarketTick[];
  /** True when Tadawul numbers came from SAHMK rather than a static level. */
  live: boolean;
  delayed: boolean;
  fetchedAt: string;
  /** SAHMK's own read on breadth — "Bullish" / "Bearish" etc. Null if absent. */
  mood: string | null;
  advancing: number | null;
  declining: number | null;
}

/**
 * The riyal's peg is a fact, not a quote: SAMA has held 3.7500 to the dollar
 * since 1986. It is the one number safe to render without a feed behind it.
 */
const RIYAL_PEG: MarketTick = { label: "USD/SAR", value: "3.7500", direction: "flat" };

/**
 * Last-resort levels, shown ONLY when every source failed, and always under an
 * INDICATIVE badge. Deliberately minimal: an earlier version padded this with a
 * frozen "Brent $81.40" that kept rendering next to genuinely live values once
 * SAHMK started working — a fake number wearing a live badge. If we don't have
 * it, we don't show it.
 */
const FALLBACK: MarketTick[] = [RIYAL_PEG];

interface SahmkSummary {
  index?: string;
  is_delayed?: boolean;
  index_value?: number;
  index_change?: number;
  index_change_percent?: number;
  advancing?: number;
  declining?: number;
  market_mood?: string;
}

interface SahmkMover {
  symbol?: string;
  name_en?: string;
  price?: number;
  change?: number;
  change_percent?: number;
}

interface SahmkGainers {
  is_delayed?: boolean;
  gainers?: SahmkMover[];
}

function direction(change?: number): MarketTick["direction"] {
  if (typeof change !== "number" || Math.abs(change) < 0.0001) return "flat";
  return change > 0 ? "up" : "down";
}

function num(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

async function sahmk<T>(path: string, key: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      headers: { "X-API-Key": key, accept: "application/json" },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getMarketSnapshot(timeoutMs = 6000): Promise<MarketSnapshot> {
  const key = process.env.SAHMK_API_KEY;
  const fetchedAt = new Date().toISOString();

  // Global context runs on its own key and its own budget, so a SAHMK outage
  // must not take gold and the dollar crosses down with it, and vice versa.
  const [globalTicks, summary, movers] = await Promise.all([
    getGlobalTicks(timeoutMs),
    key ? sahmk<SahmkSummary>("/market/summary/?index=TASI", key, timeoutMs) : Promise.resolve(null),
    key ? sahmk<SahmkGainers>("/market/gainers/?limit=6&index=TASI", key, timeoutMs) : Promise.resolve(null),
  ]);

  const ticks: MarketTick[] = [];

  if (typeof summary?.index_value === "number") {
    ticks.push({
      label: "TASI",
      value: num(summary.index_value, 2),
      direction: direction(summary.index_change ?? summary.index_change_percent),
    });
  }

  for (const m of movers?.gainers ?? []) {
    if (!m.symbol || typeof m.price !== "number") continue;
    ticks.push({
      label: m.symbol,
      value: num(m.price),
      direction: direction(m.change ?? m.change_percent),
    });
  }

  const live = ticks.length > 0;

  // The peg belongs next to the Saudi numbers; global crosses follow it.
  ticks.push(RIYAL_PEG, ...globalTicks);

  if (!live && globalTicks.length === 0) {
    return {
      ticks: FALLBACK,
      live: false,
      delayed: true,
      fetchedAt,
      mood: null,
      advancing: null,
      declining: null,
    };
  }

  return {
    ticks,
    live,
    delayed: (summary?.is_delayed ?? movers?.is_delayed) !== false,
    fetchedAt,
    mood: summary?.market_mood ?? null,
    advancing: typeof summary?.advancing === "number" ? summary.advancing : null,
    declining: typeof summary?.declining === "number" ? summary.declining : null,
  };
}
