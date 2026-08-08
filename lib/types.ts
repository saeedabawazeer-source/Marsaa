export type Category = "markets" | "energy" | "trade" | "startups" | "real-estate" | "policy";

export interface Article {
  slug: string;
  title: string;
  dek: string;
  body: string[];
  category: Category;
  readMins: number;
  publishedAt: string; // ISO date
  desk: string;
  // Full Arabic translation — required so /ar is a real 1:1 mirror of the
  // English site, not a partial/second-class edition. See lib/labels.ts for
  // the matching bilingual category/desk labels.
  titleAr: string;
  dekAr: string;
  bodyAr: string[];
  // TODO(cms): once a real photo pipeline exists, set this to a hosted image
  // URL and CoverArt-consuming components will render it instead of the
  // abstract placeholder icon. Left undefined for now — see docs/business.md
  // note on why this project can't fetch/verify real photos from this sandbox.
  coverImage?: string;
  coverImageAlt?: string;
}

export interface MarketTick {
  label: string;
  value: string;
  direction: "up" | "down" | "flat";
}

/**
 * A single line on the market wire — the timestamped one-liners that run down
 * the front page. These are deliberately NOT links: a wire item is a fact with
 * a time on it, the same way Argaam's corporate-events strip or Bloomberg's
 * first-word tape works. Anything that deserves a page of its own is an
 * Article, not a WireItem.
 */
export interface WireItem {
  id: string;
  text: string;
  textAr: string;
  category: Category;
  /** ISO datetime, computed at render so the wire is never stale on screen. */
  at: string;
}
