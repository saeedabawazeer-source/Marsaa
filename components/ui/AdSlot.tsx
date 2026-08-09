/**
 * Ad placement per docs/business.md §2: visually separated, labeled, fixed
 * dimensions reserved before the ad script loads so injection never causes
 * layout shift (Core Web Vitals CLS).
 *
 * TODO(ads): replace the placeholder below with the real AdSense/Ad Manager
 * unit once an account is linked, and add ads.txt entries in public/ads.txt to
 * match.
 *
 * Previously there was exactly one slot, sized for a footer banner, called
 * once per page. That's one inventory position on a site with five desks and
 * a wire that scrolls for screens — every other slot Nabd-scale portals sell
 * (in-feed native, sidebar rail, mid-article) simply didn't exist as
 * placements, which is a revenue ceiling independent of traffic. `variant`
 * gives each placement its own real dimensions and reserved space; nothing
 * here is decorative — every variant is a slot this site now actually offers
 * to a buyer.
 */

const VARIANTS = {
  /** Full-width, page-bottom or between major sections. Classic 728×90/120. */
  leaderboard: { width: 728, height: 120, wrap: "mx-auto max-w-[1100px] px-4 pb-10 sm:px-6" },
  /** Sidebar rail, next to the wire or the desk list. Standard MREC. */
  rectangle: { width: 300, height: 250, wrap: "mx-auto w-full max-w-[300px]" },
  /**
   * In-feed native — sized and bordered like a story card so it reads as a
   * slot in the stream rather than an interruption of it, which is both the
   * higher-CPM format and the one that doesn't make the feed feel broken up.
   */
  native: { width: 0, height: 220, wrap: "w-full" },
} as const;

export type AdVariant = keyof typeof VARIANTS;

export function AdSlot({
  variant = "leaderboard",
  lang = "en",
  className = "",
}: {
  variant?: AdVariant;
  lang?: "en" | "ar";
  className?: string;
}) {
  const v = VARIANTS[variant];
  const label = lang === "ar" ? "إعلان" : "Advertisement";
  const dims = v.width ? `${v.width}×${v.height}` : `${v.height}px`;
  const reserved = lang === "ar" ? "محجوز" : "reserved";

  return (
    <div className={`${v.wrap} ${className}`}>
      <div
        style={{ minHeight: v.height }}
        className={[
          "flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-500",
          variant === "native"
            ? "rounded-xl border-2 border-dashed border-gray-300 bg-[#fdfaf3]"
            : "rounded border-2 border-dashed border-gray-400 bg-[#fdfaf3]",
        ].join(" ")}
      >
        {label} — {dims} {reserved}
      </div>
    </div>
  );
}
