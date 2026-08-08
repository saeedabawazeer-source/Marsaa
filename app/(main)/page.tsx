import Link from "next/link";
import { getLatestArticles, getMarketTicks, getWire } from "@/lib/api";
import { LiveTicker } from "@/components/ui/LiveTicker";
import { Wire } from "@/components/ui/Wire";
import { ArticleCard } from "@/components/ui/Card";
import { AdSlot } from "@/components/ui/AdSlot";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { fmtDay, fmtStamp } from "@/lib/time";

/**
 * Regenerate every 5 minutes so the wire's timestamps stay current instead of
 * freezing at the moment of the last deploy. Without this the front page slowly
 * starts lying about how recent it is — the exact failure a reader notices
 * first on a news site.
 */
export const revalidate = 300;

export default async function HomePage() {
  const now = new Date();
  const [articlesRaw, ticks, wire] = await Promise.all([
    getLatestArticles(),
    getMarketTicks(),
    getWire(now),
  ]);
  const nowIso = now.toISOString();

  const articles = [...articlesRaw].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const [featured, ...rest] = articles;
  const lead = rest.slice(0, 5);
  const secondHalf = rest.slice(5);

  return (
    <>
      <LiveTicker ticks={ticks} />

      {/* Hero. Tightened vertically from the previous build, where roughly
          three-fifths of the first screen was empty teal — on a news front page
          that space has to earn its keep in headlines, not in air. */}
      <section className="bg-teal px-4 py-8 text-paper sm:px-6 sm:py-10 md:py-12">
        <div className="mx-auto grid max-w-[1180px] items-start gap-7 md:grid-cols-[1fr_1fr]">
          <div>
            <span className="mb-3 inline-block rounded-full border-2 border-inkBorder bg-accent px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
              Gateway — est. Jeddah
            </span>
            <h1 className="mb-3 text-3xl font-bold leading-[1.08] sm:text-4xl md:text-[42px]">
              Where MENA business docks first.
            </h1>
            <p className="mb-5 max-w-[46ch] text-[15px] leading-relaxed opacity-90">
              Markets, energy, trade, and the deals moving the Gulf — from Jeddah, the port that has
              watched trade pass through for a thousand years.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/article/${featured.slug}`}
                className="inline-block rounded border-[3px] border-inkBorder bg-paper px-4 py-2 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px"
              >
                Read today&apos;s brief
              </Link>
              <Link
                href="/category/markets"
                className="text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4 transition hover:text-accent-light"
              >
                Markets →
              </Link>
            </div>
          </div>

          {featured && (
            <Link
              href={`/article/${featured.slug}`}
              className="group block rounded border-4 border-inkBorder bg-paper p-5 text-ink shadow-dramatic-accent transition hover:-translate-y-px"
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className="inline-block rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white">
                  {featured.category.replace("-", " ")}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Lead story
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold leading-snug transition group-hover:text-teal-dark sm:text-2xl">
                {featured.title}
              </h2>
              <p className="mb-3 text-sm leading-relaxed text-gray-600">{featured.dek}</p>
              {/* The lead story previously carried no date at all — the single
                  fastest way for a reader to conclude a front page is stale. */}
              <div className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
                {featured.desk} · {featured.readMins} min read · {fmtDay(featured.publishedAt)}
              </div>
            </Link>
          )}
        </div>
      </section>

      <div className="border-y-4 border-inkBorder bg-accent px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 font-mono text-[13px] font-bold uppercase tracking-wide">
          <span>◆ This week: fintech licensing round opens</span>
          <span>◆ NEOM bond sale oversubscribed 3x</span>
          <span>◆ Red Sea trade volume +14% YoY</span>
        </div>
      </div>

      {/* Stories and wire side by side. This is the density fix: the wire adds
          ten timestamped rows to the first scroll without adding ten more cards
          fighting the story grid for attention. */}
      <section className="mx-auto max-w-[1180px] px-4 py-9 sm:px-6">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
          <div>
            <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2">
              <h2 className="text-xl font-bold">Top stories</h2>
              <Link href="/category/markets" className="font-mono text-xs font-bold text-teal-dark hover:underline">
                All markets →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {lead.slice(0, 2).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>

            {/* Headline list under the cards — more stories per screen without
                another row of identical boxes, which is what made the old grid
                read as filler rather than as a running front page. */}
            {lead.length > 2 && (
              <ol className="mt-6 divide-y-2 divide-dashed divide-gray-200 border-t-2 border-dashed border-gray-200">
                {lead.slice(2).map((a) => (
                  <li key={a.slug}>
                    <Link href={`/article/${a.slug}`} className="group flex gap-4 py-3.5 transition-colors hover:bg-white">
                      <span className="w-20 shrink-0 pt-1 font-mono text-[10px] font-bold uppercase tracking-wide text-teal-dark">
                        {a.category.replace("-", " ")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold leading-snug transition group-hover:text-teal-dark">
                          {a.title}
                        </h3>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500">
                          {a.desk} · {a.readMins} min · {fmtStamp(a.publishedAt, nowIso)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            <Wire items={wire} now={nowIso} />
          </aside>
        </div>
      </section>

      <div className="bg-ink px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-5 font-mono text-paper md:grid-cols-4">
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Tadawul</span>
            <span className="text-xl font-bold tabular-nums text-[#8fe0ab]">11,842</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Brent crude</span>
            <span className="text-xl font-bold tabular-nums text-[#ec9a9a]">$81.40</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">USD/SAR</span>
            <span className="text-xl font-bold tabular-nums">3.750</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Inflation (SAU)</span>
            <span className="text-xl font-bold tabular-nums text-[#8fe0ab]">1.8%</span>
          </div>
        </div>
      </div>

      {secondHalf.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-4 py-9 sm:px-6">
          <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2">
            <h2 className="text-xl font-bold">More from the desk</h2>
            <Link href="/category/trade" className="font-mono text-xs font-bold text-teal-dark hover:underline">
              All trade →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {secondHalf.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="bg-teal px-4 py-10 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">Get the morning brief.</h2>
        <p className="mb-5 text-sm opacity-90">MENA business, in five minutes, before the Riyadh open.</p>
        <SubscribeForm />
      </div>

      <AdSlot />
    </>
  );
}
