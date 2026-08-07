import Link from "next/link";
import { getLatestArticles, getMarketTicks } from "@/lib/api";
import { MarketTicker } from "@/components/ui/MarketTicker";
import { ArticleCard } from "@/components/ui/Card";
import { AdSlot } from "@/components/ui/AdSlot";

export default async function HomePage() {
  const [articlesRaw, ticks] = await Promise.all([getLatestArticles(), getMarketTicks()]);
  const articles = [...articlesRaw].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const [featured, ...rest] = articles;
  const mid = Math.ceil(rest.length / 2);
  const firstHalf = rest.slice(0, mid);
  const secondHalf = rest.slice(mid);

  return (
    <>
      <MarketTicker ticks={ticks} />

      {/* full-bleed hero — bold color section by default, per brand.md §3.5 */}
      <section className="bg-teal px-4 py-10 text-paper sm:px-6 sm:py-14 md:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="mb-4 inline-block rounded-full border-2 border-inkBorder bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-ink">
              Gateway — est. Jeddah
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-[1.1] sm:text-4xl sm:leading-[1.05] md:text-5xl">Where MENA business docks first.</h1>
            <p className="mb-5 max-w-[46ch] text-base opacity-90">
              Markets, energy, trade, and the deals moving the Gulf and wider region — reported daily
              from Jeddah, the port that&apos;s watched trade pass through for a thousand years.
            </p>
            <Link href={`/article/${featured.slug}`} className="inline-block rounded border-[3px] border-inkBorder bg-paper px-4 py-2 text-sm font-bold text-ink shadow-md">
              Read today&apos;s brief
            </Link>
          </div>
          {featured && (
            <Link
              href={`/article/${featured.slug}`}
              className="rounded border-4 border-inkBorder bg-paper p-5 text-ink shadow-dramatic-accent"
            >
              <span className="mb-2.5 inline-block rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white">
                {featured.category}
              </span>
              <h3 className="mb-2 text-lg font-semibold leading-snug">{featured.title}</h3>
              <p className="font-mono text-xs text-teal-dark">{featured.readMins} MIN READ · {featured.desk.toUpperCase()}</p>
            </Link>
          )}
        </div>
      </section>

      {/* full-bleed gold band */}
      <div className="border-y-4 border-inkBorder bg-accent px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 font-mono text-sm font-bold uppercase tracking-wide">
          <span>◆ This week: fintech licensing round opens</span>
          <span>◆ NEOM bond sale oversubscribed 3x</span>
          <span>◆ Red Sea trade volume +14% YoY</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Top stories</h2>
          <Link href="/category/markets" className="font-mono text-xs font-bold text-teal-dark">All markets →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {firstHalf.map((a, i) => (
            <div key={a.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <ArticleCard article={a} big={i === 0} />
            </div>
          ))}
        </div>
      </section>

      {/* full-bleed dark market pulse — breaks up the feed */}
      <div className="bg-ink px-4 py-9 sm:px-6">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-5 font-mono text-paper md:grid-cols-4">
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Tadawul</span><span className="text-xl font-bold text-[#8fe0ab]">11,842</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Brent crude</span><span className="text-xl font-bold text-[#ec9a9a]">$81.40</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">USD/SAR</span><span className="text-xl font-bold">3.750</span></div>
          <div><span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Inflation (SAU)</span><span className="text-xl font-bold text-[#8fe0ab]">1.8%</span></div>
        </div>
      </div>

      {secondHalf.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">More from the desk</h2>
            <Link href="/category/trade" className="font-mono text-xs font-bold text-teal-dark">All trade →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {secondHalf.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* full-bleed teal CTA band */}
      <div className="bg-teal px-4 py-11 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">Get the morning brief.</h2>
        <p className="mb-4 text-sm opacity-90">MENA business, in five minutes, before the Riyadh open.</p>
        <button className="rounded border-[3px] border-inkBorder bg-accent px-5 py-2.5 text-sm font-bold text-ink shadow-md">
          Subscribe free
        </button>
      </div>

      <AdSlot />
    </>
  );
}
