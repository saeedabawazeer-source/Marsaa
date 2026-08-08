/**
 * Marsa Daily — a five-letter puzzle built from Gulf business vocabulary.
 *
 * Why this exists at all: everything else on Marsa is somebody else's work.
 * The headlines belong to Arab News and Argaam, the prices belong to Tadawul
 * via SAHMK. Aggregation gives a reader no reason to prefer this site to the
 * sources behind it, and no reason to come back at a particular time.
 *
 * A daily puzzle is the opposite on both counts. It is original content Marsa
 * owns outright, it resets once a day so there is a reason to return tomorrow
 * rather than "sometime", and it is finishable in ninety seconds — which is the
 * right length for something attached to a morning news habit rather than
 * competing with it.
 *
 * Everything here is deterministic from the date. No server state, no accounts,
 * no per-user generation: every reader in Riyadh and Jeddah gets the same word
 * on the same day, which is the entire social mechanic. Progress and streaks
 * live in the reader's own browser and are never transmitted.
 */

export type Lang = "en" | "ar";
export type Mark = "correct" | "present" | "absent";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/**
 * English answers. Five letters, and each one is a word a Gulf business reader
 * meets in an ordinary week — the point is that knowing the beat is an
 * advantage, otherwise this is just Wordle with extra steps.
 */
const WORDS_EN = [
  "SUKUK", "RIYAL", "STOCK", "SHARE", "TRADE", "CRUDE", "BRENT", "ASSET",
  "YIELD", "VALUE", "PRICE", "INDEX", "FUNDS", "LOANS", "TAXES", "PORTS",
  "CARGO", "SOLAR", "POWER", "STEEL", "METAL", "WAGES", "DEALS", "OFFER",
  "STAKE", "AUDIT", "RATIO", "QUOTA", "BONDS", "DEBTS", "MERGE", "GROSS",
  "GOODS", "BANKS", "RATES", "GRANT", "LEASE", "TRUST", "SHIPS", "MINES",
  "HOTEL", "TOURS", "VISAS", "LABOR", "SKILL", "BOOST", "SLUMP", "LIMIT",
  "RULES", "HIKES",
];

/**
 * Arabic answers, five letters after normalisation (see normalizeAr).
 *
 * Arabic makes this harder than English in one specific way: the same letter
 * has several written forms, and a reader typing ا should not be told they are
 * wrong because the answer was stored as أ. So hamza carriers on alef are
 * folded to bare alef on both sides of the comparison, and the puzzle is
 * displayed in the folded form. ة, ئ and ؤ stay distinct — they are different
 * letters, not variants, and folding them would make words unguessable.
 */
const WORDS_AR = [
  "تداول", "تجارة", "ميزان", "ارباح", "خسائر", "عملات", "اسواق", "بترول",
  "معادن", "موانئ", "شحنات", "ضرائب", "رواتب", "مصانع", "صناعة", "زراعة",
  "سياحة", "تمويل", "سندات", "عوائد",
];

/** Letters offered on the Arabic keyboard, in a familiar order. */
export const AR_ALPHABET = [
  "ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د",
  "ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط",
  "ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ",
];

export const EN_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

/** Fold alef variants so a reader is never punished for typing plain ا. */
export function normalizeAr(s: string): string {
  return s.replace(/[أإآٱ]/g, "ا").replace(/ـ/g, "");
}

export function normalize(s: string, lang: Lang): string {
  return lang === "ar" ? normalizeAr(s.trim()) : s.trim().toUpperCase();
}

/**
 * Puzzle number: whole days since launch, in Riyadh time.
 *
 * Riyadh rather than UTC because the puzzle should turn over at local midnight
 * for the audience it is written for, not at 3am. AST is UTC+3 year-round —
 * Saudi Arabia does not observe daylight saving — so a fixed offset is correct
 * here and will stay correct.
 */
const LAUNCH = Date.UTC(2026, 0, 1);
const AST_OFFSET_MS = 3 * 60 * 60 * 1000;

export function puzzleNumber(now: Date = new Date()): number {
  const riyadhMidnight = Math.floor((now.getTime() + AST_OFFSET_MS) / 86_400_000) * 86_400_000;
  return Math.max(1, Math.round((riyadhMidnight - LAUNCH) / 86_400_000) + 1);
}

/**
 * The day's answer.
 *
 * A stride coprime with the list length walks the whole list before repeating,
 * so consecutive days are unrelated and no word returns until every other one
 * has been used. Plain `n % length` would march through the list in order and
 * be guessable from yesterday.
 */
export function wordForDay(lang: Lang, now: Date = new Date()): string {
  const list = lang === "ar" ? WORDS_AR : WORDS_EN;
  const n = puzzleNumber(now);
  const stride = 7;
  return list[(n * stride) % list.length];
}

export function isValidLength(guess: string, lang: Lang): boolean {
  return Array.from(normalize(guess, lang)).length === WORD_LENGTH;
}

/**
 * Score a guess.
 *
 * The subtlety is repeated letters: in a target of STAKE, a guess of SELLS may
 * only mark one S. So exact hits are claimed in a first pass and the remainder
 * is counted, and a "present" mark is only handed out while that count lasts.
 * Doing it in one pass is the classic bug — it over-marks duplicates and makes
 * the board lie to the player.
 */
export function scoreGuess(guess: string, target: string, lang: Lang): Mark[] {
  const g = Array.from(normalize(guess, lang));
  const t = Array.from(normalize(target, lang));
  const marks: Mark[] = new Array(g.length).fill("absent");
  const remaining = new Map<string, number>();

  for (let i = 0; i < t.length; i++) {
    if (g[i] === t[i]) marks[i] = "correct";
    else remaining.set(t[i], (remaining.get(t[i]) ?? 0) + 1);
  }

  for (let i = 0; i < g.length; i++) {
    if (marks[i] === "correct") continue;
    const left = remaining.get(g[i]) ?? 0;
    if (left > 0) {
      marks[i] = "present";
      remaining.set(g[i], left - 1);
    }
  }

  return marks;
}

/** Best-known state per letter, for colouring the keyboard. */
export function keyboardState(
  guesses: string[],
  target: string,
  lang: Lang,
): Record<string, Mark> {
  const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
  const out: Record<string, Mark> = {};
  for (const guess of guesses) {
    const marks = scoreGuess(guess, target, lang);
    Array.from(normalize(guess, lang)).forEach((ch, i) => {
      const prev = out[ch];
      if (!prev || rank[marks[i]] > rank[prev]) out[ch] = marks[i];
    });
  }
  return out;
}

const EMOJI: Record<Mark, string> = { correct: "🟩", present: "🟨", absent: "⬜" };

/** The share card. Squares only — never the answer, which would spoil it. */
export function shareText(
  guesses: string[],
  target: string,
  lang: Lang,
  solved: boolean,
  now: Date = new Date(),
): string {
  const n = puzzleNumber(now);
  const score = solved ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const grid = guesses
    .map((g) => scoreGuess(g, target, lang).map((m) => EMOJI[m]).join(""))
    .join("\n");
  const title = lang === "ar" ? `مرسى اليومي ${n} — ${score}` : `Marsa Daily ${n} — ${score}`;
  return `${title}\n${grid}\nmarsa.news`;
}
