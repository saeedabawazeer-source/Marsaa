import { NextResponse } from "next/server";
import { parseFeed, type Source } from "@/lib/feeds";

/**
 * Feed probe — a maintenance endpoint, not a public feature.
 *
 * Publishers move and retire RSS paths constantly, and the only environment
 * whose answer counts is the one the portal actually runs in: a feed that
 * resolves from a laptop may 403 from a datacentre IP, and vice versa. Guessing
 * from anywhere else is how the source list rotted to 5 of 16 working without
 * anyone noticing.
 *
 * So candidates are tested here, from production, against the real parser —
 * not a reimplementation of it. If parseFeed cannot read it, it does not work,
 * regardless of what the raw XML looks like in a browser.
 *
 * SECURITY: the candidate list is fixed in this file. It deliberately does not
 * accept a URL parameter — an endpoint that fetches arbitrary caller-supplied
 * URLs from inside the deploy platform's network is an SSRF hole, and this is
 * a public site.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Candidate {
  name: string;
  url: string;
  lang: "en" | "ar";
}

const CANDIDATES: Candidate[] = [
  // ---- Arabic: Saudi business & markets ----
  { name: "Argaam — أحدث الأخبار", url: "https://www.argaam.com/ar/rss/ho-main-news?sectionid=1523", lang: "ar" },
  { name: "Argaam — عاجل", url: "https://www.argaam.com/ar/rss/breaking-news?sectionid=1585", lang: "ar" },
  { name: "Argaam — نبض السوق", url: "https://www.argaam.com/ar/rss/ho-market-pulse?sectionid=70", lang: "ar" },
  { name: "Argaam — الشركات", url: "https://www.argaam.com/ar/rss/companies?sectionid=1543", lang: "ar" },
  { name: "Argaam — الأسواق العالمية", url: "https://www.argaam.com/ar/rss/internationmarket-mainnewsar?sectionid=1334", lang: "ar" },
  { name: "Argaam — الإمارات", url: "https://www.argaam.com/ar/rss/ho-main-news-uae?sectionid=1533", lang: "ar" },
  { name: "Al Arabiya — أسواق", url: "https://www.alarabiya.net/tools/rss/aswaq", lang: "ar" },
  { name: "Al Arabiya — اقتصاد", url: "https://www.alarabiya.net/tools/rss/economy", lang: "ar" },
  { name: "Al Arabiya AR all", url: "https://www.alarabiya.net/ar/rss.xml", lang: "ar" },
  { name: "Al Jazeera AR", url: "https://www.aljazeera.net/rss/all.xml", lang: "ar" },
  { name: "Maaal", url: "https://www.maaal.com/feed", lang: "ar" },
  { name: "Al Eqtisadiah", url: "https://www.aleqt.com/rss", lang: "ar" },
  { name: "Mubasher", url: "https://www.mubasher.info/rss", lang: "ar" },
  { name: "Attaqa (طاقة)", url: "https://attaqa.net/feed/", lang: "ar" },
  { name: "Arabian Business AR", url: "https://arabic.arabianbusiness.com/feed", lang: "ar" },
  { name: "SPA AR", url: "https://www.spa.gov.sa/ar/rss.xml", lang: "ar" },
  { name: "Okaz", url: "https://www.okaz.com.sa/rss.xml", lang: "ar" },
  { name: "Sabq", url: "https://sabq.org/rss", lang: "ar" },
  { name: "Independent Arabia — اقتصاد", url: "https://www.independentarabia.com/rss/economy", lang: "ar" },
  { name: "Asharq Business", url: "https://www.asharqbusiness.com/rss", lang: "ar" },
  { name: "Al Watan", url: "https://www.alwatan.com.sa/rss", lang: "ar" },
  { name: "Al Yaum", url: "https://www.alyaum.com/rss", lang: "ar" },
  { name: "Al Bilad", url: "https://albiladdaily.com/feed/", lang: "ar" },
  { name: "Eqtsad", url: "https://www.eqtsad.net/feed/", lang: "ar" },
  { name: "CNBC Arabia", url: "https://www.cnbcarabia.com/rss", lang: "ar" },
  { name: "Zawya AR", url: "https://www.zawya.com/ar/rss", lang: "ar" },
  { name: "Arab News AR", url: "https://www.arabnews.com/ar/rss.xml", lang: "ar" },

  // ---- English: current sources, to confirm which still answer ----
  { name: "[cur] Arab News business", url: "https://www.arabnews.com/cat/3/rss.xml", lang: "en" },
  { name: "[cur] Saudi Gazette business", url: "https://saudigazette.com.sa/rssFeed/74", lang: "en" },
  { name: "[cur] Al Jazeera EN", url: "https://www.aljazeera.com/xml/rss/all.xml", lang: "en" },

  // ---- English: replacements for the 11 dead ones ----
  { name: "Argaam EN latest", url: "https://www.argaam.com/en/rss/ho-main-news?sectionid=1524", lang: "en" },
  { name: "Argaam EN alt", url: "https://www.argaam.com/en/rss/ho-main-news-en?sectionid=1525", lang: "en" },
  { name: "Zawya EN alt1", url: "https://www.zawya.com/rss", lang: "en" },
  { name: "Zawya EN alt2", url: "https://www.zawya.com/en/rss/story", lang: "en" },
  { name: "Gulf News biz alt", url: "https://gulfnews.com/rss/business", lang: "en" },
  { name: "Gulf News alt2", url: "https://gulfnews.com/rss", lang: "en" },
  { name: "Khaleej Times alt", url: "https://www.khaleejtimes.com/rss.xml", lang: "en" },
  { name: "Khaleej Times biz alt", url: "https://www.khaleejtimes.com/business/rss.xml", lang: "en" },
  { name: "Arabian Business alt", url: "https://www.arabianbusiness.com/feed", lang: "en" },
  { name: "Al Arabiya EN alt", url: "https://english.alarabiya.net/rss.xml", lang: "en" },
  { name: "SPA EN alt", url: "https://www.spa.gov.sa/en/rss.xml", lang: "en" },
  { name: "Saudi Gazette 78", url: "https://saudigazette.com.sa/rssFeed/78", lang: "en" },
  { name: "TradeArabia https", url: "https://www.tradearabia.com/rss/BUS_0.xml", lang: "en" },
  { name: "AGBI", url: "https://www.agbi.com/feed/", lang: "en" },
  { name: "Gulf Business", url: "https://gulfbusiness.com/feed/", lang: "en" },
  { name: "Economy Middle East", url: "https://economymiddleeast.com/feed/", lang: "en" },
  { name: "MEED", url: "https://www.meed.com/feed", lang: "en" },
];

/** Share of Arabic-script characters, to confirm a feed is actually Arabic. */
function arabicRatio(s: string): number {
  const arabicChars = s.match(/[؀-ۿ]/g);
  const letters = s.match(/[A-Za-z؀-ۿ]/g);
  if (!letters?.length) return 0;
  return (arabicChars?.length ?? 0) / letters.length;
}

