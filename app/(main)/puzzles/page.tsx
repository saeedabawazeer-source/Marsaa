import type { Metadata } from "next";
import Link from "next/link";
import { puzzleNumber } from "@/lib/game";
import { puzzleNumber as sudokuNumber, difficultyForDay } from "@/lib/sudoku";
import { PuzzleCard, WordArt, SudokuArt } from "@/components/ui/PuzzleCard";
import { getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";
import { fmtDay } from "@/lib/time";

/**
 * The games page.
 *
 * Laid out the way a newspaper lays out its puzzles page: a ruled masthead
 * strip carrying the date and edition number, the puzzles stacked as entries
 * rather than as marketing tiles, and the day's news underneath so the page is
 * a stop on the way through the paper instead of a dead end.
 *
 * This is the only part of Marsa that is Marsa's own work rather than someone
 * else's reporting, which is exactly why it gets a real section of its own.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Puzzles — Marsa",
  description: "Marsa's daily puzzles: a five-letter Gulf business word game and a daily sudoku. New every morning, Riyadh time.",
};

const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

export default async function PuzzlesPage() {
  const wordN = puzzleNumber();
  const sudN = sudokuNumber();
  const diff = difficultyForDay(sudN);
  const news = await getNews({ limit: 30 });
  const now = news.fetchedAt;
  const alsoRead = news.items.slice(0, 3);

  return (
    <div className="bg-paper">
      {/* Full-bleed teal masthead — the games section announcing itself as its
          own part of the paper, not a subpage of the wire. */}
      <header className="border-b-4 border-inkBorder bg-teal px-4 py-7 text-paper sm:px-6 sm:py-10">
        <div className="mx-auto max-w-[1180px]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
            {fmtDay(now)} · Jeddah
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold leading-[1.05] sm:text-5xl">
            Puzzles
          </h1>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed opacity-90 sm:text-base">
            Two a day, reset at midnight Riyadh time. Everything Marsa makes itself lives here.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-9">
        {/* The puzzle list. */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PuzzleCard
            lang="en"
            href="/game"
            title="Marsa Daily"
            blurb="Five letters from Gulf business — markets, energy, trade. Six guesses."
            storageKey="marsa.daily"
            todayN={wordN}
            art={<WordArt />}
            meta={`No. ${wordN}`}
            cta="Play"
            playedLabel="Played"
            streakLabel="Streak"
          />
          <PuzzleCard
            lang="en"
            href="/sudoku"
            title="Sudoku"
            blurb="A fresh grid every morning. Easy at the start of the week, hard by the end of it."
            storageKey="marsa.sudoku"
            todayN={sudN}
            art={<SudokuArt />}
            meta={`No. ${sudN} · ${DIFF_LABEL[diff]}`}
            cta="Play"
            playedLabel="Solved"
            streakLabel="Streak"
          />
        </div>

        {/* How it works — the small print a newspaper puts under its games. */}
        <div className="mt-6 rounded-lg border-2 border-inkBorder bg-white p-4 shadow-[0_2px_0_0_rgba(26,26,26,0.9)] sm:p-5">
          <h2 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            How these work
          </h2>
          <p className="max-w-[70ch] text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            Every reader gets the same two puzzles each day, generated from the date itself — so
            the grid you are solving is the grid everyone in the Gulf is solving. The day rolls
            over at midnight Riyadh time (AST, no daylight saving). Progress and streaks are
            stored on your own device; Marsa keeps no account and no record of how you played.
          </p>
        </div>

        {/* Back into the paper. */}
        {alsoRead.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-4 flex items-center gap-3 border-b-2 border-ink pb-2">
              <span className="font-display text-xl font-bold">While you&rsquo;re here</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                from the wire
              </span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {alsoRead.map((i) => (
                <NewsCard key={i.id} item={i} now={now} />
              ))}
            </div>
            <Link
              href="/"
              className="mt-5 inline-block rounded-md border-2 border-inkBorder bg-white px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5"
            >
              Back to the front page →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
