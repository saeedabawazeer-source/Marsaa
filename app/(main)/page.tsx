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

/**
 * Marsa's front page.
 *
 * The layout owes its bones to the standard business-title front page — big
 * lead, rails either side — but two things are deliberately different from the
 * newsletter-style sites in this category:
 *
 *   1. **News is above marketing.** The old build opened with a half-screen
 *      teal panel explaining what Marsa is. A returning reader does not need
 *      that every morning; they need today's lead. The masthead is now a single
 *      slim strip carrying the date, the story count and which desks have
 *      moved, and the lead story starts within the first screen.
 *
 *   2. **The rails do work.** Instead of a static "most popular" list, the left
 *      rail shows live per-desk counts so a reader can see at a glance where
 *      the news actually is today, and the right rail is a running latest-first
 *      timeline. Both are generated from the same fetch as the grid, so nothing
 *      on the page can disagree with anything else on it.
 */

export const revalidate = 300;

const DESKS: Array<{ slug: Section; label: string }> = [
  { slug: "markets", label: "Markets" },
  { slug: "energy", label: "Energy" },
  { slug: "real-estate", label: "Real Estate" },
  { slug: "trade", label: "Trade" },
  { slug: "policy", label: "Policy" },
];

const DESK_ACCENT: Record<string, string> = {
  markets: "bg-teal",
  energy: "bg-accent",
  "real-estate": "bg-accent-dark",
  trade: "bg-ink",
  policy: "bg-teal-dark",
};

export default async function HomePage() {
  const [market, news] = await Promise.all([getMarketSnapshot(), getNews({ limit: 90 })]);
  const now = news.fetchedAt;

  const sources = Array.from(new Set(news.items.map((i) => i.sourceName))).sort();
  const counts = DESKS.map((d) => ({ ...d, n: news.items.filter((i) => i.section === d.slug).length }));

  const [lead, ...rest] = news.items;
  const withArt = rest.filter((i) => i.image);
  const withoutArt = rest.filter((i) => !i.image);
  const grid = [...withArt, ...withoutArt].slice(0, 6);
  const latest = rest.slice(0, 9);

  return (
    <>
      <LiveTicker ticks={market.ticks} live={market.live} />

      {/* Slim masthead strip. Orientation in one line, then out of the way. */}
      <div className="border-b-2 border-inkBorder bg-paper">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
            {fmtDay(now)} · Jeddah
          </p>
          <p className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
            {news.items.length > 0 ? (
              <>
                {news.items.length} stories · {sources.length} sources · updated {fmtClock(now)} AST
              </>
            ) : (
              <>Sources unreachable · last checked {fmtClock(now)} AST</>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[168px_minmax(0,1fr)_260px]">
          {/* Left rail — desks, with live counts. */}
          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Desks
              </h2>
              <nav className="flex flex-col">
                {counts.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/category/${d.slug}`}
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

              {/* The one thing on this page that is Marsa's own work, so it
                  gets a real slot rather than a footer link. */}
              <Link
                href="/game"
                className="mt-6 block rounded-lg border-2 border-inkBorder bg-accent p-3.5 shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_rgba(26,26,26,0.9)]"
              >
                <h3 className="mb-1 flex items-center gap-1.5 text-[13px] font-bold leading-snug">
                  Marsa Daily <span aria-hidden>✦</span>
                </h3>
                <p className="text-[12px] leading-relaxed text-ink/75">
                  Five letters from Gulf business. New word every morning.
                </p>
                <span className="mt-2 block font-mono text-[10px] font-bold uppercase tracking-wide underline underline-offset-2">
                  Play today&rsquo;s →
                </span>
              </Link>

              <div className="mt-4 rounded-lg border-2 border-inkBorder bg-white p-3.5 shadow-[0_2px_0_0_rgba(26,26,26,0.9)]">
                <h3 className="mb-1.5 text-[13px] font-bold leading-snug">Morning brief</h3>
                <p className="mb-3 text-[12px] leading-relaxed text-gray-600">
                  The Gulf wire, condensed, before the Riyadh open.
                </p>
                <Link
                  href="/#brief"
                  className="block rounded-md border-2 border-inkBorder bg-accent px-3 py-1.5 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-ink transition hover:-translate-y-px"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </aside>

          {/* Centre — lead, then the grid. self-start keeps this column sized
              to its own content instead of being grid-stretched to match the
              tallest sibling column, which is what was making the lead card's
              h-full inflate to ~1800px and visually overrun the wire section
              below it. */}
          <main className="self-start">
            {lead ? (
              <>
                <NewsCard item={lead} now={now} big />
                {grid.length > 0 && (
                  <div className="mt-7 grid gap-6 sm:grid-cols-2">
                    {grid.map((i) => (
                      <NewsCard key={i.id} item={i} now={now} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Honest empty state: a portal whose feeds are down says so rather
                 than showing yesterday dressed as today. */
              <div className="rounded-lg border-2 border-inkBorder bg-white p-8 text-center shadow-[0_2px_0_0_rgba(26,26,26,0.9)]">
                <h2 className="mb-2 text-lg font-bold">No headlines right now.</h2>
                <p className="mx-auto max-w-[46ch] text-sm leading-relaxed text-gray-600">
                  Marsa could not reach its sources on the last check. Nothing here is being hidden —
                  there is simply nothing new to show until a publisher answers again.
                </p>
              </div>
            )}
          </main>

          {/* Right rail — the running latest. */}
          {latest.length > 0 && (
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
                Latest
              </h2>
              <ol className="divide-y divide-gray-200 border-y border-gray-200">
                {latest.map((i) => (
                  <li key={i.id}>
                    <Link href={`/story/${i.id}`} className="group flex items-start gap-2.5 py-2.5">
                      {/* A running list of grey headlines is the least
                          appetising thing on a news page. A small square per
                          row costs almost no space and gives the column a
                          rhythm the eye can follow. */}
                      <span className="shrink-0 overflow-hidden rounded border border-inkBorder">
                        <Thumb
                          src={i.image}
                          alt=""
                          source={i.sourceName}
                          section={i.section}
                          sizes="52px"
                          className="h-[52px] w-[52px]"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-snug transition group-hover:text-teal-dark">
                          {i.title}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-gray-400">
                          {i.sourceName} · {fmtAgo(i.publishedAt, now)}
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

      {/* The full, searchable stream. */}
      {news.items.length > 0 && (
        <section className="border-t-2 border-inkBorder bg-paper">
          <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
            <NewsStream items={news.items} now={now} sources={sources} />
          </div>
        </section>
      )}

      <div id="brief" className="scroll-mt-4 bg-teal px-4 py-10 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">Get the morning brief.</h2>
        <p className="mb-5 text-sm opacity-90">The Gulf business wire, condensed, before the Riyadh open.</p>
        <SubscribeForm />
      </div>

      <AdSlot />
    </>
  );
}
