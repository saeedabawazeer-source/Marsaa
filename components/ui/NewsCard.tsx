import Link from "next/link";
import type { NewsItem } from "@/lib/feeds";
import { fmtAgo } from "@/lib/time";

/**
 * A story card.
 *
 * Cards route to Marsa's own preview at /story/[id], not straight out to the
 * publisher. The reader stays inside the app to browse, scan and decide; they
 * only leave at the moment they actually want to read the whole piece, and the
 * preview makes that hand-off explicit rather than surprising.
 *
 * The picture is the publisher's own thumbnail from their feed, always shown
 * under their name. Where a feed offers no image the card falls back to a
 * typographic tile built from the source and section rather than a grey box —
 * a missing photo should look deliberate, not broken.
 */

const SECTION_STYLES: Record<string, string> = {
  markets: "bg-teal text-white",
  energy: "bg-accent text-ink",
  trade: "bg-ink text-paper",
  startups: "bg-teal text-white",
  "real-estate": "bg-accent text-ink",
  policy: "bg-ink text-paper",
  general: "bg-teal-dark text-white",
};

const TILE_STYLES: Record<string, string> = {
  markets: "bg-teal text-paper",
  energy: "bg-accent text-ink",
  trade: "bg-ink text-paper",
  startups: "bg-teal-dark text-paper",
  "real-estate": "bg-accent-dark text-ink",
  policy: "bg-ink text-paper",
  general: "bg-teal text-paper",
};

export function NewsCard({
  item,
  now,
  big = false,
  lang = "en",
}: {
  item: NewsItem;
  now: string;
  big?: boolean;
  lang?: "en" | "ar";
}) {
  const isAr = lang === "ar";
  const source = isAr ? item.sourceNameAr : item.sourceName;
  const artClass = big ? "h-52 sm:h-64" : "h-36";

  return (
    <Link
      href={`/story/${item.id}`}
      dir={isAr ? "rtl" : "ltr"}
      className="group flex h-full flex-col overflow-hidden rounded border-[3px] border-inkBorder bg-white shadow-md transition hover:-translate-y-px hover:shadow-lg"
    >
      <div className={`relative w-full shrink-0 overflow-hidden border-b-[3px] border-inkBorder ${artClass}`}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col justify-between p-4 ${TILE_STYLES[item.section] ?? "bg-teal text-paper"}`}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">Marsa</span>
            <span className="font-display text-2xl font-bold leading-none">{source}</span>
          </div>
        )}

        <span className="absolute left-2.5 top-2.5 rounded-full border-2 border-inkBorder bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ink shadow-sm">
          {source}
        </span>
        <span
          className={`absolute right-2.5 top-2.5 rounded-full border-2 border-inkBorder px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide shadow-sm ${
            SECTION_STYLES[item.section] ?? "bg-ink text-paper"
          }`}
        >
          {item.section.replace("-", " ")}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${big ? "p-5" : "p-4"}`}>
        <h3
          className={`mb-2 font-bold leading-snug transition group-hover:text-teal-dark ${
            big ? "text-xl sm:text-2xl" : "text-[15px]"
          }`}
        >
          {item.title}
        </h3>
        {item.summary && (
          <p className={`mb-3 text-gray-600 ${big ? "text-[15px] leading-relaxed" : "line-clamp-3 text-[13px] leading-relaxed"}`}>
            {item.summary}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-gray-500">
          <time dateTime={item.publishedAt}>{fmtAgo(item.publishedAt, now, lang)}</time>
          <span aria-hidden className="ml-auto text-teal-dark transition group-hover:translate-x-0.5">
            {isAr ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}
