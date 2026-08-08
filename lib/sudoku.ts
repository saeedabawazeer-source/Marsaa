/**
 * The daily sudoku.
 *
 * Same contract as `game.ts`: one puzzle per Riyadh day, generated
 * deterministically from the date so every reader in the Gulf is solving the
 * same grid, and so the server and the browser can't disagree about which
 * puzzle "today" is. Nothing is fetched and nothing is stored server-side.
 *
 * Why generate rather than ship a fixed puzzle bank: a bank of hand-entered
 * grids is a finite content liability — it runs out, and until it runs out it
 * has to be stored, versioned and checked. A seeded generator produces a valid,
 * uniquely-solvable grid for any date, forever, in about a millisecond.
 */

export type Cell = {
  /** The solved value. Never rendered for givens the player must find. */
  value: number;
  /** True when the puzzle ships this square already filled. */
  given: boolean;
};

export type Difficulty = "easy" | "medium" | "hard";

/** A newspaper convention worth keeping: the week ramps up. */
export function difficultyForDay(n: number): Difficulty {
  const dow = n % 7;
  if (dow <= 2) return "easy";
  if (dow <= 5) return "medium";
  return "hard";
}

/** How many squares to leave visible. Fewer givens = harder. */
const GIVENS: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

/* ---------------------------------------------------------------- rng ----- */

/**
 * Mulberry32 — small, fast, and crucially *stable*: the same seed produces the
 * same sequence in every JS engine, which is what makes the daily puzzle
 * reproducible between the server render and the client hydration.
 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------- solving ---- */

function canPlace(grid: number[], idx: number, val: number): boolean {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === val) return false;
    if (grid[i * 9 + col] === val) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[(boxRow + r) * 9 + boxCol + c] === val) return false;
    }
  }
  return true;
}

/** Fills an empty grid with a valid complete solution. */
function fill(grid: number[], rand: () => number): boolean {
  const idx = grid.indexOf(0);
  if (idx === -1) return true;
  for (const val of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rand)) {
    if (canPlace(grid, idx, val)) {
      grid[idx] = val;
      if (fill(grid, rand)) return true;
      grid[idx] = 0;
    }
  }
  return false;
}

/**
 * Counts solutions, bailing at 2. A sudoku with more than one solution is a
 * broken sudoku — the player can "solve" it correctly and still be told they
 * are wrong — so digging holes has to check for uniqueness at every step.
 */
function countSolutions(grid: number[], cap = 2): number {
  const idx = grid.indexOf(0);
  if (idx === -1) return 1;
  let found = 0;
  for (let val = 1; val <= 9; val++) {
    if (canPlace(grid, idx, val)) {
      grid[idx] = val;
      found += countSolutions(grid, cap - found);
      grid[idx] = 0;
      if (found >= cap) break;
    }
  }
  return found;
}

/* --------------------------------------------------------------- dates ---- */

const LAUNCH = Date.UTC(2026, 0, 1);
const AST_OFFSET_MS = 3 * 60 * 60 * 1000; // Riyadh, UTC+3, no DST

export function puzzleNumber(now: Date = new Date()): number {
  const riyadhMidnight =
    Math.floor((now.getTime() + AST_OFFSET_MS) / 86_400_000) * 86_400_000;
  return Math.max(1, Math.round((riyadhMidnight - LAUNCH) / 86_400_000) + 1);
}

/* ------------------------------------------------------------ the board --- */

export interface Puzzle {
  cells: Cell[];
  difficulty: Difficulty;
  n: number;
}

export function puzzleForDay(now: Date = new Date()): Puzzle {
  const n = puzzleNumber(now);
  const difficulty = difficultyForDay(n);
  // Offset the seed so the sudoku and the word puzzle aren't correlated.
  const rand = rng(n * 2654435761);

  const solution = new Array(81).fill(0);
  fill(solution, rand);

  // Dig holes symmetrically (a real newspaper-grid convention — the pattern of
  // givens reads as designed rather than random), checking uniqueness as we go.
  const target = 81 - GIVENS[difficulty];
  const order = shuffled(
    Array.from({ length: 41 }, (_, i) => i),
    rand,
  );
  const working = solution.slice();
  let removed = 0;

  for (const idx of order) {
    if (removed >= target) break;
    const mirror = 80 - idx;
    const a = working[idx];
    const b = working[mirror];
    if (a === 0) continue;

    working[idx] = 0;
    working[mirror] = 0;
    if (countSolutions(working.slice()) !== 1) {
      working[idx] = a;
      working[mirror] = b;
    } else {
      removed += idx === mirror ? 1 : 2;
    }
  }

  return {
    n,
    difficulty,
    cells: solution.map((value, i) => ({ value, given: working[i] !== 0 })),
  };
}

/* --------------------------------------------------------------- scoring -- */

/** Which squares the player has filled in wrong. Used for the "check" action. */
export function wrongCells(entries: (number | null)[], cells: Cell[]): number[] {
  const bad: number[] = [];
  entries.forEach((e, i) => {
    if (e !== null && !cells[i].given && e !== cells[i].value) bad.push(i);
  });
  return bad;
}

export function isSolved(entries: (number | null)[], cells: Cell[]): boolean {
  return cells.every((c, i) => (c.given ? true : entries[i] === c.value));
}

/** How many of each digit are already placed — powers the "digit done" state. */
export function digitCounts(entries: (number | null)[], cells: Cell[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  cells.forEach((c, i) => {
    const v = c.given ? c.value : entries[i];
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  });
  return counts;
}

/** Emoji share card. Never reveals the grid — only time and difficulty. */
export function shareText(n: number, difficulty: Difficulty, seconds: number, lang: "en" | "ar"): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const labelAr: Record<Difficulty, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };
  return lang === "ar"
    ? `سودوكو مرسى #${n} · ${labelAr[difficulty]} · ${mm}:${ss}\nmarsa.news/ar/sudoku`
    : `Marsa Sudoku #${n} · ${difficulty} · ${mm}:${ss}\nmarsa.news/sudoku`;
}
