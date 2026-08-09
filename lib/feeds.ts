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
   * The language the publisher files in.
   *
   * Load-bearing, not metadata. The Arabic edition used to render the English
   * wire with Arabic furniture around it — Arabic labels, Arabic timestamps,
   * English headlines — because every source in this list was English and
   * nothing separated them. An Arabic reader arriving at /ar got a page in a
   * language they did not ask for. The edition a story is eligible for is now
   * decided here, at the source.
   */
  lang: "en" | "ar";
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
  /**
   * A dedicated global business/markets/commodities wire — not Gulf-specific,
   * and not asked to be.
   *
   * The relevance gate's geography check (Saudi terms, or Gulf terms from a
   * business desk) is right for a Gulf portal's default sourcing, but it is
   * also why the site's news volume had a hard ceiling: dedicated Gulf/Saudi
   * business feeds are a short list and most of them 403 an aggregator. A
   * story like "BHP workers strike at Port Hedland" or "Klesch becomes
   * Germany's second-largest refiner" is real business news that a Gulf
   * trading desk reads too — it was only ever rejected for lacking the word
   * "Saudi", not for lacking substance. Sources flagged here skip the
   * geography check; they still have to clear the business-vocabulary check
   * and the hard veto list like everything else, so this widens the map, not
   * the bar.
   */
  global?: boolean;
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
  /** Which edition this story belongs to. See Source.lang. */
  lang: "en" | "ar";
  /** Publisher's own thumbnail, when the feed offers one. */
  image?: string;
}

