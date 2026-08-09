import Link from "next/link";
import type { NewsItem } from "@/lib/feeds";
import { Thumb } from "./Thumb";
import { SourceBadge } from "./SourceBadge";
import { ShareButton } from "./ShareButton";
import { SectionChip } from "@/lib/sections";
import { fmtAgo } from "@/lib/time";

/**
 * A story card.
 *
 * Three things here were corrected off the live site and are load-bearing:
 *
 *   1. No rule between the picture and the headline. A hard border cuts a card
 *      into two unrelated objects; the image now carries a gradient into the
 *      text block so they read as one piece. The scrim also guarantees legible
 *      white type over an unknown publisher photo, which a plain image cannot.
 *
 *   2. The outlet is its own mark, not a text string. See SourceBadge.
 *
 *   3. Everything is proportional. The old card set a fixed pixel height on its
 *      media, so /ar/category/policy — one story, no siblings — rendered a
 *      single enormous slab, while a dense desk rendered neat rows. Media is
 *      declared as an aspect-ratio and the card fills whatever column it is
 *      given, so a page with one story and a page with forty are recognisably
 *      the same publication.
 *
 * The whole card is one link, with the share control lifted out of it — a
 * button inside an anchor is invalid HTML and, worse, taps through to the story
 * on the phones where it matters.
 */
export function NewsCard({
  item,
  now,
  big = false,
  lang = "en",
  compact = false,
}: {
  item: NewsItem;
  now: string;
  big?: boolean;
  lang?: "en" | "ar";
  compact?: boolean;
}) {
  const href = lang === "ar" ? `/ar/story/${item.id}` : `/story/${item.id}`;
  const sourceName = lang === "ar" ? item.sourceNameAr : item.sourceName;

  /* -------------------------------------------------- *
   * Compact: a dense list row. No media, minimum height.
   * -------------------------------------------------- */
  if (compact) {
    return (
      <article className="group relative flex items-start gap-3 py-3">
        <Link href={href} className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold leading-snug transition group-hover:text-teal-dark sm:text-[15px]">
            {item.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <SourceBadge sourceName={sourceName} link={item.link} size={14} showName />
            <span aria-hidden className="text-gray-300">·</span>
            <time
              dateTime={item.publishedAt}
              className="font-mono text-[10px] tabular-nums text-gray-400"
            >
              {fmtAgo(item.publishedAt, now, lang)}
            </time>
          </div>
        </Link>
        <ShareButton
          url={href}
          title={item.title}
          sourceName={sourceName}
          lang={lang}
          className="shrink-0 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"
        />
      </article>
    );
  }

  /* -------------------------------------------------- *
   * Standard and lead cards.
   * -------------------------------------------------- */
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-xl border-2 border-inkBorder bg-white",
        "shadow-[0_2px_0_0_rgba(26,26,26,0.9)] transition-transform duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_rgba(26,26,26,0.9)]",
        "focus-within:-translate-y-0.5",
      ].join(" ")}
    >
      <Link href={href} className="block">
        {/*
          Media. `aspect-[16/9]` on standard cards and a wider crop on the lead,
          so the picture scales with the column instead of dictating a height.
          The overlay is what replaces the old divider line.
        */}
        <div className={`relative w-full overflow-hidden ${big ? "aspect-[16/9] sm:aspect-[2/1]" : "aspect-[16/9]"}`}>
          <Thumb
            src={item.image}
            alt=""
            source={sourceName}
            section={item.section}
            sizes={big ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 640px) 100vw, 360px"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/*
            The fade. Two stacked gradients: a soft top wash so the desk chip
            stays readable on a bright photo, and a deep bottom ramp that runs
            past the image edge into the card body. Because the ramp ends in the
            card's own background colour there is no visible seam — the image
            dissolves into the text rather than stopping at a line.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/85 to-transparent"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
            <SectionChip slug={item.section} lang={lang} solid size={big ? "md" : "sm"} />
          </div>
        </div>

        {/*
          Pulled up into the gradient so the first line of type begins inside
          the fade. -mt-* is doing the "blend" the divider used to prevent.
        */}
        <div className={`relative ${big ? "-mt-9 px-4 pb-4 sm:-mt-12 sm:px-6 sm:pb-6" : "-mt-7 px-3.5 pb-3.5 sm:px-4 sm:pb-4"}`}>
          <h3
            className={[
              "font-display font-bold leading-[1.2] tracking-tight transition group-hover:text-teal-dark",
              big
                ? "text-[22px] sm:text-[30px] lg:text-[34px]"
                : "text-[16px] sm:text-[17px]",
            ].join(" ")}
          >
            {item.title}
          </h3>

          {item.summary && (
            <p
              className={[
                "mt-2 text-gray-600",
                big
                  ? "line-clamp-3 max-w-[62ch] text-[14px] leading-relaxed sm:text-[15px]"
                  : "line-clamp-2 text-[13px] leading-relaxed",
              ].join(" ")}
            >
              {item.summary}
            </p>
          )}
        </div>
      </Link>

      {/* Outside the anchor: a control, not part of the link target. */}
      <div className={`flex items-center justify-between gap-2 ${big ? "px-4 pb-4 sm:px-6 sm:pb-5" : "px-3.5 pb-3.5 sm:px-4 sm:pb-4"}`}>
        <div className="flex min-w-0 items-center gap-2">
          <SourceBadge sourceName={sourceName} link={item.link} size={big ? 20 : 16} showName />
          <span aria-hidden className="text-gray-300">·</span>
          <time
            dateTime={item.publishedAt}
            className="shrink-0 font-mono text-[10px] tabular-nums text-gray-400"
          >
            {fmtAgo(item.publishedAt, now, lang)}
          </time>
        </div>
        <ShareButton url={href} title={item.title} sourceName={sourceName} lang={lang} />
      </div>
    </article>
  );
}
