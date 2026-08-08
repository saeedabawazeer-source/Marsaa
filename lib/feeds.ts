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

export type Section = "markets" | "energy" | "real-estate" | "trade" | "policy";

export interface Source {
  id: string;
  name: string;
  nameAr: string;
  /** Where the reader ends up if they want the publisher directly. */
  home: string;
  url: string;
  /**
   * A hint only. The desk a story lands on is decided per item by classify()
   * below, because a publisher's "business" feed carries energy, property and
   * trade stories all mixed together and a reader looking for Energy should
   * find them.
   */
  section: Section;
  /**
   * A general-news feed rather than a business desk. These carry Gulf business
   * stories but also everything else the newsroom files, so they are gated
   * through the relevance filter below before anything reaches the page.
   */
  broad?: boolean;
}

export interface NewsItem {
  /** base64url of the link — stable, and decodable by the preview route. */
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  sourceNameAr: string;
  section: Section;
  /** Publisher's own thumbnail, when the feed offers one. */
  image?: string;
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
  // --- Saudi desks first. Marsa is a Jeddah publication, so the Kingdom leads
  // the mix and the wider Gulf fills in around it. ---
  { id: "arabnews-business", name: "Arab News", nameAr: "عرب نيوز", home: "https://www.arabnews.com", url: "https://www.arabnews.com/cat/3/rss.xml", section: "markets" },
  { id: "arabnews-saudi", name: "Arab News", nameAr: "عرب نيوز", home: "https://www.arabnews.com", url: "https://www.arabnews.com/cat/1/rss.xml", section: "policy", broad: true },
  { id: "arabnews-all", name: "Arab News", nameAr: "عرب نيوز", home: "https://www.arabnews.com", url: "https://www.arabnews.com/rss.xml", section: "markets", broad: true },
  { id: "saudigazette-business", name: "Saudi Gazette", nameAr: "سعودي غازيت", home: "https://saudigazette.com.sa", url: "https://saudigazette.com.sa/rssFeed/74", section: "markets" },
  { id: "saudigazette-saudi", name: "Saudi Gazette", nameAr: "سعودي غازيت", home: "https://saudigazette.com.sa", url: "https://saudigazette.com.sa/rssFeed/78", section: "policy", broad: true },
  { id: "spa-en", name: "SPA", nameAr: "واس", home: "https://www.spa.gov.sa", url: "https://www.spa.gov.sa/rss.xml", section: "policy", broad: true },
  { id: "argaam-en", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/en/rss", section: "markets" },
  { id: "alarabiya-business", name: "Al Arabiya", nameAr: "العربية", home: "https://english.alarabiya.net", url: "https://english.alarabiya.net/tools/rss/business", section: "markets" },

  // --- Wider Gulf ---
  { id: "arabianbusiness", name: "Arabian Business", nameAr: "أرابيان بزنس", home: "https://www.arabianbusiness.com", url: "https://www.arabianbusiness.com/rss.xml", section: "markets" },
  { id: "khaleejtimes-business", name: "Khaleej Times", nameAr: "خليج تايمز", home: "https://www.khaleejtimes.com", url: "https://www.khaleejtimes.com/rss/business", section: "markets" },
  { id: "gulfnews-business", name: "Gulf News", nameAr: "غلف نيوز", home: "https://gulfnews.com", url: "https://gulfnews.com/rss?generatorName=business", section: "markets" },
  { id: "tradearabia-business", name: "TradeArabia", nameAr: "تريد أرابيا", home: "http://www.tradearabia.com", url: "http://www.tradearabia.com/rss/BUS_0.xml", section: "trade" },
  { id: "tradearabia-energy", name: "TradeArabia", nameAr: "تريد أرابيا", home: "http://www.tradearabia.com", url: "http://www.tradearabia.com/rss/OGN_0.xml", section: "energy" },
  { id: "tradearabia-construction", name: "TradeArabia", nameAr: "تريد أرابيا", home: "http://www.tradearabia.com", url: "http://www.tradearabia.com/rss/CONS_0.xml", section: "real-estate" },
  { id: "zawya-en", name: "Zawya", nameAr: "زاوية", home: "https://www.zawya.com", url: "https://www.zawya.com/en/rss", section: "markets" },
  { id: "aljazeera-all", name: "Al Jazeera", nameAr: "الجزيرة", home: "https://www.aljazeera.com", url: "https://www.aljazeera.com/xml/rss/all.xml", section: "policy", broad: true },
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

/**
 * The publisher's own thumbnail.
 *
 * Feeds advertise images in four different places depending on how old the CMS
 * is, so all four are tried. Using a publisher's thumbnail on a card that
 * credits and links to them is exactly what every reader-style aggregator does;
 * it is the picture doing the same job as the headline, not a substitute for
 * visiting the article.
 */
function extractImage(block: string): string | undefined {
  const media = block.match(/<(?:[a-zA-Z0-9]+:)?(?:content|thumbnail)\b[^>]*\burl=["']([^"']+)["']/i);
  if (media) return decodeEntities(media[1]);

  const enclosure = block.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i);
  if (enclosure && /\.(jpe?g|png|webp|avif)/i.test(enclosure[1])) return decodeEntities(enclosure[1]);

  const inline = block.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (inline) return decodeEntities(inline[1]);

  return undefined;
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
      id: Buffer.from(link, "utf8").toString("base64url"),
      title,
      summary,
      link,
      publishedAt,
      sourceId: source.id,
      sourceName: source.name,
      sourceNameAr: source.nameAr,
      section: source.section,
      image: extractImage(block),
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

/**
 * Desk classification.
 *
 * Sections used to come from whichever feed a story arrived on, which meant an
 * oil story filed to a publisher's "business" feed landed under Markets and the
 * Energy desk stayed empty. A reader who clicks Energy wants energy stories, not
 * whatever a CMS happened to tag. So the desk is decided per item, from the
 * words in the headline and standfirst.
 *
 * Order matters: the specific desks are tested before the general ones, because
 * almost every business story mentions money and would otherwise be swallowed by
 * Markets.
 */
const DESK_RULES: Array<{ section: Section; terms: string[] }> = [
  {
    section: "energy",
    terms: ["oil", "crude", "brent", "opec", "petrol", "gas", "lng", "refinery", "refining", "barrel",
      "solar", "renewable", "wind farm", "wind energy", "hydrogen", "electricity", "power plant",
      "megawatt", "grid", "aramco", "adnoc", "energy"],
  },
  {
    section: "real-estate",
    terms: ["real estate", "property", "housing", "resident", "construction", "contractor", "developer",
      "tower", "villa", "apartment", "mortgage", "cement", "giga-project", "neom", "qiddiya", "roshn",
      "diriyah", "red sea project", "master plan", "land plot"],
  },
  {
    section: "trade",
    terms: ["port", "shipping", "shipment", "cargo", "container", "freight", "logistics", "supply chain",
      "export", "import", "customs", "tariff", "trade", "teu", "airline", "aviation", "airport", "carrier",
      "tourism", "hospitality", "retail sales", "e-commerce"],
  },
  {
    section: "markets",
    terms: ["tadawul", "stock", "share", "index", "tasi", "bourse", "exchange", "ipo", "listing", "bond",
      "sukuk", "dividend", "earnings", "profit", "revenue", "loss", "fund", "pif", "sovereign wealth",
      "investment", "investor", "valuation", "acquisition", "merger", "stake", "bank", "lender", "loan",
      "credit", "fintech", "startup", "funding", "venture", "gdp", "inflation", "currency", "riyal"],
  },
  {
    section: "policy",
    terms: ["ministry", "minister", "regulation", "regulator", "law", "licence", "license", "authority",
      "cabinet", "government", "budget", "tax", "zatca", "sama", "central bank", "reform", "vision 2030",
      "agreement", "pact", "summit", "policy", "sanction", "ruling", "decree", "council"],
  },
];

function classify(title: string, summary: string, fallback: Section): Section {
  const hay = `${title} ${summary}`.toLowerCase();
  for (const rule of DESK_RULES) {
    if (rule.terms.some((t) => hay.includes(t))) return rule.section;
  }
  return fallback;
}

/**
 * Relevance gate.
 *
 * Two things have to be true for a story to earn a place. It has to be about
 * business or the economy, and it has to be about the Kingdom or its immediate
 * neighbourhood. The first live build failed the second test badly — a Gulf
 * business front page led with Colombian politics and a drought in Indonesia,
 * because a general news feed simply publishes more often than any business
 * desk does.
 *
 * Saudi Arabia counts on its own. The wider Gulf counts too, but a story has to
 * be unambiguously business to get in on Gulf terms alone — Marsa is published
 * from Jeddah and the mix should read that way.
 */
const BUSINESS_TERMS = [
  "market", "stock", "share", "index", "tadawul", "bourse", "exchange", "investor", "investment",
  "fund", "ipo", "listing", "bond", "sukuk", "dividend", "earnings", "profit", "revenue",
  "economy", "economic", "gdp", "inflation", "budget", "deficit", "surplus", "tariff", "trade",
  "export", "import", "oil", "crude", "brent", "opec", "gas", "lng", "energy", "refinery", "barrel",
  "bank", "lender", "loan", "credit", "central bank", "currency", "riyal", "dirham",
  "aramco", "sabic", "pif", "adnoc", "mubadala", "neom", "acwa", "emaar", "sovereign wealth",
  "startup", "fintech", "venture", "funding", "valuation", "acquisition", "merger", "deal", "stake",
  "property", "real estate", "construction", "contract", "project", "port", "logistics", "shipping",
  "airline", "aviation", "tourism", "retail", "company", "firm", "ceo", "business", "billion", "million",
  "regulation", "licence", "license", "ministry", "authority", "tax", "reform", "vision 2030",
];

const SAUDI_TERMS = [
  "saudi", "riyadh", "jeddah", "makkah", "mecca", "madinah", "medina", "dammam", "khobar", "yanbu",
  "neom", "qiddiya", "diriyah", "roshn", "tadawul", "tasi", "aramco", "sabic", "pif", "sama", "zatca",
  "kingdom", "ksa", "vision 2030", "red sea",
];

const GULF_TERMS = [
  "uae", "emirates", "dubai", "abu dhabi", "sharjah", "qatar", "doha", "kuwait", "bahrain", "manama",
  "oman", "muscat", "gulf", "gcc", "opec",
];

function isRelevant(item: { title: string; summary: string }, broad: boolean): boolean {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  const business = BUSINESS_TERMS.some((t) => hay.includes(t));
  if (!business) return false;

  const saudi = SAUDI_TERMS.some((t) => hay.includes(t));
  if (saudi) return true;

  // Gulf-but-not-Saudi is welcome from a business desk, and only from a
  // business desk — a general feed needs the Kingdom in it to qualify.
  return !broad && GULF_TERMS.some((t) => hay.includes(t));
}

/** How many of a desk's stories may come from any single publisher. */
const MAX_PER_SOURCE = 14;

/** Headlines about the same event differ in punctuation and house style. *//** Headlines about the same event differ in punctuation and house style. */
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
  // Always read every source: a desk is a view over the classified stream, not
  // a subset of feeds, so Energy stories filed to a general business feed still
  // reach the Energy page.
  const chosen = SOURCES;

  const settled = await Promise.all(
    chosen.map(async (source) => ({ source, items: await fetchOne(source, timeoutMs) })),
  );

  const failed: string[] = [];
  const seen = new Set<string>();
  const perSource = new Map<string, number>();
  const merged: NewsItem[] = [];

  for (const { source, items } of settled) {
    if (!items.length) {
      failed.push(source.name);
      continue;
    }

    for (const raw of items) {
      if (!isRelevant(raw, Boolean(source.broad))) continue;

      const used = perSource.get(source.id) ?? 0;
      if (used >= MAX_PER_SOURCE) continue;

      const key = dedupeKey(raw.title);
      if (!key || seen.has(key)) continue;

      seen.add(key);
      perSource.set(source.id, used + 1);
      merged.push({ ...raw, section: classify(raw.title, raw.summary, source.section) });
    }
  }

  merged.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const scoped = sections?.length ? merged.filter((i) => sections.includes(i.section)) : merged;
  const items = scoped.slice(0, limit);

  // Report the sources actually represented on the page, not the ones that
  // merely answered — a name in the "reading" line that has no headline under
  // it is a small lie about where the page came from.
  const ok = Array.from(new Set(items.map((i) => i.sourceName)));

  return {
    items,
    ok,
    failed: Array.from(new Set(failed)).filter((n) => !ok.includes(n)),
    fetchedAt: new Date().toISOString(),
  };
}

/** Decode a preview-route id back to the publisher URL it came from. */
export function decodeItemId(id: string): string | null {
  try {
    const url = Buffer.from(id, "base64url").toString("utf8");
    return /^https?:\/\//i.test(url) ? url : null;
  } catch {
    return null;
  }
}

/**
 * Find one story for the in-app preview.
 *
 * Items live only as long as their publisher keeps them on the feed, so a
 * preview link can legitimately go stale. When that happens the route says so
 * and offers the publisher URL rather than pretending the story never existed.
 */
export async function getItemById(id: string): Promise<{ item: NewsItem | null; url: string | null }> {
  const url = decodeItemId(id);
  if (!url) return { item: null, url: null };
  const news = await getNews({ limit: 400 });
  return { item: news.items.find((i) => i.id === id) ?? null, url };
}
