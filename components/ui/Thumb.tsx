"use client";

import { useState } from "react";
import type { Section } from "@/lib/feeds";

/**
 * A publisher thumbnail that is never a black rectangle.
 *
 * Aggregated images fail constantly and for reasons outside our control: the
 * publisher hotlink-blocks, the CDN 404s, the feed carries a tracking pixel
 * where a photo should be, or the URL is http on an https page. The homepage
 * lead was rendering exactly that — a full-bleed black box with the source name
 * floating on it — because the markup assumed the image would load.
 *
 * So this component treats "no picture" as a normal state with its own design
 * rather than an error state with no design. The fallback is a desk-coloured
 * panel carrying the publisher's name: it fills the same space, keeps the grid
 * rhythm intact, and still tells the reader where the story came from.
 *
 * Images are intentionally plain <img>, not next/image. next/image would proxy
 * and re-encode other people's photographs through our own server, which is a
 * materially different act from displaying a thumbnail the publisher serves in
 * their own feed. Hotlinking is what an RSS reader does; re-hosting is not.
 */

const DESK_TINT: Record<Section, string> = {
  markets: "bg-teal",
  energy: "bg-accent",
  "real-estate": "bg-accent-dark",
  trade: "bg-ink",
  policy: "bg-teal-dark",
};

export function Thumb({
  src,
  alt,
  source,
  section,
  className = "",
  sizes,
  eager = false,
}: {
  src?: string;
  alt: string;
  source: string;
  section: Section;
  className?: string;
  sizes?: string;
  /** True for the lead image only — everything else waits until it scrolls in. */
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const usable = src && /^https:\/\//i.test(src) && !failed;

  if (!usable) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden ${DESK_TINT[section]} ${className}`}
        aria-hidden
      >
        <span className="px-3 text-center font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-paper/85">
          {source}
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