async function probe(c: Candidate) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(c.url, {
      signal: controller.signal,
      headers: {
        "user-agent": "MarsaPortal/1.0 (+https://marsa.news; news aggregator)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) return { ...c, ok: false, error: `http ${res.status}` };

    const xml = await res.text();
    // Run the real parser, with a throwaway Source — this is the whole point.
    const fake: Source = {
      id: "probe", name: c.name, nameAr: c.name, home: "", url: c.url,
      section: "markets", lang: c.lang,
    };
    const items = parseFeed(xml, fake);
    if (!items.length) {
      return { ...c, ok: false, error: xml.trim() ? `unparsed (${xml.length}b)` : "empty" };
    }

    const newest = items.reduce((m, i) => Math.max(m, Date.parse(i.publishedAt)), 0);
    const sample = items.slice(0, 2).map((i) => i.title);
    return {
      ...c,
      ok: true,
      error: null,
      items: items.length,
      ageHours: newest ? +((Date.now() - newest) / 3_600_000).toFixed(1) : null,
      detectedArabic: arabicRatio(sample.join(" ")) > 0.5,
      withImages: items.filter((i) => i.image).length,
      sample,
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ...c, ok: false, error: aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const results = await Promise.all(CANDIDATES.map(probe));
  const working = results.filter((r) => r.ok);
  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      summary: {
        total: results.length,
        working: working.length,
        workingArabic: working.filter((r) => "detectedArabic" in r && r.detectedArabic).length,
      },
      working,
      failed: results.filter((r) => !r.ok),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
