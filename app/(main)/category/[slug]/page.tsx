import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, type Section } from "@/lib/feeds";
import { NewsStream } from "@/components/ui/NewsStream";
import { NewsCard } from "@/components/ui/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { fmtClock } from "@/lib/time";

/**
 * A desk page is a filtered view of the classified wire — the same stories the
 * front page carries, narrowed to one beat. Sections are decided per story by
 * the classifier in lib/feeds.ts rather than by which feed a story arrived on,
 * which is what stops Energy sitting empty while oil stories pile up under
 * Markets.
 */

const LABELS: Record<Section, string> = {
  markets: "Markets",
  energy: "Energy",
  "real-estate": "Real Estate",
  trade: "Trade",
  policy: "Policy",
};

const BLURBS: Record<Section, string> = {
  markets: "Tadawul, listings, funds and the deals moving Saudi and Gulf capital.",
  energy: "Oil, gas, power and the Kingdom's renewables build-out.",
  "real-estate": "Property, construction and the giga-projects reshaping the map.",
  trade: "Ports, shipping, logistics and the goods crossing the Red Sea.",
  policy: "Ministries, regulators and the rules business runs under.",
};

const DESKS = Object.keys(LABELS) as Section[];

export const revalidate = 300;

export function generateStaticParams() {
  return DESKS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const slug = params.slug as Section;
  const label = LABELS[slug] ?? params.slug;
  return { title: label, description: BLURBS[slug] ?? `${label} headlines collected by Marsa.` };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as Section;
  if (!LABELS[slug]) notFound();

  const news = await getNews({ sections: [slug], limit: 60 });
  const sources = Array.from(new Set(news.items.map((i) => i.sourceName))).sort();
  const [lead, ...rest] = news.items;
  const grid = rest.slice(0, 6);

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-9 sm:px-6">
      <header className="mb-6 border-b-2 border-ink pb-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{LABELS[slug]}</h1>
        <p className="mt-1 max-w-[60ch] text-[15px] text-gray-600">{BLURBS[slug]}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-gray-500">
          {news.items.length > 0
            ? `${news.items.length} stories · ${sources.length} sources · updated ${fmtClock(news.fetchedAt)} AST`
            : `Nothing on this desk right now · last checked ${fmtClock(news.fetchedAt)} AST`}
        </p>
      </header>

      {news.items.length === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
          Nothing has come through on this desk since the last check. This is a live view — it fills as
          soon as a source files.
        </p>
      ) : (
        <>
          {lead && <NewsCard item={lead} now={news.fetchedAt} big />}
          {grid.length > 0 && (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((i) => (
                <NewsCard key={i.id} item={i} now={news.fetchedAt} />
              ))}
            </div>
          )}
          <div className="mt-10">
            <NewsStream items={news.items} now={news.fetchedAt} sources={sources} />
          </div>
        </>
      )}

      <div className="mt-10">
        <AdSlot />
      </div>
    </section>
  );
}
