"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  puzzleForDay,
  wrongCells,
  isSolved,
  digitCounts,
  shareText,
  type Cell,
  type Difficulty,
} from "@/lib/sudoku";

/**
 * The daily sudoku board.
 *
 * Built to be played with a thumb first. The grid and the number pad are sized
 * so that on a 360px phone every square clears the 44px tap floor, and the pad
 * sits at the bottom of the board rather than under the fold — the failure mode
 * of most web sudoku is a grid that fits but a keypad you have to scroll to,
 * which makes the game unplayable one-handed.
 *
 * Everything is local: the puzzle is generated from today's date, progress
 * lives in localStorage, and nothing is sent anywhere.
 */

const STORAGE = "marsa.sudoku";

type Saved = {
  n: number;
  entries: (number | null)[];
  notes: string[]; // comma-joined digits per cell
  seconds: number;
  done: boolean;
  /** Consecutive days solved. Only advances when yesterday's grid was solved. */
  streak: number;
  /** Puzzle number of the last grid actually solved, so the streak can't be
      inflated by solving the same day twice. */
  lastWon: number;
};

const LABEL: Record<Difficulty, { en: string; ar: string }> = {
  easy: { en: "Easy", ar: "سهل" },
  medium: { en: "Medium", ar: "متوسط" },
  hard: { en: "Hard", ar: "صعب" },
};

