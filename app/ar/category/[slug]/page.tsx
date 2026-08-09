import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, type Section } from "@/lib/feeds";
import { NewsStream } from "@/components/ui/NewsStream";
import { NewsCard } from "@/components/ui/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { fmtClock } from "@/lib/time";
import { CATEGORY_LABELS_AR } from "@/lib/labels";

const DESKS: Section[] = ["markets", "energy", "real-estate", "trade", "policy"];

export const revalidate = 300;

export function generateStaticParams() {
  return DESKS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const label = CATEGORY_LABELS_AR[params.slug as Section] ?? params.slug;
  return { title: label, description: `أخبار ${label} من مصادر الخليج، يجمعها مرسى.` };
}

export default async function ArabicCategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as Section;
  if (!DESKS.includes(slug)) notFound();

  const news = await getNews({ sections: [slug], limit: 60 });
  const label = CATEGORY_LABELS_AR[slug] ?? slug;
  const sources = Array.from(new Set(news.items.map((i) => i.sourceNameAr))).sort();
  const [lead, ...rest] = news.items;
  const grid = rest.slice(0, 6);

  return (
    <section dir="rtl" className="mx-auto max-w-[1240px] px-4 py-9 sm:px-6">
      <header className="mb-6 border-b-2 border-ink pb-3">
        <h1 className="text-2xl font-bold">{label}</h1>
        <p className="mt-1 font-mono text-[11px] text-gray-500">
          {news.items.length > 0
            ? `${news.items.length} خبراً · ${sources.length} مصادر · حُدّث ${fmtClock(news.fetchedAt)}`
            : `لا أخبار في هذا القسم حالياً · آخر محاولة ${fmtClock(news.fetchedAt)}`}
        </p>
      </header>

      {news.items.length === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
          لم يصل جديد إلى هذا القسم منذ آخر تحديث. هذه صفحة حيّة وتمتلئ فور نشر أي مصدر.
        </p>
      ) : (
        <>
          {lead && <NewsCard item={lead} now={news.fetchedAt} big lang="ar" />}
          {grid.length > 0 && (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((i) => (
                <NewsCard key={i.id} item={i} now={news.fetchedAt} lang="ar" />
              ))}
            </div>
          )}
          <div className="mt-10">
            <NewsStream items={news.items} now={news.fetchedAt} sources={sources} lang="ar" />
          </div>
        </>
      )}

      <div className="mt-10">
        <AdSlot />
      </div>
    </section>
  );
}
