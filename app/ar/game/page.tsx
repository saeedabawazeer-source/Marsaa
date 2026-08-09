import type { Metadata } from "next";
import Link from "next/link";
import { DailyGame } from "@/components/ui/DailyGame";
import { getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";

export const metadata: Metadata = {
  title: "مرسى اليومي",
  description: "لغز من خمسة حروف من عالم المال والأعمال الخليجي. كلمة جديدة كل يوم عند منتصف الليل بتوقيت الرياض.",
};

export const revalidate = 300;

export default async function ArabicGamePage() {
  const news = await getNews({ limit: 3 });

  return (
    <section dir="rtl" className="mx-auto max-w-[1240px] px-4 py-9 sm:px-6">
      <div className="rounded-lg border-2 border-inkBorder bg-white p-6 shadow-[0_3px_0_0_rgba(26,26,26,0.9)] sm:p-9">
        <DailyGame lang="ar" />
      </div>

      {news.items.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 border-b-2 border-ink pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            وأنت هنا
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.items.map((i) => (
              <NewsCard key={i.id} item={i} now={news.fetchedAt} lang="ar" />
            ))}
          </div>
          <Link
            href="/ar"
            className="mt-6 inline-block font-mono text-[11px] font-bold uppercase tracking-wide text-teal-dark underline underline-offset-4"
          >
            الشريط كاملاً
          </Link>
        </div>
      )}
    </section>
  );
}
