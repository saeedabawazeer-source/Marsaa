import type { Metadata } from "next";
import Link from "next/link";
import { puzzleNumber } from "@/lib/game";
import { puzzleNumber as sudokuNumber, difficultyForDay } from "@/lib/sudoku";
import { PuzzleCard, WordArt, SudokuArt } from "@/components/ui/PuzzleCard";
import { getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";
import { fmtDay } from "@/lib/time";

/** Arabic mirror of the games page — same data, same layout, RTL. */

export const revalidate = 300;

export const metadata: Metadata = {
  title: "الألغاز — مرسى",
  description: "ألغاز مرسى اليومية: لغز كلمات من عالم الأعمال الخليجي وسودوكو يومي. جديدة كل صباح بتوقيت الرياض.",
};

const DIFF_LABEL_AR = { easy: "سهل", medium: "متوسط", hard: "صعب" } as const;

export default async function ArabicPuzzlesPage() {
  const wordN = puzzleNumber();
  const sudN = sudokuNumber();
  const diff = difficultyForDay(sudN);
  const news = await getNews({ limit: 30 });
  const now = news.fetchedAt;
  const alsoRead = news.items.slice(0, 3);

  return (
    <div dir="rtl" className="bg-paper">
      <header className="border-b-4 border-inkBorder bg-teal px-4 py-7 text-paper sm:px-6 sm:py-10">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] opacity-80">
            {fmtDay(now, "ar")} · جدة
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold leading-[1.05] sm:text-5xl">الألغاز</h1>
          <p className="mt-1.5 font-mono text-[11px] opacity-80">لغزان يوميًا · يتجدّدان منتصف الليل</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        <div className="grid gap-4 lg:grid-cols-2">
          <PuzzleCard
            lang="ar"
            href="/ar/game"
            title="مرسى اليومي"
            blurb="خمسة حروف · ست محاولات"
            storageKey="marsa.daily"
            todayN={wordN}
            art={<WordArt />}
            meta={`رقم ${wordN}`}
            cta="العب"
            playedLabel="لُعب"
            streakLabel="سلسلة"
          />
          <PuzzleCard
            lang="ar"
            href="/ar/sudoku"
            title="سودوكو"
            blurb="شبكة جديدة كل صباح"
            storageKey="marsa.sudoku"
            todayN={sudN}
            art={<SudokuArt />}
            meta={`رقم ${sudN} · ${DIFF_LABEL_AR[diff]}`}
            cta="العب"
            playedLabel="حُلّت"
            streakLabel="سلسلة"
          />
        </div>


        {alsoRead.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-4 flex items-center gap-3 border-b-2 border-ink pb-2">
              <span className="font-display text-xl font-bold">وأنت هنا</span>
              <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-gray-500">من الشريط</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {alsoRead.map((i) => (
                <NewsCard key={i.id} item={i} now={now} lang="ar" />
              ))}
            </div>
            <Link
              href="/ar"
              className="mt-5 inline-block rounded-md border-2 border-inkBorder bg-white px-4 py-2.5 font-mono text-[11px] font-bold shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5"
            >
              العودة إلى الصفحة الأولى
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
