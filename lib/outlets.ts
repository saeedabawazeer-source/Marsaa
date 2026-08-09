/**
 * Publisher identity.
 *
 * Cards used to attribute with a text string. A masthead is a visual thing —
 * readers recognise Argaam's mark or Al Arabiya's long before they finish
 * reading the words — and on a dense feed a small logo is faster to scan and
 * takes less room than the name spelled out.
 *
 * Logos are the publishers' own favicons, served through this app's proxy
 * (/api/outlet-logo) rather than hot-linked. Three reasons, in order of weight:
 *
 *   1. Privacy. A hot-linked image is a request from the reader's browser to a
 *      third party, carrying their IP and referrer, on every card. That is a
 *      tracking surface Marsa would have to disclose and cannot control. The
 *      proxy means the reader talks only to Marsa.
 *   2. Stability. Publishers move favicons; the proxy caches and falls back.
 *   3. Layout. One normalised size, so the grid never jumps.
 *
 * `brand` and `initials` drive the fallback tile when a publisher has no usable
 * mark, so a card is never left with an empty square.
 */

export interface Outlet {
  /** Bare hostname, no scheme, no path. Also the proxy allowlist key. */
  domain: string;
  name: string;
  nameAr: string;
  /** The outlet's own colour, used for the monogram fallback tile. */
  brand: string;
  /** 1-2 characters. Latin, because it renders at 12px where Arabic will not. */
  initials: string;
}

export const OUTLETS: Outlet[] = [
  { domain: "argaam.com", name: "Argaam", nameAr: "أرقام", brand: "#0F3E6B", initials: "AR" },
  { domain: "arabnews.com", name: "Arab News", nameAr: "عرب نيوز", brand: "#00609C", initials: "AN" },
  { domain: "saudigazette.com.sa", name: "Saudi Gazette", nameAr: "سعودي غازيت", brand: "#046A38", initials: "SG" },
  { domain: "spa.gov.sa", name: "SPA", nameAr: "واس", brand: "#046A38", initials: "SPA" },
  { domain: "alarabiya.net", name: "Al Arabiya", nameAr: "العربية", brand: "#E8B33A", initials: "AA" },
  { domain: "english.alarabiya.net", name: "Al Arabiya", nameAr: "العربية", brand: "#E8B33A", initials: "AA" },
  { domain: "aljazeera.net", name: "Al Jazeera", nameAr: "الجزيرة", brand: "#FA9000", initials: "AJ" },
  { domain: "aljazeera.com", name: "Al Jazeera", nameAr: "الجزيرة", brand: "#FA9000", initials: "AJ" },
  { domain: "maaal.com", name: "Maaal", nameAr: "مال", brand: "#1B6CA8", initials: "M" },
  { domain: "aleqt.com", name: "Al Eqtisadiah", nameAr: "الاقتصادية", brand: "#C8102E", initials: "EQ" },
  { domain: "mubasher.info", name: "Mubasher", nameAr: "مباشر", brand: "#0B7CBB", initials: "MB" },
  { domain: "attaqa.net", name: "Attaqa", nameAr: "الطاقة", brand: "#E4761B", initials: "AT" },
  { domain: "arabianbusiness.com", name: "Arabian Business", nameAr: "أرابيان بزنس", brand: "#1A1A1A", initials: "AB" },
  { domain: "arabic.arabianbusiness.com", name: "Arabian Business", nameAr: "أرابيان بزنس", brand: "#1A1A1A", initials: "AB" },
  { domain: "khaleejtimes.com", name: "Khaleej Times", nameAr: "خليج تايمز", brand: "#D6001C", initials: "KT" },
  { domain: "gulfnews.com", name: "Gulf News", nameAr: "غلف نيوز", brand: "#B01C2E", initials: "GN" },
  { domain: "zawya.com", name: "Zawya", nameAr: "زاوية", brand: "#00456E", initials: "Z" },
  { domain: "tradearabia.com", name: "TradeArabia", nameAr: "تريد أرابيا", brand: "#1F5C9E", initials: "TA" },
  { domain: "agbi.com", name: "AGBI", nameAr: "إيه جي بي آي", brand: "#111111", initials: "AG" },
  { domain: "gulfbusiness.com", name: "Gulf Business", nameAr: "غلف بزنس", brand: "#00539B", initials: "GB" },
  { domain: "economymiddleeast.com", name: "Economy ME", nameAr: "إيكونومي", brand: "#0A2A43", initials: "EM" },
  { domain: "asharqbusiness.com", name: "Asharq Business", nameAr: "الشرق", brand: "#0C2340", initials: "AS" },
  { domain: "okaz.com.sa", name: "Okaz", nameAr: "عكاظ", brand: "#00833E", initials: "OK" },
  { domain: "sabq.org", name: "Sabq", nameAr: "سبق", brand: "#E63329", initials: "SQ" },
  { domain: "alwatan.com.sa", name: "Al Watan", nameAr: "الوطن", brand: "#0E5A2C", initials: "W" },
  { domain: "alyaum.com", name: "Al Yaum", nameAr: "اليوم", brand: "#004B87", initials: "AY" },
  { domain: "independentarabia.com", name: "Independent Arabia", nameAr: "اندبندنت عربية", brand: "#E4002B", initials: "IA" },
  { domain: "cnbcarabia.com", name: "CNBC Arabia", nameAr: "سي إن بي سي", brand: "#005594", initials: "CN" },
  { domain: "albiladdaily.com", name: "Al Bilad", nameAr: "البلاد", brand: "#0067A5", initials: "BL" },
  { domain: "eqtsad.net", name: "Eqtsad", nameAr: "اقتصاد", brand: "#136F63", initials: "EN" },
  { domain: "meed.com", name: "MEED", nameAr: "ميد", brand: "#00263A", initials: "MD" },
];

const BY_DOMAIN = new Map(OUTLETS.map((o) => [o.domain, o]));

/** Every host the logo proxy is willing to fetch from. Nothing else. */
export const LOGO_ALLOWLIST: ReadonlySet<string> = new Set(OUTLETS.map((o) => o.domain));

/** Hostname of a URL, lowercased, `www.` removed. Null when unparseable. */
export function hostOf(url: string): string | null {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h.startsWith("www.") ? h.slice(4) : h;
  } catch {
    return null;
  }
}

/**
 * Best-known outlet for a story URL.
 *
 * Tries the exact host, then walks up one label at a time, so
 * `arabic.arabianbusiness.com` matches even when only the apex is registered
 * and `english.alarabiya.net` resolves to its own entry first.
 */
export function outletFor(url: string): Outlet | null {
  const host = hostOf(url);
  if (!host) return null;
  if (BY_DOMAIN.has(host)) return BY_DOMAIN.get(host)!;

  const parts = host.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".");
    if (BY_DOMAIN.has(candidate)) return BY_DOMAIN.get(candidate)!;
  }
  return null;
}

/** Deterministic fallback colour for publishers not in the table. */
export function fallbackBrand(seed: string): string {
  const palette = ["#0B7A75", "#1F4E6B", "#A2542B", "#07514D", "#5A4A7A", "#7A2E3F"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/** 1-2 Latin characters for the monogram tile. */
export function initialsFor(name: string): string {
  const latin = name.replace(/[^A-Za-z ]/g, "").trim();
  if (!latin) return "•";
  const words = latin.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}