const T = {
  en: {
    title: "Marsa Sudoku",
    sub: "One grid a day. It gets harder as the week goes on.",
    puzzle: "Puzzle",
    notes: "Notes",
    erase: "Erase",
    check: "Check",
    solvedTitle: "Solved.",
    solvedBody: "Come back tomorrow for a new grid.",
    share: "Share result",
    copied: "Copied",
    wrong: "wrong so far",
    clean: "No mistakes yet",
    reset: "Start over",
  },
  ar: {
    title: "سودوكو مرسى",
    sub: "شبكة واحدة كل يوم. تزداد صعوبة مع تقدّم الأسبوع.",
    puzzle: "اللغز",
    notes: "ملاحظات",
    erase: "مسح",
    check: "تحقّق",
    solvedTitle: "أحسنت.",
    solvedBody: "عُد غداً لشبكة جديدة.",
    share: "شارك النتيجة",
    copied: "تم النسخ",
    wrong: "أخطاء حتى الآن",
    clean: "لا أخطاء حتى الآن",
    reset: "ابدأ من جديد",
  },
};

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Sudoku({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const t = T[lang];

  // Generated once per mount. useMemo (not useState initialiser) because the
  // puzzle is a pure function of the date — there is nothing to "set".
  const puzzle = useMemo(() => puzzleForDay(), []);
  const cells: Cell[] = puzzle.cells;

  const [entries, setEntries] = useState<(number | null)[]>(() => Array(81).fill(null));
  const [notes, setNotes] = useState<Set<number>[]>(() => Array.from({ length: 81 }, () => new Set<number>()));
  const [sel, setSel] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastWon, setLastWon] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -------------------------------------------------------------- restore -- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s: Saved = JSON.parse(raw);
        // Streak and lastWon carry across days; the board itself does not.
        setStreak(typeof s.streak === "number" ? s.streak : 0);
        setLastWon(typeof s.lastWon === "number" ? s.lastWon : 0);
        if (s.n === puzzle.n) {
          setEntries(s.entries);
          setNotes(s.notes.map((n) => new Set(n ? n.split(",").map(Number) : [])));
          setSeconds(s.seconds ?? 0);
          setDone(s.done ?? false);
        }
      }
    } catch {
      /* corrupt storage shouldn't break the game */
    }
    setReady(true);
  }, [puzzle.n]);

  /* Win detection lives here, not inside a setState updater. Deriving it from
     committed state means React can re-run the updater safely and the streak
     can only ever advance once per puzzle. */
  useEffect(() => {
    if (!ready || done) return;
    if (!isSolved(entries, cells)) return;
    setDone(true);
    if (lastWon !== puzzle.n) {
      setStreak((s) => (lastWon === puzzle.n - 1 ? s + 1 : 1));
      setLastWon(puzzle.n);
    }
  }, [ready, done, entries, cells, lastWon, puzzle.n]);

  /* ---------------------------------------------------------------- save --- */
  useEffect(() => {
    if (!ready) return;
    const payload: Saved = {
      n: puzzle.n,
      entries,
      notes: notes.map((s) => Array.from(s).join(",")),
      seconds,
      done,
      streak,
      lastWon,
    };
    try {
      localStorage.setItem(STORAGE, JSON.stringify(payload));
    } catch {
      /* private mode */
    }
  }, [ready, entries, notes, seconds, done, streak, lastWon, puzzle.n]);

  /* --------------------------------------------------------------- timer --- */
  useEffect(() => {
    if (done || !ready) return;
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [done, ready]);

  /* ---------------------------------------------------------------- input -- */
  const place = useCallback(
    (digit: number) => {
      if (sel === null || done || cells[sel].given) return;
      if (noteMode) {
        setNotes((prev) => {
          const next = prev.slice();
          const s = new Set(next[sel]);
          s.has(digit) ? s.delete(digit) : s.add(digit);
          next[sel] = s;
          return next;
        });
        return;
      }
      setEntries((prev) => {
        const next = prev.slice();
        next[sel] = next[sel] === digit ? null : digit;
        return next;
      });
      // Placing a real digit clears that square's pencil marks, the way it
      // would on paper.
      setNotes((prev) => {
        const next = prev.slice();
        next[sel] = new Set();
        return next;
      });
      setChecked([]);
    },
    [sel, done, cells, noteMode],
  );

  const erase = useCallback(() => {
    if (sel === null || done || cells[sel].given) return;
    setEntries((prev) => {
      const next = prev.slice();
      next[sel] = null;
      return next;
    });
    setNotes((prev) => {
      const next = prev.slice();
      next[sel] = new Set();
      return next;
    });
    setChecked([]);
  }, [sel, done, cells]);

  /* Physical keyboard, for anyone on a laptop. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key >= "1" && e.key <= "9") place(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") erase();
      else if (sel !== null && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const row = Math.floor(sel / 9);
        const col = sel % 9;
        const d =
          e.key === "ArrowUp" ? [-1, 0] : e.key === "ArrowDown" ? [1, 0] : e.key === "ArrowLeft" ? [0, -1] : [0, 1];
        const r = Math.min(8, Math.max(0, row + d[0]));
        const c = Math.min(8, Math.max(0, col + d[1]));
        setSel(r * 9 + c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place, erase, sel, done]);

  const counts = digitCounts(entries, cells);
  const selVal = sel === null ? null : cells[sel].given ? cells[sel].value : entries[sel];

  const label = LABEL[puzzle.difficulty][lang];

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="mx-auto w-full max-w-[520px] px-3 sm:px-0">
      {/* Masthead. Mono metadata line = the "data" register from the type rules.
          The subtitle is hidden below sm: on a short phone viewport, the
          number pad has to be reachable without scrolling, and a sentence of
          copy is the cheapest thing to cut to buy that back — the puzzle
          number, difficulty and timer are the parts a returning player
          actually reads. */}
      <header className="mb-2.5 text-center sm:mb-4">
        <h1 className="font-display text-xl font-bold leading-tight sm:text-3xl">{t.title}</h1>
        <p className="mx-auto mt-1 hidden max-w-[38ch] text-[13px] leading-relaxed text-gray-600 sm:block sm:text-sm">{t.sub}</p>
        <p className="mt-1.5 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:mt-2">
          <span>
            {t.puzzle} #{puzzle.n}
          </span>
          <span aria-hidden>·</span>
          <span className="rounded-full border-2 border-inkBorder bg-accent px-2 py-0.5 text-ink">{label}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{fmtTime(seconds)}</span>
        </p>
      </header>

      {/* The grid. aspect-square + a 9-col grid means it scales with the
          viewport instead of being pinned to a pixel size that only works on
          one phone.

          The bug this fixes: sizing purely off width meant the grid was as
          tall as the phone is wide, and on a short viewport (a real phone
          with the browser's address bar still showing, not the full device
          height devtools reports) that alone pushed the number pad below the
          fold — reachable only by scrolling, which is what "have to scroll to
          see the keyboard" was. `min()` bounds the grid by 56% of the *visual*
          viewport height as well as by width, so header + grid + controls +
          pad fit together on the phones that were failing, and the grid
          simply stops growing past 480px on anything larger rather than
          ballooning on a tall/narrow window. */}
      <div
        className="mx-auto grid grid-cols-9 overflow-hidden rounded-lg border-[3px] border-inkBorder bg-white shadow-[0_4px_0_0_rgba(26,26,26,0.9)]"
        style={{ width: "min(100%, 56dvh, 480px)", aspectRatio: "1 / 1" }}
      >
        {cells.map((cell, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const val = cell.given ? cell.value : entries[i];
          const isSel = sel === i;
          const sameVal = selVal !== null && val === selVal;
          const peer =
            sel !== null &&
            (Math.floor(sel / 9) === row ||
              sel % 9 === col ||
              (Math.floor(Math.floor(sel / 9) / 3) === Math.floor(row / 3) &&
                Math.floor((sel % 9) / 3) === Math.floor(col / 3)));
          const bad = checked.includes(i);

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSel(i)}
              aria-label={`${row + 1},${col + 1}${val ? `: ${val}` : ""}`}
              className={[
                "relative flex items-center justify-center font-display text-[clamp(15px,4.6vw,24px)] font-bold leading-none transition-colors",
                // 3×3 box separators, drawn as thicker internal borders.
                col % 3 === 2 && col !== 8 ? "border-r-2 border-r-ink" : "border-r border-r-gray-300",
                row % 3 === 2 && row !== 8 ? "border-b-2 border-b-ink" : "border-b border-b-gray-300",
                bad
                  ? "bg-red-100 text-red-700"
                  : isSel
                    ? "bg-accent/70"
                    : sameVal && val
                      ? "bg-accent/25"
                      : peer
                        ? "bg-paper"
                        : "bg-white",
                cell.given ? "text-ink" : "text-teal-dark",
              ].join(" ")}
            >
              {val ? (
                val
              ) : notes[i].size > 0 ? (
                <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[2px] text-[7px] font-bold leading-none text-gray-500 sm:text-[9px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <span key={d} className="flex items-center justify-center">
                      {notes[i].has(d) ? d : ""}
                    </span>
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Controls sit immediately under the grid — reachable with the same
          thumb that just tapped a square, no scrolling between the two. */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setNoteMode((v) => !v)}
          aria-pressed={noteMode}
          className={`min-h-[44px] flex-1 rounded-md border-2 border-inkBorder px-3 font-mono text-[11px] font-bold uppercase tracking-wide shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition active:translate-y-px active:shadow-none ${
            noteMode ? "bg-teal text-white" : "bg-white text-ink"
          }`}
        >
          {t.notes} {noteMode ? "●" : "○"}
        </button>
        <button
          type="button"
          onClick={erase}
          className="min-h-[44px] flex-1 rounded-md border-2 border-inkBorder bg-white px-3 font-mono text-[11px] font-bold uppercase tracking-wide shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition active:translate-y-px active:shadow-none"
        >
          {t.erase}
        </button>
        <button
          type="button"
          onClick={() => setChecked(wrongCells(entries, cells))}
          className="min-h-[44px] flex-1 rounded-md border-2 border-inkBorder bg-white px-3 font-mono text-[11px] font-bold uppercase tracking-wide shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition active:translate-y-px active:shadow-none"
        >
          {t.check}
        </button>
      </div>

      {checked.length > 0 && (
        <p className="mt-2 text-center font-mono text-[11px] font-bold text-red-700">
          {checked.length} {t.wrong}
        </p>
      )}

      {/* Number pad. Each key is a real 56px target and shows how many of that
          digit are already placed, so a finished digit visibly retires. */}
      <div className="mt-3 grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
          const full = counts[d] >= 9;
          return (
            <button
              key={d}
              type="button"
              onClick={() => place(d)}
              disabled={full}
              className={`flex min-h-[52px] flex-col items-center justify-center rounded-md border-2 border-inkBorder font-display text-lg font-bold shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition active:translate-y-px active:shadow-none sm:text-xl ${
                full ? "bg-gray-200 text-gray-400 opacity-60 shadow-none" : "bg-white text-ink"
              }`}
            >
              {d}
              <span className="font-mono text-[8px] font-bold tabular-nums text-gray-400">
                {Math.max(0, 9 - counts[d])}
              </span>
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-5 rounded-lg border-[3px] border-inkBorder bg-teal p-5 text-center text-paper shadow-[0_4px_0_0_rgba(26,26,26,0.9)]">
          <h2 className="font-display text-xl font-bold">{t.solvedTitle}</h2>
          <p className="mt-1 font-mono text-sm tabular-nums opacity-90">
            #{puzzle.n} · {label} · {fmtTime(seconds)}
            {streak > 1 && ` · ${isAr ? "سلسلة" : "Streak"} ${streak}`}
          </p>
          <p className="mt-1 text-sm opacity-90">{t.solvedBody}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(shareText(puzzle.n, puzzle.difficulty, seconds, lang));
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="mt-3 min-h-[44px] rounded-md border-2 border-inkBorder bg-accent px-5 font-mono text-[11px] font-bold uppercase tracking-wide text-ink shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition active:translate-y-px active:shadow-none"
          >
            {copied ? t.copied : t.share}
          </button>
        </div>
      )}
    </section>
  );
}
