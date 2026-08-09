import { NextResponse } from "next/server";
import { getNews } from "@/lib/feeds";
import { getMarketSnapshot } from "@/lib/market";

/**
 * Operational read-out.
 *
 * Marsa depends on ~20 publisher feeds and three external APIs, all of which
 * fail in ways that look identical from the front page: fewer cards. For days
 * the live site ran on 3 of 16 sources and nothing said so, because every
 * failure path returned an empty array.
 *
 * This endpoint answers "what is actually working right now" — per-source, with
 * the reason. Deliberately no secrets: key names and booleans only, never
 * values, because this route is public.
 *
 * `force-dynamic`, not `revalidate` alone: a GET handler with no request-
 * dependent logic is a candidate for build-time static optimisation, and a
 * status page that got baked in at build time and served unchanged afterward
 * is the exact failure this route exists to catch — a health check that
 * cannot itself go stale is worth more than one that also needs a health
 * check. `getNews()`'s own per-feed fetches already carry `revalidate: 300`,
 * which is the real freshness bound; the s-maxage header below matches it for
 * any CDN sitting in front.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const [news, market] = await Promise.all([getNews({ limit: 200 }), getMarketSnapshot()]);

  const rss = news.statuses;
  const working = rss.filter((s) => s.ok);

  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      feeds: {
        working: working.length,
        total: rss.length,
        storiesAfterFiltering: news.items.length,
        sources: rss
          .slice()
          .sort((a, b) => Number(a.ok) - Number(b.ok))
          .map((s) => ({ source: s.name, id: s.id, ok: s.ok, error: s.error, items: s.items })),
      },
      newsApi: {
        configured: Boolean(process.env.NEWSDATA_API_KEY),
        itemsReturned: news.newsApiItems,
      },
      market: {
        tadawulConfigured: Boolean(process.env.SAHMK_API_KEY),
        globalConfigured: Boolean(process.env.TWELVEDATA_API_KEY),
        tadawulLive: market.live,
        tickCount: market.ticks.length,
        ticks: market.ticks.map((t) => t.label),
        mood: market.mood,
      },
    },
    { headers: { "cache-control": "public, max-age=0, s-maxage=300" } },
  );
}
