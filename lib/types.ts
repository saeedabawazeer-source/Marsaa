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
