"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@/components/brand/icons";
import {
  AR_ALPHABET,
  EN_ROWS,
  MAX_GUESSES,
  WORD_LENGTH,
  type Lang,
  type Mark,
  isValidLength,
  keyboardState,
  normalize,
  puzzleNumber,
  scoreGuess,
  shareText,
  wordForDay,
} from "@/lib/game";

/**
 * The board.
 *
 * Two decisions worth stating, because both were tempting to get wrong:
 *
 * 1. **The answer is computed on the client.** Anyone determined can read it
 *    out of the bundle. That is a deliberate trade: the alternative is a server
 *    round-trip per guess, which costs latency on every keystroke and buys
 *    nothing, because a reader who wants to cheat at a free word game about
 *    sukuk is not the reader this is for.
 *
 * 2. **Progress is stored per puzzle number, not as a running blob.** Keying on
 *    the day means a half-finished board survives a refresh, and yesterday's
 *    state can never bleed into today — which is the bug that makes daily games
 *    feel broken and gets them abandoned.
 *
 * The on-screen keyboard is not a mobile afterthought. Most people meet a news
 * site on a phone, and a puzzle you cannot play with your thumbs is a puzzle
 * nobody plays.
 */

const MARK_STYLES: Record<Mark, string> = {
  correct: "bg-teal text-paper border-teal",
  present: "bg-accent text-ink border-accent-dark",
  absent: "bg-gray-300 text-gray-600 border-gray-300",
};

interface Saved {
  n: number;
  guesses: string[];
  streak: number;
  lastWon: number | null;
}

const KEY = "marsa.daily";

function load(): Saved | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(s: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — the game still plays, it just won't be remembered */
  }
}

