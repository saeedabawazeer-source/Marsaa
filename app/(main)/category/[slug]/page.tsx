import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, SOURCES, type Section } from "@/lib/feeds";
import { NewsStream } from "@/components/ui/NewsStream";
import { AdSlot } from "@/components/ui/AdSlot";
import { fmtClock } from "@/lib/time";

/**
 * Sections are now filtered views of the live wire rather than folders of
 * hand-written stories. That also retires a real defect: /category/policy used
 * to be a top-level nav link that spent the reader's click to tell them the
 * section was empty. A section is now only reachable if a source feeds it.
 */

const LABELS: Record<Section, string> = {
  markets: "Markets",
  energy: "Energy",
  "real-estate": "Real Estate",
  startups: "Startups",
  trade: "Trade",
  policy: "Policy",
  general: "General",
};

/** Only sections some source actually files into. */
const LIVE_SECTIONS = Array.from(new Set(SOURCES.map((s) => s.section))).filter((s) => s !== "general");

export const revalidate = 300;

export function generateStaticParams() {
  return LIVE_SECTIONS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const label = LABELS[params.slug as Section] ?? params.slug;
  return {
    title: label,
    description: `${label} headlines from across the Gulf, collected by Marsa and linked to their publishers.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug as Section;
  if (!LABELS[slug]) notFound();

  const news = await getNews({ sections: [slug], limit: 50 });
  const label = LABELS[slug];
  const sources = Array.from(new Set(news.items.map((i) => i.sourceName))).sort();

  return (
    <section className="mx-auto max-w-[1180px] px-4 py-9 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{label}</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-gray-500">
          {news.items.length > 0
            ? `${news.items.length} stories · ${sources.length} sources · updated ${fmtClock(news.fetchedAt)} AST`
            : `No headlines on this desk right now · last checked ${fmtClock(news.fetchedAt)} AST`}
        </p>
      </header>

      {news.items.length === 0 ? (
        <p className="rounded border-2 border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
          Nothing on the {label.toLowerCase()} desk has come through since the last check. This is a live
          view — it fills as soon as a source files.
        </p>
      ) : (
        <NewsStream items={news.items} now={news.fetchedAt} sources={sources} />
      )}

      <div className="mt-10">
        <AdSlot />
      </div>
    </section>
  );
}
