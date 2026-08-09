/**
 * One canonical origin for the whole site.
 *
 * Every absolute URL Marsa emits — sitemap entries, RSS links, canonical tags,
 * hreflang alternates, Open Graph images, JSON-LD identifiers — has to agree,
 * or search engines index the same story under several addresses and split its
 * ranking between them. Before this file the root layout advertised
 * `https://marsa.example` in its structured data, which is a reserved
 * documentation domain: every crawler that read it was told the publisher lived
 * at an address that cannot exist.
 *
 * Set SITE_URL in the deploy platform once the real domain is attached. The
 * fallback is the live Railway host, not a placeholder, so nothing here is ever
 * wrong-but-plausible.
 */

const RAW =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://marsaa-production-6e50.up.railway.app";

/** No trailing slash — every consumer below appends its own path. */
export const SITE_URL = RAW.replace(/\/+$/, "");

export const SITE = {
  url: SITE_URL,
  name: "Marsa",
  nameAr: "مرسى",
  tagline: "MENA business news, from Jeddah",
  taglineAr: "أخبار الأعمال، من جدة",
  description:
    "Marsa collects Gulf and wider-MENA business reporting — markets, energy, real estate, trade and policy — into one timestamped, attributed feed, published from Jeddah.",
  descriptionAr:
    "مرسى يجمع أخبار الأعمال الخليجية والعربية — الأسواق والطاقة والعقارات والتجارة والسياسات — في مكان واحد، بمصادرها وتوقيتها، من جدة.",
  locale: "en_US",
  localeAr: "ar_SA",
  city: "Jeddah",
  country: "SA",
} as const;

export function absolute(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