export function DailyGame({ lang = "en" }: { lang?: Lang }) {
  const isAr = lang === "ar";
  const t = isAr
    ? {
        title: "مرسى اليومي",
        blurb: "كلمة من خمسة حروف من عالم المال والأعمال الخليجي. كلمة جديدة كل يوم.",
        enter: "إدخال",
        del: "حذف",
        short: "الكلمة من خمسة حروف",
        won: "أحسنت",
        lost: "انتهت المحاولات. الكلمة:",
        share: "انسخ النتيجة",
        copied: "تم النسخ",
        streak: "أيام متتالية",
        tomorrow: "كلمة جديدة عند منتصف الليل بتوقيت الرياض.",
        puzzle: "لغز",
      }
    : {
        title: "Marsa Daily",
        blurb: "A five-letter word from Gulf business. New one every day.",
        enter: "Enter",
        del: "Del",
        short: "Needs five letters",
        won: "Got it",
        lost: "Out of guesses. The word was",
        share: "Copy result",
        copied: "Copied",
        streak: "day streak",
        tomorrow: "New word at midnight, Riyadh time.",
        puzzle: "Puzzle",
      };

  // Rendered only after mount. The answer depends on the current date, and the
  // server and the reader's browser can disagree across a midnight boundary —
  // rendering the board on the server would produce a hydration mismatch and,
  // worse, occasionally the wrong day's puzzle.
  const [ready, setReady] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const n = useMemo(() => (ready ? puzzleNumber() : 0), [ready]);
  const target = useMemo(() => (ready ? wordForDay(lang) : ""), [ready, lang]);

  const solved = guesses.some((g) => normalize(g, lang) === normalize(target, lang));
  const done = solved || guesses.length >= MAX_GUESSES;

  useEffect(() => {
    const today = puzzleNumber();
    const prev = load();
    if (prev && prev.n === today) {
      setGuesses(prev.guesses);
      setStreak(prev.streak);
    } else if (prev) {
      // A streak survives only if the last win was literally yesterday.
      setStreak(prev.lastWon === today - 1 ? prev.streak : 0);
    }
    setReady(true);
  }, []);

  const commit = useCallback(
    (next: string[]) => {
      const won = next.some((g) => normalize(g, lang) === normalize(target, lang));
      const prev = load();
      const base = prev?.lastWon ?? null;
      let nextStreak = streak;
      let lastWon = base;

      if (won) {
        nextStreak = base === n - 1 ? streak + 1 : 1;
        lastWon = n;
        setStreak(nextStreak);
      }
      save({ n, guesses: next, streak: nextStreak, lastWon });
    },
    [lang, n, streak, target],
  );

  const submit = useCallback(() => {
    if (done) return;
    if (!isValidLength(draft, lang)) {
      setNote(t.short);
      return;
    }
    const next = [...guesses, normalize(draft, lang)];
    setGuesses(next);
    setDraft("");
    setNote("");
    commit(next);
  }, [commit, done, draft, guesses, lang, t.short]);

  const press = useCallback(
    (ch: string) => {
      if (done) return;
      setNote("");
      setDraft((d) => (Array.from(d).length >= WORD_LENGTH ? d : d + ch));
    },
    [done],
  );

  const back = useCallback(() => {
    setDraft((d) => Array.from(d).slice(0, -1).join(""));
    setNote("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") submit();
      else if (e.key === "Backspace") back();
      else if (e.key.length === 1) {
        const ch = isAr ? e.key : e.key.toUpperCase();
        const ok = isAr ? AR_ALPHABET.includes(ch) : /^[A-Z]$/.test(ch);
        if (ok) press(ch);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, isAr, press, submit]);

  const keyState = useMemo(
    () => (ready ? keyboardState(guesses, target, lang) : {}),
    [guesses, lang, ready, target],
  );

  async function doShare() {
    try {
      await navigator.clipboard.writeText(shareText(guesses, target, lang, solved));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNote(isAr ? "تعذّر النسخ" : "Couldn't copy");
    }
  }

  // Reserve the board's height before mount so the page doesn't jump.
  if (!ready) {
    return <div className="mx-auto h-[420px] w-full max-w-[320px]" aria-hidden />;
  }

  const rows = Array.from({ length: MAX_GUESSES }, (_, r) => {
    if (r < guesses.length) {
      const g = Array.from(normalize(guesses[r], lang));
      const marks = scoreGuess(guesses[r], target, lang);
      return g.map((ch, i) => ({ ch, mark: marks[i] as Mark | null }));
    }
    if (r === guesses.length && !done) {
      const d = Array.from(draft);
      return Array.from({ length: WORD_LENGTH }, (_, i) => ({ ch: d[i] ?? "", mark: null }));
    }
    return Array.from({ length: WORD_LENGTH }, () => ({ ch: "", mark: null }));
  });

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="mx-auto w-full max-w-[420px]">
      <header className="mb-4 text-center">
        <h2 className="font-display text-2xl font-bold">{t.title}</h2>
        <p className="mx-auto mt-1 max-w-[36ch] text-[13px] leading-relaxed text-gray-600">{t.blurb}</p>
        <p className="mt-2 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-500">
          <span>
            {t.puzzle} #{n}
          </span>
          {streak > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="font-bold text-teal-dark">
                {isAr ? `${streak} ${t.streak}` : `${streak} ${t.streak}`}
              </span>
            </>
          )}
        </p>
      </header>

      {/* Board */}
      <div className="mb-4 grid gap-1.5" role="grid" aria-label={t.title}>
        {rows.map((row, r) => (
          <div key={r} className="grid grid-cols-5 gap-1.5" role="row">
            {row.map((cell, i) => (
              <div
                key={i}
                role="gridcell"
                className={`flex aspect-square items-center justify-center rounded border-2 text-2xl font-bold uppercase transition ${
                  cell.mark
                    ? MARK_STYLES[cell.mark]
                    : cell.ch
                      ? "border-inkBorder bg-white"
                      : "border-gray-300 bg-white/60"
                }`}
              >
                {cell.ch}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mb-4 min-h-[52px] text-center" aria-live="polite">
        {note && <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-accent-dark">{note}</p>}
        {done && (
          <div>
            <p className="font-bold">
              {solved ? (<span className="inline-flex items-center gap-1.5">{t.won}<CheckIcon size={15} /></span>) : (`${t.lost} ${normalize(target, lang)}`)}
            </p>
            <button
              type="button"
              onClick={doShare}
              className="mt-2 rounded border-2 border-inkBorder bg-accent px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-ink transition hover:-translate-y-0.5 hover:shadow-[0_3px_0_0_rgba(26,26,26,0.9)]"
            >
              {copied ? (<span className="inline-flex items-center gap-1.5">{t.copied}<CheckIcon size={14} /></span>) : t.share}
            </button>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-gray-500">{t.tomorrow}</p>
          </div>
        )}
      </div>

      {/* Keyboard */}
      {!done && (
        <div className="select-none space-y-1.5">
          {isAr ? (
            <div className="flex flex-wrap justify-center gap-1">
              {AR_ALPHABET.map((ch) => (
                <Key key={ch} ch={ch} mark={keyState[ch]} onPress={press} />
              ))}
            </div>
          ) : (
            EN_ROWS.map((row, i) => (
              <div key={i} className="flex justify-center gap-1">
                {Array.from(row).map((ch) => (
                  <Key key={ch} ch={ch} mark={keyState[ch]} onPress={press} />
                ))}
              </div>
            ))
          )}
          <div className="flex justify-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={submit}
              className="rounded border-2 border-inkBorder bg-ink px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-paper transition hover:bg-teal-dark"
            >
              {t.enter}
            </button>
            <button
              type="button"
              onClick={back}
              className="rounded border-2 border-inkBorder bg-white px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide transition hover:bg-paper"
            >
              {t.del}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Key({
  ch,
  mark,
  onPress,
}: {
  ch: string;
  mark?: Mark;
  onPress: (ch: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(ch)}
      aria-label={ch}
      className={`h-11 min-w-[30px] rounded border-2 px-2 text-sm font-bold uppercase transition active:translate-y-px ${
        mark ? MARK_STYLES[mark] : "border-inkBorder bg-white hover:bg-paper"
      }`}
    >
      {ch}
    </button>
  );
}
