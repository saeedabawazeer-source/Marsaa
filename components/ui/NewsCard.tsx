import Link from "next/link";
import type { NewsItem } from "@/lib/feeds";
import { fmtAgo } from "@/lib/time";
import { CATEGORY_LABELS_AR } from "@/lib/labels";
import { Thumb } from "./Thumb";

/**
 * A story card.
 *
 * Design notes, because the previous version was busier than it needed to be:
 *
 *   - **4:3 art.** Every card reserves the same aspect ratio, so a grid of them
 *     lines up on a shared baseline and nothing jumps as images load. It is
 *     also the ratio most newsroom CMSs crop to, which means fewer awkward
 *     centre-crops of people's heads.
 *   - **One badge, not two.** The section badge sat on the picture competing
 *     with the source badge for the same corner attention. The desk now reads
 *     as a small coloured rule and label under the headline, where it belongs
 *     as metadata; only the publisher gets a badge on the art, because that is
 *     the piece of information a reader needs before they trust the headline.
 *   - **Quieter frame.** Border weight drops from 3px to 2px and the shadow
 *     from hard-offset to a soft lift. The brand's ink-border language is still
 *     there — a grid of twelve heavy frames is just noise, and the card should
 *     let the photograph and the headline carry it.
 */

const DESK_ACCENT: Record<string, string> = {
  markets: "bg-teal",
  energy: "bg-accent",
  "real-estate": "bg-accent-dark",
  trade: "bg-ink",
  policy: "bg-teal-dark",
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
  const base = isAr ? "/ar/story" : "/story";
  const source = isAr ? item.sourceNameAr : item.sourceName;
  const desk = isAr ? CATEGORY_LABELS_AR[item.section] ?? item.section : item.section.replace("-", " ");

  return (
    <Link
      href={`${base}/${item.id}`}
      dir={isAr ? "rtl" : "ltr"}
      className="group flex h-full flex-col overflow-hidden rounded-lg border-2 border-inkBorder bg-white shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(26,26,26,0.9)]"
    >
      {/* Fixed 4:3 frame keeps every card in the grid on the same baseline. */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b-2 border-inkBorder bg-paper">
        {/* Thumb owns the no-picture case. The card used to branch on
            `item.image ?` alone, which covers a missing URL but not a URL that
            404s, hotlink-blocks, or resolves to a dark house placeholder — and
            that is what left a black rectangle sitting under the lead headline
            on the live front page. */}
        <Thumb
          src={item.image}
          alt=""
          source={source}
          section={item.section}
          eager={big}
          sizes={big ? "(max-width: 1024px) 100vw, 700px" : "(max-width: 640px) 100vw, 360px"}
          className="h-full w-full transition duration-300 group-hover:scale-[1.04]"
        />

        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-ink/85 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
          {source}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${big ? "p-5" : "p-4"}`}>
        {/* Desk as a coloured rule + label: readable, but it no longer fights
            the photograph or the publisher badge for the eye. */}
        <span className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${DESK_ACCENT[item.section] ?? "bg-teal"}`} />
          {desk}
        </span>

        <h3
          className={`mb-2 font-bold leading-snug transition group-hover:text-teal-dark ${
            big ? "text-xl sm:text-[26px]" : "line-clamp-3 text-[16px]"
          }`}
        >
          {item.title}
        </h3>

        {item.summary && (
          <p className={`mb-3 text-gray-600 ${big ? "text-[15px] leading-relaxed" : "line-clamp-2 text-[13px] leading-relaxed"}`}>
            {item.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-gray-400">
          <time dateTime={item.publishedAt}>{fmtAgo(item.publishedAt, now, lang)}</time>
          <span aria-hidden className="text-teal-dark transition group-hover:translate-x-0.5">
            {isAr ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}
