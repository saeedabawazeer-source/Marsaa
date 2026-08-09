import type { Metadata } from "next";
import Link from "next/link";
import { Sudoku } from "@/components/ui/Sudoku";

export const metadata: Metadata = {
  title: "Sudoku — Marsa",
  description: "Marsa's daily sudoku. A new grid every morning, Riyadh time — easy at the start of the week, hard by the end of it.",
};

export const revalidate = 300;

export default function SudokuPage() {
  return (
    <div className="bg-paper py-6 sm:py-10">
      <Sudoku lang="en" />
      <div className="mx-auto mt-7 max-w-[520px] px-3 text-center sm:px-0">
        <Link
          href="/puzzles"
          className="inline-block rounded-md border-2 border-inkBorder bg-white px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5"
        >
          All puzzles
        </Link>
      </div>
    </div>
  );
}
