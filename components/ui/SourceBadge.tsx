"use client";

import { useState } from "react";
import { outletFor, fallbackBrand, initialsFor, hostOf } from "@/lib/outlets";

/**
 * The publisher's mark, as a badge.
 *
 * Attribution has to survive every failure mode without leaving a hole in the
 * grid, so this degrades in three steps: the publisher's real favicon, then a
 * monogram tile in their brand colour, then a deterministic colour derived from
 * the name for outlets not in the table. There is no state in which a card
 * shows a broken image or an empty square.
 *
 * The name still ships as the `title` and as screen-reader text — a logo alone
 * is not an accessible attribution, and "who says this" is half the information
 * in a business headline.
 */
export function SourceBadge({
  sourceName,
  link,
  size = 18,
  showName = false,
  className = "",
}: {
  sourceName: string;
  /** The story URL — the outlet is identified from its host. */
  link: string;
  size?: number;
  showName?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const outlet = outletFor(link);
  const domain = outlet?.domain ?? hostOf(link);
  const brand = outlet?.brand ?? fallbackBrand(sourceName || domain || "x");
  const initials = outlet?.initials ?? initialsFor(sourceName || domain || "?");
  const label = outlet?.name ?? sourceName;

  const canTryLogo = Boolean(outlet) && !failed;

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`} title={label}>
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-[4px] ring-1 ring-black/10"
        style={{ width: size, height: size, background: canTryLogo ? "#fff" : brand }}
      >
        {canTryLogo ? (
          // Deliberately a plain <img>: these are third-party marks of unknown
          // dimensions served through our own proxy, which is exactly the case
          // next/image's optimiser cannot help with and will only add latency to.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/outlet-logo?domain=${encodeURIComponent(outlet!.domain)}`}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="font-mono font-bold leading-none text-white"
            style={{ fontSize: Math.max(7, Math.round(size * 0.42)) }}
          >
            {initials}
          </span>
        )}
      </span>

      {showName ? (
        <span className="min-w-0 truncate font-mono text-[10px] text-gray-500">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
