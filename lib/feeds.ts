/**
 * Marsa's aggregation layer.
 *
 * Marsa is a portal, not a newsroom. It does not claim to report; it collects
 * what Gulf and wider-MENA business publishers have filed, puts it in one
 * ordered, timestamped, readable place, and sends the reader to the publisher
 * to read it. That distinction drives every decision in this file:
 *
 *   - We store headline, standfirst, source, timestamp and link. Nothing more.
 *     Full-text republication of someone else's reporting is not ours to do,
 *     and a portal that quietly hosts the whole article is a portal with a
 *     legal problem. Every item links out to the publisher.
 *
 *   - Attribution is mandatory, never decorative. Each item carries the source
 *     name to the surface, because "who says this" is half the information in
 *     business news.
 *
 *   - Timestamps come from the feed. If a publisher gives us no date, the item
 *     is dropped rather than stamped with "now" — an aggregator that invents
 *     freshness is worse than one that shows less.
 *
 * Feeds are fetched in parallel with a hard timeout, and a feed that fails is
 * skipped rather than allowed to take the page down with it. A publisher moving
 * or retiring an RSS URL is a normal Tuesday, not an outage.
 *
 * Zero dependencies on purpose: this parses RSS 2.0 and Atom with targeted
 * string work rather than pulling an XML library in. Adding a dependency means
 * regenerating the lockfile, which means another pass through the deploy
 * platform's vulnerability scan — not worth it for two element shapes.
 */

export type Section = "markets" | "energy" | "trade" | "startups" | "real-estate" | "policy" | "general";

export interface Source {
  id: string;
  name: string;
  nameAr: string;
  /** Where the reader ends up if they want the publisher directly. */
  home: string;
  url: string;
  section: Section;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  sourceNameAr: string;
  section: Section;
}

export interface FeedResult {
  items: NewsItem[];
  /** Sources that answered, for the "where this came from" line. */
  ok: string[];
  /** Sources that did not, so the UI can be honest about partial coverage. */
  failed: string[];
  fetchedAt: string;
}

/**
 * The registry.
 *
 * Deliberately more feeds than strictly needed: publishers change RSS paths
 * without notice, and a portal whose front page empties out because one
 * newspaper reorganised its CMS is not a product. Breadth here is redundancy,
 * not padding — dedupe below collapses the overlap.
 */
export const SOURCES: Source[] = [
  {
    id: "arabnews-business",
    name: "Arab News",
    nameAr: "عرب نيوز",
    home: "https://www.arabnews.com",
    url: "https://www.arabnews.com/cat/3/rss.xml",
    section: "markets",
  },
  {
    id: "arabnews-economy",
    name: "Arab News",
    nameAr: "عرب نيوز",
    home: "https://www.arabnews.com",
    url: "https://www.arabnews.com/rss.xml",
    section: "general",
  },
  {
    id: "saudigazette-business",
    name: "Saudi Gazette",
    nameAr: "سعودي غازيت",
    home: "https://saudigazette.com.sa",
    url: "https://saudigazette.com.sa/rssFeed/74",
    section: "markets",
  },
  {
    id: "khaleejtimes-business",
    name: "Khaleej Times",
    nameAr: "خليج تايمز",
    home: "https://www.khaleejtimes.com",
    url: "https://www.khaleejtimes.com/rss/business",
    section: "markets",
  },
  {
    id: "gulfnews-business",
    name: "Gulf News",
    nameAr: "غلف نيوز",
    home: "https://gulfnews.com",
    url: "https://gulfnews.com/rss?generatorName=business",
    section: "markets",
  },
  {
    id: "tradearabia-business",
    name: "TradeArabia",
    nameAr: "تريد أرابيا",
    home: "http://www.tradearabia.com",
    url: "http://www.tradearabia.com/rss/BUS_0.xml",
    section: "trade",
  },
  {
    id: "tradearabia-energy",
    name: "TradeArabia",
    nameAr: "تريد أرابيا",
    home: "http://www.tradearabia.com",
    url: "http://www.tradearabia.com/rss/OGN_0.xml",
    section: "energy",
  },
  {
    id: "tradearabia-construction",
    name: "TradeArabia",
    nameAr: "تريد أرابيا",
    home: "http://www.tradearabia.com",
    url: "http://www.tradearabia.com/rss/CONS_0.xml",
    section: "real-estate",
  },
  {
    id: "arabianbusiness",
    name: "Arabian Business",
    nameAr: "أرابيان بزنس",
    home: "https://www.arabianbusiness.com",
    url: "https://www.arabianbusiness.com/rss.xml",
    section: "general",
  },
  {
    id: "wam-business",
    name: "WAM",
    nameAr: "وام",
    home: "https://www.wam.ae",
    url: "https://www.wam.ae/en/feed/rss",
    section: "policy",
  },
  {
    id: "aljazeera-economy",
    name: "Al Jazeera",
    nameAr: "الجزيرة",
    home: "https://www.aljazeera.com",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    section: "general",
  },
];

