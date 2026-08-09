import type { Metadata } from "next";
import Link from "next/link";
import { getItemById, getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { Thumb } from "@/components/ui/Thumb";
import { fmtDateline } from "@/lib/time";
import { absolute } from "@/lib/site";

/**
 * The in-app story preview.
 *
 * This is the page that keeps the reader on Marsa. It carries the publisher's
 * picture, headline, standfirst, section and dateline at full size, plus a rail
 * of what to read next — enough to decide, browse and keep moving without ever
 * leaving the app.
 *
 * What it deliberately does not do is reproduce the publisher's article text.
 * Marsa did not report these stories and has no licence to host them, so the
 * full read happens on the publisher's site behind one clearly-labelled button.
 * Everything before that button is Marsa's own surface; everything after it is
 * theirs, and the page never blurs which is which.
 */

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Stories arrive and age out continuously, so nothing is pre-rendered; each
  // preview is built on demand and then cached for the revalidate window.
  return [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { item } = await getItemById(params.id, "en");
  if (!item) return { title: "Story" };
  return {
    title: `${item.title} — via ${item.sourceName}`,
    description: item.summary || undefined,
    openGraph: {
      title: item.title,
      description: item.summary || undefined,
      type: "article",
      publishedTime: item.publishedAt,
      images: item.image ? [item.image] : undefined,
    },
  };
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const { item, url } = await getItemById(params.id, "en");

  // The story has aged off every feed we read. Say that plainly and still hand
  // over the link, rather than showing a 404 for something that did exist.
  if (!item) {
    return (
      <section className="mx-auto max-w-[64ch] px-5 py-16 sm:px-6">
        <h1 className="mb-3 text-2xl font-bold">This story has rolled off the wire.</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
          Marsa keeps whatever its sources are currently publishing. This one has since dropped off
          their feed, so there is nothing left here to preview.
        </p>
        <div className="flex flex-wrap gap-3">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px"
            >
              Try the publisher ↗
            </a>
          )}
          <Link
            href="/"
            className="rounded border-[3px] border-inkBorder bg-white px-4 py-2 text-sm font-bold shadow-md transition hover:-translate-y-px"
          >
            Back to the wire
          </Link>
        </div>
      </section>
    );
  }

  const news = await getNews({ limit: 60 });
  const sameSection = news.items.filter((i) => i.id !== item.id && i.section === item.section).slice(0, 3);
  const fill = sameSection.length < 3 ? news.items.filter((i) => i.id !== item.id && !sameSection.includes(i)).slice(0, 3 - sameSection.length) : [];
  const related = [...sameSection, ...fill];

  /**
   * Structured data for a preview page, not an original article.
   *
   * `author` names the publisher that actually reported this — Argaam, Arab
   * News, whoever the feed credited — never Marsa, because Marsa didn't write
   * it. `isBasedOn` / `sameAs` point at their URL, which is the same
   * attribution the visible page makes, just machine-readable. Claiming
   * `author: Marsa` on syndicated copy would be asserting authorship Marsa
   * doesn't have, and Google's guidance on scraped/aggregated content
   * specifically penalises exactly that misrepresentation.
   */
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.summary || undefined,
    image: item.image ? [item.image] : undefined,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    url: absolute(`/story/${item.id}`),
    mainEntityOfPage: absolute(`/story/${item.id}`),
    isBasedOn: item.link,
    sameAs: item.link,
    author: { "@type": "Organization", name: item.sourceName, url: item.link },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Marsa",
      logo: { "@type": "ImageObject", url: absolute("/icon-512.png") },
    },
    articleSection: item.section,
    inLanguage: "en",
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {/* Always a hero. Previously this rendered only when item.image existed,
          so image-less stories opened on a wall of text, and image-present-but-
          broken stories opened on a black band (the bg-ink behind the <img>).
          Thumb covers both: a real picture when there is one, a desk-coloured
          plate carrying the publisher's name when there is not. */}
      <div className="border-b-4 border-inkBorder">
        <Thumb
          src={item.image}
          alt=""
          source={item.sourceName}
          section={item.section}
          eager
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="mx-auto h-[220px] w-full max-w-[1180px] sm:h-[340px] lg:h-[440px]"
        />
      </div>

      <div className="mx-auto max-w-[70ch] px-5 py-9 sm:px-6 sm:py-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white">
            {item.section.replace("-", " ")}
          </span>
          <span className="rounded-full border-2 border-inkBorder bg-paper px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
            {item.sourceName}
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-[1.12] sm:text-4xl">{item.title}</h1>

        {item.summary && <p className="mb-5 text-lg leading-relaxed text-gray-700">{item.summary}</p>}

        <div className="mb-7 border-b-2 border-ink pb-4 font-mono text-xs uppercase tracking-wide text-gray-500">
          <time dateTime={item.publishedAt}>{fmtDateline(item.publishedAt)}</time>
        </div>

        {/* The hand-off. Labelled, not disguised: the reader should know they
            are about to land on someone else's site, and whose. */}
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5 shadow-md">
          <p className="mb-3 text-[15px] leading-relaxed text-gray-700">
            <strong>{item.sourceName}</strong> reported this story. Marsa shows the headline, picture and
            summary — the full article is theirs to publish, so the rest is on their site.
          </p>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded border-[3px] border-inkBorder bg-accent px-5 py-2.5 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px"
          >
            Read the full story at {item.sourceName} ↗
          </a>
        </div>

        <div className="mt-9 rounded border-[3px] border-inkBorder bg-teal px-5 py-6 text-paper shadow-md">
          <h2 className="mb-1 text-center text-lg font-bold">Get the morning brief.</h2>
          <p className="mb-4 text-center text-sm opacity-90">
            The Gulf business wire, condensed, before the Riyadh open.
          </p>
          <SubscribeForm />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-4 pb-10 sm:px-6">
          <h2 className="mb-4 border-b-2 border-ink pb-2 text-xl font-bold">Next on the wire</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <NewsCard key={r.id} item={r} now={news.fetchedAt} />
            ))}
          </div>
        </section>
      )}

      <AdSlot />
    </article>
  );
}
