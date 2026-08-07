import type { MarketTick } from "@/lib/types";

// TODO(api): values here are static mock data (see lib/api.ts) — the marquee
// motion below makes this *look* like a live ticker, but it is not wired to a
// real market-data feed. A genuinely live Tadawul/Brent/FX feed needs a paid
// data vendor (e.g. Refinitiv, a Tadawul-approved data provider, or similar) —
// that's a real recurring cost decision, not something to fake with more code.

const DIRECTION_STYLES: Record<MarketTick["direction"], string> = {
  up: "text-[#6bd08a]",
  down: "text-[#e08a8a]",
  flat: "",
};
const DIRECTION_ARROW: Record<MarketTick["direction"], string> = { up: "▲", down: "▼", flat: "" };

export function MarketTicker({ ticks, lang = "en" }: { ticks: MarketTick[]; lang?: "en" | "ar" }) {
  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center gap-7 pr-7" aria-hidden={keyPrefix === "b"}>
      {ticks.map((t) => (
        <span key={`${keyPrefix}-${t.label}`}>
          <b className="mr-1.5 text-accent-light">{t.label}</b>
          {t.value} <span className={DIRECTION_STYLES[t.direction]}>{DIRECTION_ARROW[t.direction]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-3 overflow-hidden border-b-4 border-accent bg-ink px-3 py-2 font-mono text-[13px] font-medium text-paper">
      <span className="flex shrink-0 items-center gap-1.5 pl-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6bd08a]" />
        <span className="text-[10px] font-bold tracking-wide text-[#6bd08a]">{lang === "ar" ? "مباشر*" : "LIVE*"}</span>
      </span>
      <div className="flex w-full overflow-hidden">
        <div className="flex shrink-0 animate-[marquee_28s_linear_infinite] motion-reduce:animate-none">
          {row("a")}
          {row("b")}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
