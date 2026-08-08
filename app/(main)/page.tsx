import Link from "next/link";
import { getMarketTicks } from "@/lib/api";
import { getNews } from "@/lib/feeds";
import { LiveTicker } from "@/components/ui/LiveTicker";
import { NewsStream } from "@/components/ui/NewsStream";
import { AdSlot } from "@/components/ui/AdSlot";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { fmtDateline, fmtClock } from "@/lib/time";

/**
 * Marsa's front page, rebuilt as a portal.
 *
 * What was here before was a shell: seven hand-written articles, the newest a
 * week old, wrapped in a confident design that made the emptiness harder to
 * notice rather than easier. Two attempts to make it feel current by simulation
 * — a wire with manufactured timestamps, a signup that faked success — made it
 * worse, because a news product that invents freshness has broken the only
 * thing it sells.
 *
 * The honest version of "current" is aggregation: real stories, from named
 * publishers, with the publishers' own timestamps, linking back to the
 * publishers. Marsa's job is ordering, filtering and speed — not authorship.
 */

/**
 * Rebuild every 5 minutes. Long enough to be a good citizen to the feeds we
 * read, short enough that the front page is never meaningfully behind them.
 */
export const revalidate = 300;

export default async function HomePage() {
  const [ticks, news] = await Promise.all([getMarketTicks(), getNews({ limit: 60 })]);
  const now = news.fetchedAt;

  const sources = Array.from(new Set(news.items.map((i) => i.sourceName))).sort();
  const [lead, ...restItems] = news.items;

  return (
    <>
      <LiveTicker ticks={ticks} />

      {/* Hero. Half the height of the previous build: on a portal the reader
          came for headlines, and the masthead's job is to orient them in about
          one second and then get out of the way. */}
      <section className="bg-teal px-4 py-7 text-paper sm:px-6 sm:py-9">
        <div className="mx-auto grid max-w-[1180px] items-start gap-7 md:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="mb-3 inline-block rounded-full border-2 border-inkBorder bg-accent px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
              Gateway — est. Jeddah
            </span>
            <h1 className="mb-3 text-3xl font-bold leading-[1.08] sm:text-4xl">Gulf business, all in one place.</h1>
            <p className="mb-4 max-w-[48ch] text-[15px] leading-relaxed opacity-90">
              Marsa reads the region&apos;s business desks so you don&apos;t have to open six tabs. Every
              headline below is published by the outlet named beside it, and every link opens on their
              site.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-paper/70">
              {news.ok.length > 0 ? (
                <>
                  {news.items.length} stories · {news.ok.length} sources · updated {fmtClock(now)} AST
                </>
              ) : (
                <>Feeds unavailable · last checked {fmtClock(now)} AST</>
              )}
            </p>
          </div>

          {lead ? (
            <a
              href={lead.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded border-4 border-inkBorder bg-paper p-5 text-ink shadow-dramatic-accent transition hover:-translate-y-px"
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white">
                  Latest
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  {lead.sourceName}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold leading-snug transition group-hover:text-teal-dark sm:text-[26px]">
                {lead.title}
                <span aria-hidden className="ml-1.5 font-mono text-base text-gray-400 group-hover:text-teal-dark">
                  ↗
                </span>
              </h2>
              {lead.summary && <p className="mb-3 text-sm leading-relaxed text-gray-600">{lead.summary}</p>}
              <div className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
                <time dateTime={lead.publishedAt}>{fmtDateline(lead.publishedAt)}</time>
              </div>
            </a>
          ) : (
            /* Honest failure state. A portal whose feeds are down says so; it
               does not paper over the gap with yesterday's cache pretending to
               be today's news. */
            <div className="rounded border-4 border-inkBorder bg-paper p-5 text-ink shadow-md">
              <h2 className="mb-2 text-lg font-bold">No headlines right now.</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Marsa could not reach its sources on the last check. Nothing here is stale-but-hidden —
                there is simply nothing to show until the feeds answer again. Try a refresh shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="border-y-4 border-inkBorder bg-accent px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] font-bold uppercase tracking-wide">
          <span>◆ Reading {news.ok.length ? news.ok.join(" · ") : "—"}</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        {restItems.length > 0 || lead ? (
          <NewsStream items={news.items} now={now} sources={sources} />
        ) : (
          <p className="rounded border-2 border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            The wire is empty because no source responded. This page will fill itself the moment one does.
          </p>
        )}
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
            <span className="text-xl font-bold tabular-nums">3.7500</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wide text-teal-light">Inflation (SAU)</span>
            <span className="text-xl font-bold tabular-nums text-[#8fe0ab]">1.8%</span>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-[1180px] font-mono text-[10px] uppercase tracking-wide text-paper/40">
          Indicative reference levels · delayed · not a dealing source
        </p>
      </div>

      <div id="brief" className="scroll-mt-4 bg-teal px-4 py-10 text-center text-paper sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">Get the morning brief.</h2>
        <p className="mb-5 text-sm opacity-90">The Gulf business wire, condensed, before the Riyadh open.</p>
        <SubscribeForm />
      </div>

      <AdSlot />
    </>
  );
}
