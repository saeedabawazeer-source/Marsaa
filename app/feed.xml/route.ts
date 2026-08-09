import { getNews } from "@/lib/feeds";
import { SITE, absolute } from "@/lib/site";

/**
 * Marsa's own RSS feed.
 *
 * An aggregator that offers no feed of its own is asking to be the end of the
 * chain, and it is the single cheapest thing a publisher can do for discovery:
 * feed readers, Slack and Teams unfurlers, IFTTT, newsletter tools and several
 * AI crawlers all prefer a feed to scraping HTML.
 *
 * What goes in it matters legally. Each entry carries Marsa's headline, the
 * publisher's standfirst, the publisher's name in `dc:creator`, and a `source`
 * element pointing at the original — and the `link` goes to Marsa's preview
 * page, not straight to the publisher, so the attribution travels with the item
 * instead of being stripped by whatever reads it. Full article text is never
 * included, because Marsa does not have it and would not have the right to
 * syndicate it if it did.
 */

export const revalidate = 900;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang") === "ar" ? "ar" : "en";
  const news = await getNews({ limit: 60, lang });

  const isAr = lang === "ar";
  const title = isAr ? `${SITE.nameAr} — ${SITE.taglineAr}` : `${SITE.name} — ${SITE.tagline}`;
  const description = isAr ? SITE.descriptionAr : SITE.description;
  const home = isAr ? absolute("/ar") : absolute("/");
  const self = isAr ? absolute("/feed.xml?lang=ar") : absolute("/feed.xml");

  const items = news.items
    .map((i) => {
      const link = isAr ? absolute(`/ar/story/${i.id}`) : absolute(`/story/${i.id}`);
      const source = isAr ? i.sourceNameAr : i.sourceName;
      return `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${esc(source)}</dc:creator>
      <category>${esc(i.section)}</category>
      ${i.summary ? `<description>${esc(i.summary)}</description>` : ""}
      <source url="${esc(i.link)}">${esc(source)}</source>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${esc(home)}</link>
    <atom:link href="${esc(self)}" rel="self" type="application/rss+xml" />
    <description>${esc(description)}</description>
    <language>${isAr ? "ar-SA" : "en"}</language>
    <lastBuildDate>${new Date(news.fetchedAt).toUTCString()}</lastBuildDate>
    <ttl>15</ttl>
    <copyright>Headlines and summaries belong to the publishers named in each item.</copyright>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
}
