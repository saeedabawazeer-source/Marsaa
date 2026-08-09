import type { Metadata } from "next";
import Link from "next/link";
import { Sudoku } from "@/components/ui/Sudoku";

export const metadata: Metadata = {
  title: "سودوكو — مرسى",
  description: "سودوكو مرسى اليومي. شبكة جديدة كل صباح بتوقيت الرياض — سهلة في بداية الأسبوع، صعبة في نهايته.",
};

export const revalidate = 300;

export default function ArabicSudokuPage() {
  return (
    <div dir="rtl" className="bg-paper py-6 sm:py-10">
      <Sudoku lang="ar" />
      <div className="mx-auto mt-7 max-w-[520px] px-3 text-center sm:px-0">
        <Link
          href="/ar/puzzles"
          className="inline-block rounded-md border-2 border-inkBorder bg-white px-4 py-2.5 font-mono text-[11px] font-bold shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5"
        >
          كل الألغاز
        </Link>
      </div>
    </div>
  );
}
