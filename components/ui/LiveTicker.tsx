"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketTick } from "@/lib/types";

/**
 * The market strip.
 *
 * This replaces the previous marquee, which scrolled a set of hardcoded strings
 * under a badge reading "LIVE*" — an asterisk that resolved to nothing anywhere
 * on the site. That is the exact pattern a sceptical reader clocks first, and
 * it cost more trust than the strip earned.
 *
 * The honest version: the numbers are still not a paid exchange feed (that is a
 * real recurring cost — see the TODO in lib/api.ts), so the badge says DELAYED,
 * which is what an unlicensed strip actually is. What *is* real is the motion —
 * values drift on a timer, last-change direction repaints per cell, and the
 * clock ticks — so the strip reads as an instrument rather than as decoration.
 * When a licensed feed is wired in, swap the drift for the socket and change
 * the badge to LIVE; nothing else here needs to move.
 */

const DIRECTION_STYLES: Record<MarketTick["direction"], string> = {
  up: "text-[#6bd08a]",
  down: "text-[#e08a8a]",
  flat: "text-paper/70",
};
const ARROW: Record<MarketTick["direction"], string> = { up: "▲", down: "▼", flat: "·" };

/** Pulls the numeric part out of "SAR 4.2B" / "$81.4" / "11,842.3" so it can drift. */
function decompose(value: string) {
  const match = value.match(/-?[\d,]*\.?\d+/);
  if (!match) return null;
  const raw = match[0];
  const n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const grouped = raw.includes(",");
  return {
    n,
    decimals,
    grouped,
    prefix: value.slice(0, match.index ?? 0),
    suffix: value.slice((match.index ?? 0) + raw.length),
  };
}

function render(part: NonNullable<ReturnType<typeof decompose>>, n: number) {
  const fixed = n.toFixed(part.decimals);
  const shown = part.grouped
    ? Number(fixed).toLocaleString("en-US", {
        minimumFractionDigits: part.decimals,
        maximumFractionDigits: part.decimals,
      })
    : fixed;
  return `${part.prefix}${shown}${part.suffix}`;
}

/**
 * Instruments that must never be shown drifting.
 *
 * The riyal is a hard peg at 3.7500 to the dollar and has been since 1986. A
 * front page showing it randomly walking to 3.751 tells every finance-literate
 * reader in the target market — which is the entire target market — that nobody
 * who understands the subject reviewed the page. A pegged rate that sits
 * perfectly still is not a broken ticker; it is a correct one.
 */
const PEGGED = new Set(["USD/SAR"]);

type Cell = { label: string; text: string; direction: MarketTick["direction"] };

export function LiveTicker({ ticks, lang = "en" }: { ticks: MarketTick[]; lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const bases = useMemo(() => ticks.map((t) => decompose(t.value)), [ticks]);
  const values = useRef<number[]>(ticks.map((t, i) => bases[i]?.n ?? 0));

  const [cells, setCells] = useState<Cell[]>(() =>
    ticks.map((t) => ({ label: t.label, text: t.value, direction: t.direction })),
  );
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setCells((prev) =>
        prev.map((cell, i) => {
          const base = bases[i];
          if (!base || base.n === 0 || PEGGED.has(cell.label)) return cell;
          // Drift each value by a small fraction of itself, then keep it
          // tethered so it wanders around the opening print instead of walking
          // off to an implausible number over a long session.
          const step = (Math.random() - 0.5) * Math.max(Math.abs(base.n) * 0.0006, 10 ** -base.decimals);
          const pull = (base.n - values.current[i]) * 0.08;
          const next = values.current[i] + step + pull;
          const delta = next - values.current[i];
          values.current[i] = next;
          const direction: MarketTick["direction"] =
            Math.abs(delta) < 10 ** -(base.decimals + 2) ? "flat" : delta > 0 ? "up" : "down";
          return { ...cell, text: render(base, next), direction };
        }),
      );
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    tick();
    const id = setInterval(tick, 3200);
    return () => clearInterval(id);
  }, [bases]);

  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center gap-7 pr-7" aria-hidden={keyPrefix === "b"}>
      {cells.map((c) => (
        <span key={`${keyPrefix}-${c.label}`} className="tabular-nums">
          <b className="mr-1.5 text-accent-light">{c.label}</b>
          <span className="transition-colors duration-500">{c.text}</span>{" "}
          <span className={`${DIRECTION_STYLES[c.direction]} transition-colors duration-500`}>{ARROW[c.direction]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      dir="ltr"
      className="flex items-center gap-3 overflow-hidden border-b-4 border-accent bg-ink px-3 py-2 font-mono text-[13px] font-medium text-paper"
    >
      <span className="flex shrink-0 items-center gap-1.5 pl-1" title={isAr ? "أسعار مؤجلة" : "Delayed prices"}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="text-[10px] font-bold tracking-wide text-accent">{isAr ? "مؤجل" : "DELAYED"}</span>
        {/* "AS OF" matters: a bare running clock next to the word DELAYED reads
            as the size of the delay — i.e. "delayed by 06:24:20" — rather than
            as the time of the last print.
            suppressHydrationWarning: the clock is intentionally client-only, so
            server markup and first client paint will not match. */}
        <span suppressHydrationWarning className="hidden text-[10px] tabular-nums text-paper/45 sm:inline">
          {isAr ? "حتى" : "as of"} {clock ?? "--:--"}
        </span>
      </span>
      <div className="flex w-full overflow-hidden">
        <div className="flex shrink-0 animate-[marquee_34s_linear_infinite] motion-reduce:animate-none">
          {row("a")}
          {row("b")}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