/* ------------------------------------------------------------------ *
 * XML parsing
 * ------------------------------------------------------------------ */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#8217": "’",
  "#8216": "‘",
  "#8220": "“",
  "#8221": "”",
  "#8211": "–",
  "#8212": "—",
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, code: string) => {
    if (ENTITIES[code]) return ENTITIES[code];
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const n = parseInt(code.slice(2), 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    if (code.startsWith("#")) {
      const n = parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return whole;
  });
}

/** Feed summaries routinely carry markup, tracking pixels and inline styles. */
function stripHtml(input: string): string {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapCdata(input: string): string {
  const m = input.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1] : input;
}

/** First matching child element's text, namespace-tolerant. */
function tagText(xml: string, ...names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(`<(?:[a-zA-Z0-9]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-zA-Z0-9]+:)?${name}>`, "i");
    const m = xml.match(re);
    if (m && m[1] != null) {
      const raw = unwrapCdata(m[1]).trim();
      if (raw) return raw;
    }
  }
  return null;
}

/** Atom links live in an attribute, RSS links in the element body. */
function extractLink(block: string): string | null {
  const body = tagText(block, "link");
  if (body && /^https?:\/\//i.test(body.trim())) return body.trim();

  const alt = block.match(/<(?:[a-zA-Z0-9]+:)?link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["']/i);
  if (alt) return decodeEntities(alt[1]);

  const any = block.match(/<(?:[a-zA-Z0-9]+:)?link\b[^>]*\bhref=["']([^"']+)["']/i);
  if (any) return decodeEntities(any[1]);

  const guid = tagText(block, "guid", "id");
  if (guid && /^https?:\/\//i.test(guid)) return guid;

  return null;
}

function parseDate(block: string): string | null {
  const raw = tagText(block, "pubDate", "published", "updated", "date", "modified");
  if (!raw) return null;
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return null;
  // A feed dated in the future is a publisher clock error, not a scoop.
  // Clamp rather than let it pin itself to the top of the page forever.
  const now = Date.now();
  return new Date(Math.min(t, now)).toISOString();
}

function splitEntries(xml: string): string[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi);
  if (items && items.length) return items;
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi);
  return entries ?? [];
}

export function parseFeed(xml: string, source: Source): NewsItem[] {
  const out: NewsItem[] = [];

  for (const block of splitEntries(xml)) {
    const titleRaw = tagText(block, "title");
    const link = extractLink(block);
    const publishedAt = parseDate(block);

    // All three are load-bearing. An item with no date cannot be placed on a
    // chronological page honestly, and an item with no link is a dead end.
    if (!titleRaw || !link || !publishedAt) continue;

    const title = stripHtml(titleRaw);
    if (title.length < 8) continue;

    const summaryRaw =
      tagText(block, "description", "summary", "subtitle") ?? tagText(block, "encoded", "content") ?? "";
    let summary = stripHtml(summaryRaw);
    if (summary.length > 260) summary = `${summary.slice(0, 257).trimEnd()}…`;
    // Some feeds repeat the headline as the description; that is noise.
    if (summary.toLowerCase() === title.toLowerCase()) summary = "";

    out.push({
      id: `${source.id}:${link}`,
      title,
      summary,
      link,
      publishedAt,
      sourceId: source.id,
      sourceName: source.name,
      sourceNameAr: source.nameAr,
      section: source.section,
    });
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Fetching
 * ------------------------------------------------------------------ */

async function fetchOne(source: Source, timeoutMs: number): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        // Some publishers reject requests with no UA, and a portal should say
        // plainly what it is rather than impersonate a browser.
        "user-agent": "MarsaPortal/1.0 (+https://marsa.news; news aggregator)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, source);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Headlines about the same event differ in punctuation and house style. */
function dedupeKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ ]+/g, "")
    .replace(/\b(the|a|an|of|to|in|on|for|and|as|at|by|is|its|with|after|over)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);
}

export async function getNews(
  { sections, limit = 60, timeoutMs = 6000 }: { sections?: Section[]; limit?: number; timeoutMs?: number } = {},
): Promise<FeedResult> {
  const chosen = sections?.length
    ? SOURCES.filter((s) => sections.includes(s.section) || s.section === "general")
    : SOURCES;

  const settled = await Promise.all(
    chosen.map(async (source) => ({ source, items: await fetchOne(source, timeoutMs) })),
  );

  const ok: string[] = [];
  const failed: string[] = [];
  const seen = new Set<string>();
  const merged: NewsItem[] = [];

  for (const { source, items } of settled) {
    if (items.length) ok.push(source.name);
    else failed.push(source.name);

    for (const item of items) {
      const key = dedupeKey(item.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  merged.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return {
    items: merged.slice(0, limit),
    ok: Array.from(new Set(ok)),
    failed: Array.from(new Set(failed)).filter((n) => !ok.includes(n)),
    fetchedAt: new Date().toISOString(),
  };
}
