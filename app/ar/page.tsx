import Link from "next/link";
import type { Metadata } from "next";
import { getLatestArticles, getMarketTicks } from "@/lib/api";
import { MarketTicker } from "@/components/ui/MarketTicker";
import { ArticleCard } from "@/components/ui/Card";
import { AdSlot } from "@/components/ui/AdSlot";

// Real 1:1 Arabic homepage — same sections, same order, same data as
// app/(main)/page.tsx: ticker, hero, gold headline band, top stories grid,
// dark market-pulse band, more-from-desk grid, subscribe CTA, ad slot.
// No English-only fallback content and no "partial" disclaimer — every
// article now carries a full Arabic title/dek/body (lib/api.ts).

export const metadata: Metadata = {
  title: "مرسى — أخبار الأعمال في الشرق الأوسط من جدة",
  description: "الأسواق والطاقة والتجارة، تغطية يومية من جدة.",
};

export default async function ArabicHomePage() {
  const [articlesRaw, ticks] = await Promise.all([getLatestArticles(), getMarketTicks()]);
  const articles = [...articlesRaw].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const [featured, ...rest] = articles;
  const mid = Math.ceil(rest.length / 2);
  const firstHalf = rest.slice(0, mid);
  const secondHalf = rest.slice(mid);

  return (
    <>
      <MarketTicker ticks={ticks} lang="ar" />

      <section className="bg-teal px-4 py-10 text-paper sm:px-6 sm:py-14 md:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="mb-4 inline-block rounded-full border-2 border-inkBorder bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-ink">
              بوابة — تأسست في جدة
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl">حيث ترسو أعمال الشرق الأوسط أولاً.</h1>
            <p className="mb-5 max-w-[46ch] text-base opacity-90">
              الأسواق والطاقة والتجارة، والصفقات التي تحرك الخليج والمنطقة — تغطية يومية من جدة، الميناء الذي شهد حركة التجارة منذ ألف عام.
            </p>
            <Link href={`/ar/article/${featured.slug}`} className="inline-block rounded border-[3px] border-inkBorder bg-paper px-4 py-2 text-sm font-bold text-ink shadow-md">
              اقرأ موجز اليوم
            </Link>
          </div>
          {featured && (
            <Link
              href={`/ar/article/${featured.slug}`}
              className="rounded border-4 border-inkBorder bg-paper p-5 text-ink shadow-dramatic-accent"
            >
              <span className="mb-2.5 inline-block rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white">
                {featured.category}
              </span>
              <h3 className="mb-2 text-lg font-semibold leading-snug">{featured.titleAr}</h3>
              <p className="font-mono text-xs text-teal-dark">{featured.readMins} دقائق قراءة · {featured.desk}</p>
            </Link>
          )}
        </div>
      </section>

      <div className="border-y-4 border-inkBorder bg-accent px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 font-mono text-sm font-bold uppercase tracking-wide">
          <span>◆ هذا الأسبوع: افتتاح جولة تراخيص التقنية المالية</span>
          <span>◆ طرح سندات نيوم تجاوز الاكتتاب 3 مرات</span>
          <span>◆ حجم تجارة البحر الأحمر +14% على أساس سنوي</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">أبرز الأخبار</h2>
          <Link href="/ar/category/markets" className="font-mono text-xs font-bold text-teal-dark">جميع أخبار الأسواق ←</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {firstHalf.map((a, i) => (
            <div key={a.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <ArticleCard article={a} big={i === 0} lang="ar" />
            </div>
          ))}
        </div>
      </section>

      <div className="bg-ink px-4 py-9 sm:px-6">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-5 font-mono text-paper md:grid-cols-4">
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">تاسي</span><span className="text-xl font-bold text-[#8fe0ab]">11,842</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">خام برنت</span><span className="text-xl font-bold text-[#ec9a9a]">$81.40</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">دولار/ريال</span><span className="text-xl font-bold">3.750</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">التضخم (السعودية)</span><span className="text-xl font-bold text-[#8fe0ab]">1.8%</span></div>
        </div>
      </div>

      {secondHalf.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">المزيد من غرفة الأخبار</h2>
            <Link href="/ar/category/trade" className="font-mono text-xs font-bold text-teal-dark">جميع أخبار التجارة ←</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {secondHalf.map((a) => (
              <ArticleCard key={a.slug} article={a} lang="ar" />
            ))}
          </div>
        </section>
      )}

      <div className="bg-teal px-4 py-11 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">اشترك في الموجز الصباحي.</h2>
        <p className="mb-4 text-sm opacity-90">أخبار الأعمال في الشرق الأوسط، خلال خمس دقائق، قبل افتتاح سوق الرياض.</p>
        <button className="rounded border-[3px] border-inkBorder bg-accent px-5 py-2.5 text-sm font-bold text-ink shadow-md">
          اشترك مجاناً
        </button>
      </div>

      <AdSlot lang="ar" />
    </>
  );
}
