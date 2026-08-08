"use client";

import { useEffect, useState } from "react";
import type { MarketTick } from "@/lib/types";

/**
 * The market strip.
 *
 * Three versions of this component have now existed, and the history is the
 * point:
 *
 *   1. Hardcoded strings scrolling under a badge reading `LIVE*`, with an
 *      asterisk that resolved to nothing anywhere on the site.
 *   2. The same hardcoded strings, but nudged by a timer so they *looked* like
 *      a feed. That was worse. A price that moves on its own in the browser is
 *      a fabricated price, and a business audience is exactly the audience that
 *      checks. The riyal was drifting off its dollar peg on screen.
 *   3. This one: real numbers from SAHMK, who are licensed by Tadawul, fetched
 *      server-side and rendered as given.
 *
 * There is deliberately no client-side animation of values left. Numbers change
 * when the server refetches, and not otherwise. The only thing that moves is
 * the marquee, which is transport, not data.
 *
 * The badge tells the truth about provenance: `TADAWUL · 15-MIN` when the
 * licensed feed answered, `INDICATIVE` when it did not and these are the static
 * reference levels instead. A reader should never have to guess which they are
 * looking at.
 */

const DIRECTION_STYLES: Record<MarketTick["direction"], string> = {
  up: "text-[#6bd08a]",
  down: "text-[#e08a8a]",
  flat: "text-paper/70",
};
const ARROW: Record<MarketTick["direction"], string> = { up: "▲", down: "▼", flat: "·" };

export function LiveTicker({
  ticks,
  lang = "en",
  live = false,
}: {
  ticks: MarketTick[];
  lang?: "en" | "ar";
  /** True when the values came from the licensed feed rather than the fallback. */
  live?: boolean;
}) {
  const isAr = lang === "ar";
  const [clock, setClock] = useState<string | null>(null);

  // The clock is the one honest live element: it says when the page's data was
  // rendered, not that the prices are ticking.
  useEffect(() => {
    const fmt = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);

  if (ticks.length === 0) return null;

  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center gap-7 pr-7" aria-hidden={keyPrefix === "b"}>
      {ticks.map((t) => (
        <span key={`${keyPrefix}-${t.label}`} className="tabular-nums">
          <b className="mr-1.5 text-accent-light">{t.label}</b>
          <span>{t.value}</span> <span className={DIRECTION_STYLES[t.direction]}>{ARROW[t.direction]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      dir="ltr"
      className="flex items-center gap-3 overflow-hidden border-b-2 border-accent bg-ink px-3 py-2 font-mono text-[13px] font-medium text-paper"
    >
      <span
        className="flex shrink-0 items-center gap-1.5 pl-1"
        title={live ? "Tadawul-licensed data, delayed 15 minutes" : "Indicative reference levels"}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-[#6bd08a]" : "bg-accent"}`} />
        <span className={`text-[10px] font-bold tracking-wide ${live ? "text-[#6bd08a]" : "text-accent"}`}>
          {live ? (isAr ? "تداول · مؤجل ١٥د" : "TADAWUL · 15-MIN") : isAr ? "إرشادي" : "INDICATIVE"}
        </span>
        {/* suppressHydrationWarning: clock is client-only by design, so the
            server's markup and the first client paint will not match. */}
        <span suppressHydrationWarning className="hidden text-[10px] tabular-nums text-paper/45 sm:inline">
          {isAr ? "حتى" : "as of"} {clock ?? "--:--"}
        </span>
      </span>

      <div className="flex w-full overflow-hidden">
        <div className="flex shrink-0 animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
          {row("a")}
          {row("b")}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
