import type { NewsItem } from "@/lib/feeds";
import { NewsCard } from "./NewsCard";

/**
 * The front-of-desk layout, in one place.
 *
 * Every page that shows stories used to lay them out itself, and they disagreed.
 * The category pages did `lead && <NewsCard big />` unconditionally, so a desk
 * holding a single story rendered that story as a 2:1 slab across the full
 * 1240px measure — an image blown up to roughly six times the area it has on a
 * busy desk, with nothing beside it. That is what /ar/category/policy was.
 *
 * The rule this encodes: **a lead is only a lead when it has something to lead.**
 * A hero exists to establish hierarchy among several stories. With one story
 * there is no hierarchy to establish, so there is no hero.
 *
 *   1 story    → a single card at reading width, not stretched to the grid.
 *   2-3        → an even row. No hero; they are peers.
 *   4+         → hero plus grid, the hero capped so it stays a page element
 *                rather than becoming the page.
 *
 * Because both editions render through here, the Arabic and English desks
 * cannot drift apart again — which they already had, twice.
 */
export function StoryGrid({
  items,
  now,
  lang = "en",
}: {
  items: NewsItem[];
  now: string;
  lang?: "en" | "ar";
}) {
  if (items.length === 0) return null;

  // One story: reading width. A lone card stretched across a 1240px grid looks
  // like a bug because it is one.
  if (items.length === 1) {
    return (
      <div className="max-w-[640px]">
        <NewsCard item={items[0]} now={now} lang={lang} />
      </div>
    );
  }

  // Two or three: peers, sized by the grid rather than by rank.
  if (items.length <= 3) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <NewsCard key={i.id} item={i} now={now} lang={lang} />
        ))}
      </div>
    );
  }

  const [lead, ...rest] = items;
  const grid = rest.slice(0, 6);

  return (
    <>
      {/* The hero is capped at 860px. Past that the headline runs to a measure
          nobody can read comfortably and the photo has to be upscaled. */}
      <div className="max-w-[860px]">
        <NewsCard item={lead} now={now} big lang={lang} />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((i) => (
          <NewsCard key={i.id} item={i} now={now} lang={lang} />
        ))}
      </div>
    </>
  );
}