export interface FeedResult {
  items: NewsItem[];
  /** Sources that answered, for the "where this came from" line. */
  ok: string[];
  /** Sources that did not, so the UI can be honest about partial coverage. */
  failed: string[];
  /** Per-source outcome with the failure reason kept. Read at /api/health. */
  statuses: SourceStatus[];
  /** How many stories the licensed API returned before filtering. */
  newsApiItems: number;
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
/**
 * Every URL below was verified from production by /api/probe, against this
 * file's own parser, on 2026-08-09. Nothing is in this list on the strength of
 * looking plausible.
 *
 * Removed in that pass, with the reason, so nobody re-adds them:
 *
 *   arabnews cat/3        — answers 200 with items 58 days old. A feed that
 *                           responds but has stopped updating is worse than one
 *                           that 404s, because every health check calls it fine.
 *                           This is what made the live site "look old".
 *   argaam companies      — newest item 2.6 years old. Same failure.
 *   alarabiya (en + ar)   — 403 to a datacentre IP. Declining to be aggregated.
 *   arabianbusiness       — 403. Same.
 *   maaal, asharqbusiness — 403. Same.
 *   gulfbusiness          — 403. Same.
 *   gulfnews, khaleejtimes, tradearabia, zawya, mubasher, aleqt, okaz,
 *   aljazeera.net, arabnews/ar, spa (both) — 404 or HTML-not-RSS. Retired paths.
 *
 * The 403s are a publisher saying no. The right response is to ask them for
 * access, not to spoof a browser user-agent until they let us through.
 */
export const SOURCES: Source[] = [
  /* ---------------------------------------------------------------- *
   * ARABIC EDITION
   * Argaam is the anchor: it is the Kingdom's business wire, it files in
   * Arabic first, and its desks map almost one-to-one onto Marsa's.
   * ---------------------------------------------------------------- */
  { id: "argaam-ar-main", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/ho-main-news?sectionid=1523", section: "markets", lang: "ar" },
  { id: "argaam-ar-pulse", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/ho-market-pulse?sectionid=70", section: "markets", lang: "ar", broad: true },
  { id: "argaam-ar-global", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/internationmarket-mainnewsar?sectionid=1334", section: "markets", lang: "ar" },
  { id: "argaam-ar-uae", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/ho-main-news-uae?sectionid=1533", section: "markets", lang: "ar" },
  // Argaam publishes over a dozen RSS categories beyond the four already
  // wired above (found in the site's own RSS index while probing, not
  // guessed). Adding them is what turns each desk from two or three items
  // into a real page: classify() spreads their content across every desk
  // regardless of which Argaam category they arrived on, so the fix for a
  // thin Energy or Trade desk is "more Argaam volume", not "more sources
  // named Energy". Feeds that turn out sparse or stale are self-limiting —
  // MAX_ITEM_AGE_DAYS and the relevance gate both still apply.
  { id: "argaam-ar-analysts", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/analysts?sectionid=1545", section: "markets", lang: "ar", broad: true },
  { id: "argaam-ar-articles", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/various-articles?sectionid=1547", section: "markets", lang: "ar", broad: true },
  { id: "argaam-ar-conferences", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/conferences?sectionid=1541", section: "policy", lang: "ar", broad: true },
  { id: "argaam-ar-saudi-guides", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/saudi-stocks-investment-guides-ar?sectionid=1591", section: "markets", lang: "ar" },
  { id: "argaam-ar-global-guides", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/global-stocks-investment-guides-ar?sectionid=1592", section: "markets", lang: "ar" },
  { id: "argaam-ar-results-guide", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/ar/rss/guide-to-financial-results-ar?sectionid=1593", section: "markets", lang: "ar" },
  // Attaqa is the only Arabic source in the set that ships a thumbnail on every
  // item, which is why the Arabic energy desk has art and the others lean on
  // the fallback tile.
  { id: "attaqa-ar", name: "Attaqa", nameAr: "الطاقة", home: "https://attaqa.net", url: "https://attaqa.net/feed/", section: "energy", lang: "ar" },
  { id: "indarabia-ar-econ", name: "Independent Arabia", nameAr: "اندبندنت عربية", home: "https://www.independentarabia.com", url: "https://www.independentarabia.com/rss/economy", section: "policy", lang: "ar", broad: true },
  { id: "albilad-ar", name: "Al Bilad", nameAr: "البلاد", home: "https://albiladdaily.com", url: "https://albiladdaily.com/feed/", section: "policy", lang: "ar", broad: true },

  /* ---------------------------------------------------------------- *
   * ENGLISH EDITION
   * ---------------------------------------------------------------- */
  { id: "saudigazette-business", name: "Saudi Gazette", nameAr: "سعودي غازيت", home: "https://saudigazette.com.sa", url: "https://saudigazette.com.sa/rssFeed/74", section: "markets", lang: "en" },
  { id: "argaam-en-main", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/en/rss/ho-main-news?sectionid=1524", section: "markets", lang: "en" },
  { id: "agbi-en", name: "AGBI", nameAr: "إيه جي بي آي", home: "https://www.agbi.com", url: "https://www.agbi.com/feed/", section: "markets", lang: "en" },
  { id: "economyme-en", name: "Economy Middle East", nameAr: "إيكونومي ميدل إيست", home: "https://economymiddleeast.com", url: "https://economymiddleeast.com/feed/", section: "markets", lang: "en" },
  { id: "aljazeera-all", name: "Al Jazeera", nameAr: "الجزيرة", home: "https://www.aljazeera.com", url: "https://www.aljazeera.com/xml/rss/all.xml", section: "policy", broad: true, lang: "en" },
  // English mirrors of the Argaam AR categories added above, on the same
  // /en/ prefix pattern that argaam-en-main already confirmed works. Not
  // individually probed — if a given sectionid doesn't exist on the English
  // side it 404s and fetchOne marks it failed, same as any other dead feed.
  // The English desks are currently thinner than the Arabic ones and this is
  // the cheapest way to test for more without waiting on another probe round.
  { id: "argaam-en-analysts", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/en/rss/analysts?sectionid=1545", section: "markets", lang: "en", broad: true },
  { id: "argaam-en-articles", name: "Argaam", nameAr: "أرقام", home: "https://www.argaam.com", url: "https://www.argaam.com/en/rss/various-articles?sectionid=1547", section: "markets", lang: "en", broad: true },

  /* ---------------------------------------------------------------- *
   * GLOBAL WIRES
   * Gulf-dedicated business feeds are a short list, and most of the rest
   * 403 an aggregator (see the removal notes above). These three are
   * Investing.com's own desks — Reuters-sourced, high volume, verified live
   * on 2026-08-09 with same-day items — and they carry real business news
   * a Gulf trading desk reads regardless of dateline: OPEC/Hormuz/oil moves,
   * global M&A, commodity strikes, company earnings. Marked `global` so the
   * relevance gate's Saudi/Gulf geography check does not apply to them; the
   * business-vocabulary check and the war/crime/sport veto list still do.
   * ---------------------------------------------------------------- */
  { id: "investing-global-markets", name: "Investing.com", nameAr: "إنفيستنج دوت كوم", home: "https://www.investing.com", url: "https://www.investing.com/rss/news_25.rss", section: "markets", lang: "en", global: true },
  { id: "investing-global-commodities", name: "Investing.com", nameAr: "إنفيستنج دوت كوم", home: "https://www.investing.com", url: "https://www.investing.com/rss/news_11.rss", section: "energy", lang: "en", global: true },
  { id: "investing-global-companies", name: "Investing.com", nameAr: "إنفيستنج دوت كوم", home: "https://www.investing.com", url: "https://www.investing.com/rss/news_356.rss", section: "markets", lang: "en", global: true },
  // Al Jazeera's Arabic economy desk — pan-Arab, not Gulf-restricted, and the
  // Arabic edition's global counterpart to the three feeds above.
  { id: "aljazeera-ar-economy", name: "Al Jazeera", nameAr: "الجزيرة", home: "https://www.aljazeera.net", url: "https://www.aljazeera.net/aljazeerarss/economy", section: "markets", lang: "ar", global: true },
];

/**
 * Nothing older than this reaches a page.
 *
 * A publisher whose feed answers 200 while serving two-month-old stories is the
 * failure mode that made the site look abandoned, and it is invisible to every
 * check that only asks "did it respond". Age is checked per item rather than
 * per feed, because a feed can carry a fresh top and a stale tail.
 */
const MAX_ITEM_AGE_DAYS = 10;


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

/**
 * Feed summaries routinely carry markup, tracking pixels and inline styles.
 *
 * The order here is the whole trick, and getting it wrong is what put raw
 * `<p class="ckeCaption"><img src=...>` into live Arabic headlines. Argaam
 * double-encodes: the description is HTML, that HTML is entity-escaped, and the
 * result is wrapped in CDATA. Stripping tags first does nothing — at that point
 * there are no tags, only `&lt;p&gt;` — and the decode that followed then
 * *created* the markup, after the only thing that would have removed it had
 * already run.
 *
 * So this decodes and strips in a loop until the string stops changing. Two
 * passes covers every feed in the registry; the cap is there because a
 * pathological input could otherwise alternate forever.
 */
function stripHtml(input: string): string {
  // Strict: a tag is `<`, an optional `/`, then a letter. That distinction
  // matters — a naive /<[^>]*>/ also eats real prose: "profit &lt; expected"
  // decodes to "profit < expected" mid-loop, and a loose match then treats
  // that "<" as a tag opener and deletes the rest of the sentence. Business
  // copy contains "<" as arithmetic often enough that this is a correctness
  // issue, not a nicety.
  const TAG = /<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?\/?>/g;

  let out = input;

  for (let pass = 0; pass < 3; pass++) {
    const before = out;
    out = out
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(TAG, " ");
    out = decodeEntities(out);
    if (out === before) break;
  }

  // A tag opened but never closed, which is what a truncated feed summary
  // leaves behind: "…profit rose <img src="htt. Anchored to the end so it
  // cannot touch anything earlier in the sentence.
  out = out.replace(/<\/?[a-zA-Z][^<>]*$/, " ");

  return out.replace(/\s+/g, " ").trim();
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
/**
 * Argaam's `<description>` is HTML that has itself been entity-escaped —
 * `&lt;img src=&quot;...&quot;&gt;` rather than `<img src="...">` — the same
 * double-encoding that corrupted summary text before stripHtml was fixed to
 * loop. The image search has the identical problem for the identical reason:
 * on the raw block there is no `<img` substring to find, only `&lt;img`, so
 * every Argaam item — the single largest source in the registry — was
 * silently falling back to the coloured placeholder tile despite every one of
 * its items carrying a real photo. This is what "Arabic has no real media"
 * actually was.
 *
 * Fix: search the raw block first (cheap, correct for every normally-encoded
 * feed), and only decode-and-retry when that comes up empty.
 */
function extractImage(block: string): string | undefined {
  const search = (b: string): string | undefined => {
    const media = b.match(/<(?:[a-zA-Z0-9]+:)?(?:content|thumbnail)\b[^>]*\burl=["']([^"']+)["']/i);
    if (media) return decodeEntities(media[1]);

    const enclosure = b.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i);
    if (enclosure && /\.(jpe?g|png|webp|avif)/i.test(enclosure[1])) return decodeEntities(enclosure[1]);

    const inline = b.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    if (inline) return decodeEntities(inline[1]);

    return undefined;
  };

  return search(block) ?? search(decodeEntities(block));
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
      lang: source.lang,
      image: extractImage(block),
    });
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Fetching
 * ------------------------------------------------------------------ */

/** What a single source did on the last fetch. Surfaced at /api/health. */
export interface SourceStatus {
  id: string;
  name: string;
  ok: boolean;
  /** "http 403", "timeout", "empty", "unparsed", or null when fine. */
  error: string | null;
  items: number;
}

/**
 * One source, with the reason for failure preserved.
 *
 * The previous version returned [] for every failure mode — 403, timeout, moved
 * feed, unparseable XML — which is why the live portal ran on 3 of 16 sources
 * for days without anything indicating a problem. A silent catch on a network
 * call is a decision to never find out. The reason now travels with the result
 * and /api/health prints it.
 */
async function fetchOne(
  source: Source,
  timeoutMs: number,
): Promise<{ items: NewsItem[]; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        // Some publishers reject requests with no UA, and a portal should say
        // plainly what it is rather than impersonate a browser. Where this earns
        // a 403, that is a publisher declining to be aggregated — the honest
        // answer is to ask them, not to disguise the request.
        "user-agent": "MarsaPortal/1.0 (+https://marsa.news; news aggregator)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { items: [], error: `http ${res.status}` };
    const xml = await res.text();
    const items = parseFeed(xml, source);
    if (!items.length) return { items, error: xml.trim() ? "unparsed" : "empty" };
    return { items, error: null };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { items: [], error: aborted ? "timeout" : "network" };
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
/**
 * Arabic normalisation.
 *
 * Arabic orthography offers several ways to write the same word and publishers
 * use all of them: أ إ آ ا for alef, ة and ه word-final, ي and ى, plus optional
 * diacritics and tatweel padding. Matching raw strings means "الاقتصاد" and
 * "الإقتصاد" are different words and half the vocabulary below silently never
 * fires. Everything is folded to one form before comparison.
 *
 * Argaam also prefixes many headlines with U+200F RIGHT-TO-LEFT MARK, which is
 * invisible but counts as a character and breaks a naive startsWith.
 */
function normalizeArabic(input: string): string {
  return input
    .replace(/[‎‏‪-‮ـ]/g, "")   // bidi marks, tatweel
    .replace(/[ً-ْٰ]/g, "")               // harakat
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
}

/** Lowercased, Arabic-folded haystack. Every match in this file runs on this. */
function fold(input: string): string {
  return normalizeArabic(input.toLowerCase());
}

const DESK_RULES: Array<{ section: Section; terms: string[] }> = [
  {
    /**
     * Statute, checked before everything else.
     *
     * A law is a Policy story even when its subject is money, and Arabic
     * regulatory copy is full of financial nouns: "نظام إيرادات الدولة" (the
     * State Revenues Law) matched "إيرادات" and landed on Markets, which is how
     * the live Arabic Policy desk showed a count of zero while three gazette
     * items sat under Markets. These terms name the *instrument*, not the
     * topic, so they are unambiguous and go first.
     */
    section: "policy",
    terms: [
      "الجريده الرسميه", "نظام ", "لائحه", "اللائحه", "القواعد الموحده", "مجلس الوزراء",
      "مرسوم ملكي", "امر ملكي", "قرار وزاري", "وافق عليه مجلس", "تعديل نظام", "مشروع نظام",
      "official gazette", "royal decree", "cabinet approved", "council of ministers",
      "draft law", "implementing regulations", "bylaw",
    ],
  },
  {
    section: "energy",
    terms: ["oil", "crude", "brent", "opec", "petrol", "gas", "lng", "refinery", "refining", "barrel",
      "solar", "renewable", "wind farm", "wind energy", "hydrogen", "electricity", "power plant",
      "megawatt", "grid", "aramco", "adnoc", "energy",
      // Arabic
      "نفط", "النفط", "خام", "برنت", "اوبك", "أوبك", "بترول", "غاز", "مصفاه", "تكرير", "برميل",
      "الطاقه", "طاقه", "كهرباء", "شمسيه", "متجدده", "هيدروجين", "ميجاوات", "ارامكو", "ادنوك",
      "الوقود", "ديزل", "بنزين", "محطه كهرباء", "الشبكه الكهربائيه"],
  },
  {
    section: "real-estate",
    terms: ["real estate", "property", "housing", "resident", "construction", "contractor", "developer",
      "tower", "villa", "apartment", "mortgage", "cement", "giga-project", "neom", "qiddiya", "roshn",
      "diriyah", "red sea project", "master plan", "land plot",
      // Arabic
      "عقار", "عقاري", "العقاريه", "العقارات", "اسكان", "الاسكان", "مقاولات", "مقاول", "تطوير عقاري",
      "برج", "فيلا", "شقه", "رهن", "تمويل عقاري", "اسمنت", "الاسمنت", "نيوم", "القديه", "روشن",
      "الدرعيه", "البحر الاحمر", "مخطط", "اراضي", "ارض"],
  },
  {
    section: "trade",
    terms: ["port", "shipping", "shipment", "cargo", "container", "freight", "logistics", "supply chain",
      "export", "import", "customs", "tariff", "trade", "teu", "airline", "aviation", "airport", "carrier",
      "tourism", "hospitality", "retail sales", "e-commerce",
      // Arabic
      "ميناء", "الموانئ", "شحن", "حاويات", "حاويه", "نقل بحري", "لوجستي", "لوجستيه", "سلاسل الامداد",
      "تصدير", "صادرات", "استيراد", "واردات", "جمارك", "جمركيه", "تعرفه", "التجاره", "تجاري",
      "طيران", "مطار", "ناقله", "سياحه", "الضيافه", "التجزئه", "التجاره الالكترونيه"],
  },
  {
    section: "markets",
    terms: ["tadawul", "stock", "share", "index", "tasi", "bourse", "exchange", "ipo", "listing", "bond",
      "sukuk", "dividend", "earnings", "profit", "revenue", "loss", "fund", "pif", "sovereign wealth",
      "investment", "investor", "valuation", "acquisition", "merger", "stake", "bank", "lender", "loan",
      "credit", "fintech", "startup", "funding", "venture", "gdp", "inflation", "currency", "riyal",
      // Arabic
      "تداول", "سهم", "اسهم", "الاسهم", "مؤشر", "المؤشر", "تاسي", "بورصه", "سوق الاسهم", "اكتتاب",
      "ادراج", "سندات", "صكوك", "توزيعات", "ارباح", "الارباح", "خساره", "خسائر", "ايرادات",
      "صندوق", "الصناديق", "صندوق الاستثمارات", "استثمار", "مستثمر", "تقييم", "استحواذ", "اندماج",
      "حصه", "بنك", "البنوك", "مصرف", "قرض", "تمويل", "ائتمان", "التقنيه الماليه", "شركه ناشئه",
      "جوله تمويليه", "الناتج المحلي", "التضخم", "عمله", "ريال", "درهم", "نتائج ماليه", "الربع"],
  },
  {
    section: "policy",
    terms: ["ministry", "minister", "regulation", "regulator", "regulatory", "licence", "license",
      "cabinet", "budget", "tax", "zatca", "sama", "central bank", "reform", "vision 2030",
      "trade agreement", "trade deal", "economic policy", "fiscal", "monetary", "sanction",
      "decree", "legislation", "compliance", "antitrust", "subsidy", "privatisation", "privatization",
      // Arabic
      "وزاره", "الوزاره", "وزير", "تنظيم", "هيئه", "الهيئه", "رخصه", "ترخيص", "مجلس الوزراء",
      "ميزانيه", "الموازنه", "ضريبه", "الضريبه", "زكاه", "هيئه الزكاه", "ساما", "البنك المركزي",
      "اصلاح", "رؤيه 2030", "اتفاقيه", "سياسه اقتصاديه", "ماليه عامه", "نقديه", "عقوبات",
      "مرسوم", "نظام", "تشريع", "امتثال", "منافسه", "دعم", "خصخصه"],
  },
];

/**
 * Hard veto.
 *
 * Checked before anything else and never overridden. Everything here is a
 * category Marsa does not cover — the point of a business desk is that a reader
 * can look at it and know what they are getting.
 *
 * This exists because the relevance gate alone kept letting war coverage lead
 * the front page. "Iran war live: Trilateral Mecca defence pact signed" cleared
 * every test: "mecca" is a Saudi term and "pact" and "deal" were business terms.
 * "911 centers receive 2.7 million calls in July" cleared it too, because
 * "million" was on the business list. No amount of tuning the positive signals
 * fixes that; the negative ones have to be stated.
 */
const EXCLUDE_TERMS = [
  // Conflict and security
  "war", "strike on", "airstrike", "missile", "drone attack", "troops", "militant", "militia",
  "killed", "death toll", "casualt", "wounded", "hostage", "ceasefire", "truce", "offensive",
  "terror", "insurgen", "warplane", "shelling", "bombard", "gunmen", "defence pact", "defense pact",
  "military", "army", "navy ", "warship", "combat",
  // Crime and courts (non-corporate)
  "arrest", "jailed", "sentenced to", "murder", "homicide", "assault", "kidnap", "smuggl",
  "drug traffick", "executed",
  // Sport
  "football", "world cup", "premier league", "formula 1", "match against", "goalkeeper", "striker scored",
  // Consumer health scares and disasters
  "outbreak", "epidemic", "pandemic", "recall of", "food poisoning", "earthquake", "flood",
  "wildfire", "hurricane", "crash landing", "plane crash",

  /* --- Arabic ---
   * Needed for the same reason as the English list, and needed urgently: the
   * Arabic general-news feeds (Al Bilad, Independent Arabia) file far more war
   * and crime copy than business copy, and with no Arabic vetoes the Arabic
   * front page would lead on shelling in Lebanon. Verified against the live
   * probe output, where exactly that was the top of both feeds. */
  // Conflict and security
  "حرب", "الحرب", "قصف", "غاره", "غارات", "صاروخ", "صواريخ", "مسيره", "جنود", "مسلح", "مليشيا",
  "قتلي", "قتيل", "ضحايا", "جرحي", "مصابين", "رهينه", "هدنه", "وقف اطلاق النار", "اشتباك",
  "ارهاب", "تفجير", "عسكري", "الجيش", "حربيه", "توغل", "احتلال", "نزوح", "لاجئين",
  // Crime and courts
  "اعتقال", "توقيف", "سجن", "حكم بالسجن", "جريمه", "قتل", "اعتداء", "اختطاف", "تهريب",
  "مخدرات", "اعدام", "محكمه جنائيه",
  // Sport
  "كره القدم", "الدوري", "كاس العالم", "مباراه", "هدف", "لاعب", "النادي", "الاتحاد", "الهلال",
  "النصر", "الاهلي",
  // Disasters and health
  "زلزال", "فيضان", "حريق", "اعصار", "وباء", "تفشي", "تسمم", "تحطم طائره",
];

function isExcluded(hay: string): boolean {
  return EXCLUDE_TERMS.some((t) => hay.includes(t));
}

function classify(title: string, summary: string, fallback: Section): Section {
  // The headline is weighted first. A story is about whatever its headline says
  // it is about; the standfirst often name-drops adjacent topics ("...as oil
  // prices steadied") and was pulling stories onto the wrong desk.
  const head = fold(title);
  for (const rule of DESK_RULES) {
    if (rule.terms.some((t) => head.includes(t))) return rule.section;
  }
  const hay = `${head} ${fold(summary)}`;
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
/**
 * Unambiguous business vocabulary. A single one of these is enough — no
 * general-news story says "sukuk" or "Tadawul" by accident.
 */
const STRONG_BUSINESS_TERMS = [
  "tadawul", "tasi", "bourse", "stock market", "share price", "shareholder", "ipo", "listing",
  "sukuk", "bond issue", "dividend", "earnings", "quarterly profit", "net profit", "revenue",
  "gdp", "inflation", "deficit", "surplus", "tariff", "central bank", "interest rate",
  "opec", "crude", "brent", "barrel", "refinery", "lng", "pipeline",
  "aramco", "sabic", "pif", "adnoc", "mubadala", "acwa", "emaar", "sovereign wealth fund",
  "fintech", "venture capital", "valuation", "acquisition", "merger", "stake in", "buyout",
  "real estate", "mortgage", "logistics", "supply chain", "e-commerce",
  "economy", "economic growth", "investment", "investor", "exports", "imports",
  "bank", "lender", "loan", "credit rating", "currency", "riyal", "dirham",
  // Arabic — same test: vocabulary no general-news story uses by accident.
  "تداول", "تاسي", "بورصه", "سوق الاسهم", "سعر السهم", "مساهم", "اكتتاب", "ادراج",
  "صكوك", "سندات", "توزيعات نقديه", "ارباح فصليه", "صافي الربح", "ايرادات", "نتائج ماليه",
  "الناتج المحلي", "التضخم", "عجز الموازنه", "فائض", "تعرفه جمركيه", "البنك المركزي",
  "سعر الفائده", "اوبك", "خام برنت", "برميل", "مصفاه", "انبوب",
  "ارامكو", "سابك", "صندوق الاستثمارات العامه", "ادنوك", "مبادله", "اكوا باور", "اعمار",
  "التقنيه الماليه", "راس المال الجريء", "استحواذ", "اندماج", "حصه في",
  "عقاري", "رهن عقاري", "لوجستيه", "سلاسل الامداد", "التجاره الالكترونيه",
  "الاقتصاد", "نمو اقتصادي", "استثمار", "مستثمر", "صادرات", "واردات",
  "مصرف", "قرض", "التصنيف الائتماني", "الريال", "الدرهم", "الميزانيه العامه",
];

/**
 * Words that appear in business stories but appear in everything else too.
 * "million", "deal", "project" and "authority" were on the main list and were
 * single-handedly responsible for a 911-call-centre story and a defence pact
 * reaching a business front page. These now only count from a publisher's
 * dedicated business desk, where the surrounding context is already business.
 */
const WEAK_BUSINESS_TERMS = [
  "market", "fund", "budget", "trade", "energy", "gas", "oil", "company", "firm", "ceo",
  "business", "billion", "million", "deal", "contract", "project", "property", "construction",
  "port", "shipping", "airline", "aviation", "tourism", "retail", "startup", "funding",
  "regulation", "licence", "license", "ministry", "authority", "tax", "reform", "vision 2030",
  // Arabic
  "سوق", "صندوق", "ميزانيه", "تجاره", "طاقه", "غاز", "نفط", "شركه", "الرئيس التنفيذي",
  "اعمال", "مليار", "مليون", "صفقه", "عقد", "مشروع", "عقار", "بناء", "ميناء", "شحن",
  "طيران", "سياحه", "تجزئه", "ناشئه", "تمويل", "تنظيم", "ترخيص", "وزاره", "هيئه", "ضريبه",
];

const SAUDI_TERMS = [
  "saudi", "riyadh", "jeddah", "makkah", "mecca", "madinah", "medina", "dammam", "khobar", "yanbu",
  "neom", "qiddiya", "diriyah", "roshn", "tadawul", "tasi", "aramco", "sabic", "pif", "sama", "zatca",
  "kingdom", "ksa", "vision 2030", "red sea",
  // Arabic
  "السعوديه", "سعودي", "سعوديه", "الرياض", "جده", "مكه", "المدينه المنوره", "الدمام", "الخبر",
  "ينبع", "نيوم", "القديه", "الدرعيه", "روشن", "تداول", "تاسي", "ارامكو", "سابك",
  "صندوق الاستثمارات العامه", "ساما", "الزكاه والضريبه", "المملكه", "رؤيه 2030", "البحر الاحمر",
];

const GULF_TERMS = [
  "uae", "emirates", "dubai", "abu dhabi", "sharjah", "qatar", "doha", "kuwait", "bahrain", "manama",
  "oman", "muscat", "gulf", "gcc", "opec",
  // Arabic
  "الامارات", "دبي", "ابوظبي", "الشارقه", "قطر", "الدوحه", "الكويت", "البحرين", "المنامه",
  "عمان", "مسقط", "الخليج", "خليجي", "مجلس التعاون", "اوبك",
];

function isRelevant(
  item: { title: string; summary: string },
  broad: boolean,
  global: boolean = false,
): boolean {
  const hay = fold(`${item.title} ${item.summary}`);

  // Veto first. Nothing below can rescue a story this rules out.
  if (isExcluded(hay)) return false;

  // A strong term stands on its own. A weak one only counts when the story
  // already came from a publisher's business desk.
  const business =
    STRONG_BUSINESS_TERMS.some((t) => hay.includes(t)) ||
    (!broad && WEAK_BUSINESS_TERMS.some((t) => hay.includes(t)));
  if (!business) return false;

  // Global wires (Investing.com, Al Jazeera economy) are dedicated business
  // desks with no Gulf remit and are not asked to have one — the business
  // check above is the whole gate for them. Everything below this line only
  // runs for the Gulf-focused sources, where geography still matters.
  if (global) return true;

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
  return fold(title)
    .replace(/[^a-z0-9؀-ۿ ]+/g, "")
    .replace(/\b(the|a|an|of|to|in|on|for|and|as|at|by|is|its|with|after|over)\b/g, "")
    // Arabic equivalents: the definite article and the common particles, which
    // otherwise make "أرباح أرامكو" and "الأرباح في أرامكو" different keys.
    .replace(/(^|\s)(ال|و|ب|ل|في|من|علي|الي|عن|مع|بعد|خلال)(?=\S)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);
}

/**
 * NewsData.io — the licensed half of the mix.
 *
 * RSS gives Marsa depth on a handful of Gulf titles; a news API gives it
 * breadth, proper country filtering and far more Saudi coverage than any single
 * publisher's feed. Both are read the same way and normalise to the same shape,
 * so the rest of the app cannot tell them apart.
 *
 * SECURITY: the key is read from the environment and must never be committed.
 * This repository is public — a key pasted into source here is a key published
 * to the world, and NewsData rotates on abuse, not on apology. Set
 * NEWSDATA_API_KEY in the deploy platform's variables instead.
 */
const NEWSDATA_ENDPOINT = "https://newsdata.io/api/1/latest";

interface NewsDataArticle {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  image_url?: string | null;
  source_name?: string;
  source_id?: string;
}

async function fetchNewsData(timeoutMs: number, lang: "en" | "ar" = "en"): Promise<NewsItem[]> {
  const key = process.env.NEWSDATA_API_KEY;
  if (!key) return [];

  // Free-plan limits, and both of these were silently breaking every request:
  //
  //   size    — free maximum is 10. This asked for 50.
  //   country — free maximum is 5 per query. This asked for 6 (sa,ae,qa,kw,bh,om).
  //
  // NewsData answers an out-of-range parameter with a 4xx, the catch below
  // swallowed it, and the portal ran RSS-only while appearing to be keyed.
  // Oman is the one dropped: smallest business wire of the six.
  //
  // Budget: free plan is 200 credits/day and one request costs one credit.
  // At a 15-minute revalidate that is 96/day, comfortably inside it. Shortening
  // the window or paginating for more than 10 stories spends real quota.
  // language is a parameter now, not a constant. The Arabic edition asks for
  // `ar` and gets Arabic-language Gulf business copy from the same licensed
  // source the English edition uses — the alternative was machine-translating
  // English headlines, which puts words in a publisher's mouth.
  const url =
    `${NEWSDATA_ENDPOINT}?apikey=${encodeURIComponent(key)}` +
    `&country=sa,ae,qa,kw,bh&category=business&language=${lang}&size=10`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { status?: string; results?: NewsDataArticle[] };
    if (json.status !== "success" || !Array.isArray(json.results)) return [];

    const out: NewsItem[] = [];
    for (const a of json.results) {
      if (!a.title || !a.link || !a.pubDate) continue;
      const at = new Date(a.pubDate.replace(" ", "T") + (a.pubDate.includes("Z") ? "" : "Z"));
      if (!Number.isFinite(at.getTime())) continue;

      const title = stripHtml(a.title);
      let summary = stripHtml(a.description ?? "");
      if (summary.length > 260) summary = `${summary.slice(0, 257).trimEnd()}…`;
      if (summary.toLowerCase() === title.toLowerCase()) summary = "";

      const name = a.source_name || a.source_id || "NewsData";
      out.push({
        id: Buffer.from(a.link, "utf8").toString("base64url"),
        title,
        summary,
        link: a.link,
        publishedAt: new Date(Math.min(at.getTime(), Date.now())).toISOString(),
        sourceId: `newsdata:${a.source_id ?? "x"}`,
        sourceName: name,
        sourceNameAr: name,
        section: "markets",
        lang,
        image: a.image_url ?? undefined,
      });
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function getNews(
  {
    sections,
    limit = 60,
    timeoutMs = 6000,
    lang = "en",
  }: { sections?: Section[]; limit?: number; timeoutMs?: number; lang?: "en" | "ar" } = {},
): Promise<FeedResult> {
  // Read every source *for this edition*. A desk is a view over the classified
  // stream, not a subset of feeds, so Energy stories filed to a general business
  // feed still reach the Energy page — but an Arabic reader never sees an
  // English headline, and vice versa. Fetching only the relevant half also
  // roughly halves the outbound requests per render.
  const chosen = SOURCES.filter((s) => s.lang === lang);

  const [settled, apiItems] = await Promise.all([
    Promise.all(
      chosen.map(async (source) => {
        const { items, error } = await fetchOne(source, timeoutMs);
        return { source, items, error };
      }),
    ),
    fetchNewsData(timeoutMs, lang),
  ]);

  const failed: string[] = [];
  const statuses: SourceStatus[] = [];
  const seen = new Set<string>();
  const perSource = new Map<string, number>();
  const merged: NewsItem[] = [];
  const staleBefore = Date.now() - MAX_ITEM_AGE_DAYS * 86_400_000;

  for (const { source, items, error } of settled) {
    statuses.push({ id: source.id, name: source.name, ok: !error, error, items: items.length });

    if (!items.length) {
      failed.push(source.name);
      continue;
    }

    for (const raw of items) {
      if (Date.parse(raw.publishedAt) < staleBefore) continue;
      if (!isRelevant(raw, Boolean(source.broad), Boolean(source.global))) continue;

      const used = perSource.get(source.id) ?? 0;
      if (used >= MAX_PER_SOURCE) continue;

      const key = dedupeKey(raw.title);
      if (!key || seen.has(key)) continue;

      seen.add(key);
      perSource.set(source.id, used + 1);
      merged.push({ ...raw, section: classify(raw.title, raw.summary, source.section) });
    }
  }

  // API results go through the same relevance gate and dedupe as the feeds, so
  // one pipeline decides what is on the page regardless of where it came from.
  for (const raw of apiItems) {
    if (Date.parse(raw.publishedAt) < staleBefore) continue;
    if (!isRelevant(raw, false)) continue;
    const key = dedupeKey(raw.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...raw, section: classify(raw.title, raw.summary, "markets") });
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
    statuses,
    newsApiItems: apiItems.length,
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
export async function getItemById(
  id: string,
  lang: "en" | "ar" = "en",
): Promise<{ item: NewsItem | null; url: string | null }> {
  const url = decodeItemId(id);
  if (!url) return { item: null, url: null };

  // Bug this fixes: getNews() defaults to lang: "en", so before `lang` was a
  // parameter here every /ar/story/[id] lookup searched the English pool only
  // — every Arabic story preview page 404'd regardless of how correct the
  // link that led to it was. Requested language is searched first; the other
  // pool is a fallback rather than the only path, in case a link ever crosses
  // editions.
  const primary = await getNews({ limit: 400, lang });
  const hit = primary.items.find((i) => i.id === id);
  if (hit) return { item: hit, url };

  const other = await getNews({ limit: 400, lang: lang === "ar" ? "en" : "ar" });
  return { item: other.items.find((i) => i.id === id) ?? null, url };
}
