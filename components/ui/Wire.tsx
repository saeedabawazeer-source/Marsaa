import type { WireItem } from "@/lib/types";
import { fmtClock, fmtAgo } from "@/lib/time";
import { CATEGORY_LABELS_AR } from "@/lib/labels";

/**
 * The market wire — the densest thing on the front page.
 *
 * The gap that put Marsa behind Argaam and Zawya in a blind comparison was not
 * craft, it was information per screen: a reader landing cold could see four
 * headlines here against seven-plus and two live data modules there. A wire
 * column closes that without diluting the design, because it adds *rows*, not
 * more cards competing for the same visual weight.
 *
 * Wire items deliberately do not link. Every headline on this site that looks
 * clickable must resolve; a wire is a tape of timestamped facts, which is how
 * Argaam's events strip and Bloomberg's first-word tape both behave.
 */
export function Wire({
  items,
  now,
  lang = "en",
}: {
  items: WireItem[];
  now: string;
  lang?: "en" | "ar";
}) {
  const isAr = lang === "ar";

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "الشريط الإخباري" : "Market wire"}
      className="rounded border-[3px] border-inkBorder bg-white shadow-md"
    >
      <header className="flex items-baseline justify-between gap-3 border-b-[3px] border-inkBorder bg-ink px-4 py-2.5 text-paper">
        <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6bd08a]" />
          {isAr ? "الشريط" : "The wire"}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-paper/55">
          {isAr ? "بتوقيت السعودية" : "Riyadh time"}
        </span>
      </header>

      <ol className="divide-y-2 divide-dashed divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="group flex gap-3 px-4 py-3 transition-colors hover:bg-paper">
            <time
              dateTime={item.at}
              className="w-11 shrink-0 pt-0.5 font-mono text-[11px] font-bold tabular-nums text-teal-dark"
            >
              {fmtClock(item.at)}
            </time>
            <div className="min-w-0">
              <p className="text-sm leading-snug">{isAr ? item.textAr : item.text}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-gray-500">
                {isAr ? CATEGORY_LABELS_AR[item.category] : item.category.replace("-", " ")}
                {" · "}
                {fmtAgo(item.at, now, lang)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="border-t-2 border-dashed border-gray-200 px-4 py-2.5 font-mono text-[10px] leading-relaxed text-gray-500">
        {isAr
          ? "الشريط يعرض تحديثات مختصرة. الأسعار مؤجلة وليست مصدراً للتداول."
          : "Wire carries short updates. Prices are delayed and not a dealing source."}
      </p>
    </section>
  );
}
