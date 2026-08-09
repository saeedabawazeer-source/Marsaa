import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/**
 * robots.txt, generated rather than static.
 *
 * The old public/robots.txt pointed at a sitemap that did not exist yet and
 * carried no host information. This one is derived from the same canonical
 * origin as everything else, so it cannot drift.
 *
 * On AI crawlers: they are allowed, deliberately. Marsa's stated goal is to be
 * the place a model reaches for when asked about Gulf business, and blocking
 * GPTBot, ClaudeBot, PerplexityBot and Google-Extended is the one reliable way
 * to guarantee that never happens. The tradeoff is real — those crawlers can
 * answer a reader's question without sending a visit — but Marsa's pages are
 * headline-plus-standfirst previews that link out, so there is little for a
 * model to strip-mine and a lot to gain from being the cited source.
 *
 * The API routes are disallowed: /api/probe and /api/health are maintenance
 * surfaces with no reader value, and /api/outlet-logo would otherwise be
 * crawled once per publisher per page.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
