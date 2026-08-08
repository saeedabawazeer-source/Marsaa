import type { Metadata } from "next";
import Link from "next/link";
import { DailyGame } from "@/components/ui/DailyGame";
import { getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";

export const metadata: Metadata = {
  title: "Marsa Daily",
  description:
    "A five-letter puzzle built from Gulf business vocabulary. New word every day at midnight, Riyadh time.",
};

export const revalidate = 300;

/**
 * The puzzle page, with the wire underneath it.
 *
 * The stories below are not filler. Someone who came for the game has already
 * arrived with ninety seconds to spare; sending them away to a bare "come back
 * tomorrow" wastes the only moment when a news habit could attach to a game
 * habit. Three cards is the right number — enough to catch an eye, not so many
 * that the page stops being about the puzzle.
 */
export default async function GamePage() {
  const news = await getNews({ limit: 3 });

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-9 sm:px-6">
      <div className="rounded-lg border-2 border-inkBorder bg-white p-6 shadow-[0_3px_0_0_rgba(26,26,26,0.9)] sm:p-9">
        <DailyGame lang="en" />
      </div>

      {news.items.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 border-b-2 border-ink pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            While you&rsquo;re here
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.items.map((i) => (
              <NewsCard key={i.id} item={i} now={news.fetchedAt} />
            ))}
          </div>
          <Link
            href="/"
            className="mt-6 inline-block font-mono text-[11px] font-bold uppercase tracking-wide text-teal-dark underline underline-offset-4"
          >
            The full wire →
          </Link>
        </div>
      )}
    </section>
  );
}
