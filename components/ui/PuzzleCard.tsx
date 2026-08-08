"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * A puzzle card on the games page.
 *
 * It reads the reader's own saved progress out of localStorage and reports it
 * on the card — "solved today", a streak, a running clock. A games page that
 * shows the same static tiles whether you have played or not is a menu, not a
 * games page; the whole reason someone returns at 7am is to see their own state.
 *
 * Progress is read on mount only (never during SSR) so the server and client
 * markup agree — the card renders its neutral state first, then fills in.
 */

type Props = {
  href: string;
  title: string;
  blurb: string;
  /** localStorage key this game saves under. */
  storageKey: string;
  /** Today's puzzle number, so we can tell "played today" from "played once". */
  todayN: number;
  /** Small square illustration drawn in CSS/SVG — one per game. */
  art: React.ReactNode;
  meta: string;
  cta: string;
  playedLabel: string;
  streakLabel: string;
  lang: "en" | "ar";
};

export function PuzzleCard({
  href,
  title,
  blurb,
  storageKey,
  todayN,
  art,
  meta,
  cta,
  playedLabel,
  streakLabel,
  lang,
}: Props) {
  const [state, setState] = useState<{ playedToday: boolean; streak: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setState({ playedToday: false, streak: 0 });
        return;
      }
      const s = JSON.parse(raw);
      const playedToday =
        s.n === todayN && (s.done === true || (Array.isArray(s.guesses) && s.guesses.length > 0));
      setState({ playedToday, streak: typeof s.streak === "number" ? s.streak : 0 });
    } catch {
      setState({ playedToday: false, streak: 0 });
    }
  }, [storageKey, todayN]);

  const isAr = lang === "ar";

  return (
    <Link
      href={href}
      dir={isAr ? "rtl" : "ltr"}
      className="group flex items-stretch gap-0 overflow-hidden rounded-lg border-[3px] border-inkBorder bg-white shadow-[0_4px_0_0_rgba(26,26,26,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_rgba(26,26,26,0.9)] active:translate-y-px active:shadow-[0_2px_0_0_rgba(26,26,26,0.9)]"
    >
      {/* Art panel — the thing that makes this read as a games page and not a
          list of links. Fixed square, full-bleed color, borders doing the
          separating work. */}
      <div
        className={`flex w-[96px] shrink-0 items-center justify-center bg-teal p-3 sm:w-[120px] ${
          isAr ? "border-l-[3px]" : "border-r-[3px]"
        } border-inkBorder`}
      >
        {art}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5 sm:p-4">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-display text-[17px] font-bold leading-tight sm:text-xl">{title}</h3>
          {state?.playedToday && (
            <span className="shrink-0 rounded-full border-2 border-inkBorder bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide">
              {playedLabel}
            </span>
          )}
        </div>

        <p className="mb-2 line-clamp-2 text-[13px] leading-relaxed text-gray-600">{blurb}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
          <span>{meta}</span>
          {state && state.streak > 0 && (
            <span className="text-teal-dark">
              {streakLabel} {state.streak}
            </span>
          )}
          <span className="text-teal-dark underline underline-offset-2 group-hover:text-accent-dark">
            {cta} {isAr ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ----------------------------------------------------------------- art ---- */
/* Two small CSS/SVG marks, drawn in the same flat-fill + hard-border language
   as the rest of the brand rather than pulled from an icon set. */

export function WordArt() {
  return (
    <div className="grid grid-cols-3 gap-1" aria-hidden>
      {["a", "b", "c", "d", "e", "f", "g", "h", "i"].map((k, i) => (
        <span
          key={k}
          className={`h-4 w-4 rounded-[3px] border-2 border-inkBorder sm:h-5 sm:w-5 ${
            i === 0 || i === 4 || i === 8 ? "bg-accent" : i === 2 || i === 6 ? "bg-paper" : "bg-teal-dark"
          }`}
        />
      ))}
    </div>
  );
}

export function SudokuArt() {
  return (
    <div className="grid grid-cols-3 gap-[3px] rounded-[3px] border-2 border-inkBorder bg-inkBorder p-[3px]" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={`flex h-4 w-4 items-center justify-center font-display text-[9px] font-bold leading-none sm:h-5 sm:w-5 sm:text-[11px] ${
            i % 4 === 0 ? "bg-accent text-ink" : "bg-paper text-ink"
          }`}
        >
          {[5, "", 3, "", 7, "", 1, "", 9][i]}
        </span>
      ))}
    </div>
  );
}
