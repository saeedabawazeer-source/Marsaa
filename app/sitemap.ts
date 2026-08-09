import type { MetadataRoute } from "next";
import { SECTION_ORDER } from "@/lib/sections";
import { getNews } from "@/lib/feeds";
import { absolute } from "@/lib/site";

/**
 * The sitemap.
 *
 * Both editions are listed, and every entry declares its counterpart through
 * `alternates.languages`. That pairing is the whole point: without it Google
 * treats /markets and /ar/category/markets as two unrelated thin pages that
 * happen to cover the same ground, and may pick one and drop the other. With
 * it, they are one page in two languages and each is served to the right reader.
 *
 * Story URLs are included because they are the pages that actually earn search
 * traffic, but they are deliberately capped and marked low priority — they are
 * previews that link out, not original articles, and telling a crawler
 * otherwise would be a claim Marsa cannot support.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths: Array<{ path: string; arPath: string; priority: number; freq: "hourly" | "daily" | "weekly" | "monthly" }> = [
    { path: "/", arPath: "/ar", priority: 1, freq: "hourly" },
    { path: "/puzzles", arPath: "/ar/puzzles", priority: 0.7, freq: "daily" },
    { path: "/game", arPath: "/ar/game", priority: 0.6, freq: "daily" },
    { path: "/sudoku", arPath: "/ar/sudoku", priority: 0.6, freq: "daily" },
    { path: "/advertise", arPath: "/ar/advertise", priority: 0.4, freq: "monthly" },
    { path: "/contact", arPath: "/ar/contact", priority: 0.4, freq: "monthly" },
    { path: "/privacy", arPath: "/ar/privacy", priority: 0.3, freq: "monthly" },
    { path: "/terms", arPath: "/ar/terms", priority: 0.3, freq: "monthly" },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const s of staticPaths) {
    entries.push({
      url: absolute(s.path),
      lastModified: now,
      changeFrequency: s.freq,
      priority: s.priority,
      alternates: { languages: { en: absolute(s.path), ar: absolute(s.arPath) } },
    });
  }

  for (const slug of SECTION_ORDER) {
    entries.push({
      url: absolute(`/category/${slug}`),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
      alternates: {
        languages: { en: absolute(`/category/${slug}`), ar: absolute(`/ar/category/${slug}`) },
      },
    });
  }

  // Story previews. Both editions, each from its own wire.
  try {
    const [en, ar] = await Promise.all([
      getNews({ limit: 120, lang: "en" }),
      getNews({ limit: 120, lang: "ar" }),
    ]);

    for (const item of en.items) {
      entries.push({
        url: absolute(`/story/${item.id}`),
        lastModified: new Date(item.publishedAt),
        changeFrequency: "daily",
        priority: 0.5,
      });
    }
    for (const item of ar.items) {
      entries.push({
        url: absolute(`/ar/story/${item.id}`),
        lastModified: new Date(item.publishedAt),
        changeFrequency: "daily",
        priority: 0.5,
      });
    }
  } catch {
    // A sitemap that omits today's stories is a much smaller problem than a
    // sitemap route that 500s and takes the whole file out of circulation.
  }

  return entries;
}
