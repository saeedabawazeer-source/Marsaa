import Link from "next/link";
import { getMarketSnapshot } from "@/lib/market";
import { getNews, type Section } from "@/lib/feeds";
import { LiveTicker } from "@/components/ui/LiveTicker";
import { NewsStream } from "@/components/ui/NewsStream";
import { NewsCard } from "@/components/ui/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { Thumb } from "@/components/ui/Thumb";
import { fmtClock, fmtAgo, fmtDay } from "@/lib/time";
import { CATEGORY_LABELS_AR } from "@/lib/labels";

/**
 * The Arabic front page.
 *
 * This was the last part of the site still running on the seven hand-written
 * mock articles, months out of date, while the English side had moved to the
 * live wire. A bilingual publication where one language is a working product
 * and the other is a stale demo is not bilingual; it has a real edition and a
 * decorative one.
 *
 * It now reads the same feed, the same classifier and the same components as
 * the English page, with `lang="ar"` and `dir="rtl"` throughout. Headlines stay
 * in the language the publisher filed them in — inventing Arabic translations
 * of someone else's reporting would be putting words in their mouth — but every
 * label, timestamp, desk name and control around them is Arabic.
 */

export const revalidate = 300;

const DESKS: Section[] = ["markets", "energy", "real-estate", "trade", "policy"];

const DESK_ACCENT: Record<string, string> = {
  markets: "bg-teal",
  energy: "bg-accent",
  "real-estate": "bg-accent-dark",
  trade: "bg-ink",
  policy: "bg-teal-dark",
};

export default async function ArabicHomePage() {
  const [market, news] = await Promise.all([getMarketSnapshot(), getNews({ limit: 90 })]);
  const now = news.fetchedAt;

  const sources = Array.from(new Set(news.items.map((i) => i.sourceNameAr))).sort();
  const counts = DESKS.map((slug) => ({
    slug,
    label: CATEGORY_LABELS_AR[slug] ?? slug,
    n: news.items.filter((i) => i.section === slug).length,
  }));

  const [lead, ...rest] = news.items;
  const withArt = rest.filter((i) => i.image);
  const withoutArt = rest.filter((i) => !i.image);
  const grid = [...withArt, ...withoutArt].slice(0, 6);
  const latest = rest.slice(0, 9);

  return (
    <div dir="rtl">
      <LiveTicker ticks={market.ticks} live={market.live} lang="ar" />

      <div className="border-b-2 border-inkBorder bg-paper">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
            {fmtDay(now, "ar")} · جدة
          </p>
          <p className="font-mono text-[11px] text-gray-500">
            {news.items.length > 0 ? (
              <>
                {news.items.length} خبراً · {sources.length} مصادر · حُدّث {fmtClock(now)} بتوقيت السعودية
              </>
            ) : (
              <>تعذّر الوصول إلى المصادر · آخر محاولة {fmtClock(now)}</>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[168px_minmax(0,1fr)_260px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <h2 className="mb-3 font-mono text-[10px] font-bold tracking-[0.16em] text-gray-500">الأقسام</h2>
              <nav className="flex flex-col">
                {counts.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/ar/category/${d.slug}`}
                    className="group flex items-center gap-2 border-b border-gray-200 py-2.5 text-sm font-semibold transition hover:text-teal-dark"
                  >
                    <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-sm ${DESK_ACCENT[d.slug]}`} />
                    <span className="min-w-0 flex-1 truncate">{d.label}</span>
                    <span className="font-mono text-[11px] tabular-nums text-gray-400 group-hover:text-teal-dark">
                      {d.n}
                    </span>
                  </Link>
                ))}
              </nav>

              <Link
                href="/ar/game"
                className="mt-6 block rounded-lg border-2 border-inkBorder bg-accent p-3.5 shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_rgba(26,26,26,0.9)]"
              >
                <h3 className="mb-1 flex items-center gap-1.5 text-[13px] font-bold leading-snug">
                  مرسى اليومي <span aria-hidden>✦</span>
                </h3>
                <p className="text-[12px] leading-relaxed text-ink/75">
                  خمسة حروف من عالم الأعمال الخليجي. كلمة جديدة كل صباح.
                </p>
                <span className="mt-2 block font-mono text-[10px] font-bold underline underline-offset-2">
                  ← العب لغز اليوم
                </span>
              </Link>

              <div className="mt-4 rounded-lg border-2 border-inkBorder bg-white p-3.5 shadow-[0_2px_0_0_rgba(26,26,26,0.9)]">
                <h3 className="mb-1.5 text-[13px] font-bold leading-snug">النشرة الصباحية</h3>
                <p className="mb-3 text-[12px] leading-relaxed text-gray-600">
                  أخبار أعمال الخليج، مختصرة، قبل افتتاح السوق.
                </p>
                <Link
                  href="/ar#brief"
                  className="block rounded-md border-2 border-inkBorder bg-accent px-3 py-1.5 text-center font-mono text-[11px] font-bold text-ink transition hover:-translate-y-px"
                >
                  اشترك
                </Link>
              </div>
            </div>
          </aside>

          <main className="self-start">
            {lead ? (
              <>
                <NewsCard item={lead} now={now} big lang="ar" />
                {grid.length > 0 && (
                  <div className="mt-7 grid gap-6 sm:grid-cols-2">
                    {grid.map((i) => (
                      <NewsCard key={i.id} item={i} now={now} lang="ar" />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border-2 border-inkBorder bg-white p-8 text-center shadow-[0_2px_0_0_rgba(26,26,26,0.9)]">
                <h2 className="mb-2 text-lg font-bold">لا توجد أخبار الآن.</h2>
                <p className="mx-auto max-w-[46ch] text-sm leading-relaxed text-gray-600">
                  تعذّر على مرسى الوصول إلى مصادره في آخر تحديث. لا شيء مخفي هنا — ببساطة لا جديد
                  حتى يستجيب أحد الناشرين مرة أخرى.
                </p>
              </div>
            )}
          </main>

          {latest.length > 0 && (
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.16em] text-gray-500">
                <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
                الأحدث
              </h2>
              <ol className="divide-y divide-gray-200 border-y border-gray-200">
                {latest.map((i) => (
                  <li key={i.id}>
                    <Link href={`/ar/story/${i.id}`} className="group flex items-start gap-2.5 py-2.5">
                      <span className="shrink-0 overflow-hidden rounded border border-inkBorder">
                        <Thumb
                          src={i.image}
                          alt=""
                          source={i.sourceNameAr}
                          section={i.section}
                          sizes="52px"
                          className="h-[52px] w-[52px]"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-snug transition group-hover:text-teal-dark">
                          {i.title}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] text-gray-400">
                          {i.sourceNameAr} · {fmtAgo(i.publishedAt, now, "ar")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </div>

      {news.items.length > 0 && (
        <section className="border-t-2 border-inkBorder bg-paper">
          <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
            <NewsStream items={news.items} now={now} sources={sources} lang="ar" />
          </div>
        </section>
      )}

      <div id="brief" className="scroll-mt-4 bg-teal px-4 py-10 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">احصل على النشرة الصباحية.</h2>
        <p className="mb-5 text-sm opacity-90">أخبار أعمال الخليج، مختصرة، قبل افتتاح السوق.</p>
        <SubscribeForm lang="ar" />
      </div>

      <AdSlot />
    </div>
  );
}
