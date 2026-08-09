/**
 * Ad placement.
 *
 * Wired for Ezoic, not AdSense — Saeed's own research in the vault
 * (`Nabd — Aggregator Economics.md`) found that AdSense pays poorly on
 * Arabic/GCC traffic and treats it as "a floor, not a model." Ezoic has a
 * lower traffic bar than the premium exchanges and layers its own demand on
 * top of AdSense rather than replacing it, which fits a site this size better
 * than either alone.
 *
 * SHIPPING STATE: this renders the reserved-space placeholder you see today
 * until `NEXT_PUBLIC_EZOIC_SITE_ID` is set in the deploy platform's env vars.
 * That is not a code TODO — it is Ezoic's own requirement: an account has to
 * be created and the site verified (domain ownership check) before any script
 * is allowed to serve ads for it. Loading Ezoic's script against an
 * unverified site does nothing but add third-party JS with no upside, so the
 * loader in app/layout.tsx is gated on that same env var and simply doesn't
 * run until it's set. Nothing else changes when you flip it on — the
 * `ezoic-pub-ad-placeholder-*` divs below are already in place and already
 * correctly numbered.
 *
 * To go live: create the Ezoic account, verify marsa's domain, then set
 * NEXT_PUBLIC_EZOIC_SITE_ID (and update public/ads.txt with the lines Ezoic's
 * dashboard gives you — they differ per account, so no default is guessed
 * here).
 */

const VARIANTS = {
  leaderboard: { width: 728, height: 120, wrap: "mx-auto max-w-[1100px] px-4 pb-10 sm:px-6" },
  rectangle: { width: 300, height: 250, wrap: "mx-auto w-full max-w-[300px]" },
  native: { width: 0, height: 220, wrap: "w-full" },
} as const;

export type AdVariant = keyof typeof VARIANTS;

/**
 * Ezoic placement IDs are small integers, unique per *position on the page*,
 * not per instance — every leaderboard slot on the site can share one ID, the
 * way every AdSense unit of the same size can share a slot config. Three
 * placements exist because three real positions exist (footer banner, sidebar
 * rail, in-feed native); a fourth is added here only when a fourth real
 * position is added, not per usage.
 */
const EZOIC_ID: Record<AdVariant, number> = {
  leaderboard: 101,
  rectangle: 102,
  native: 103,
};

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
  const live = Boolean(process.env.NEXT_PUBLIC_EZOIC_SITE_ID);

  return (
    <div className={`${v.wrap} ${className}`}>
      {/* This id is what Ezoic's script looks for. It exists whether or not
          Ezoic is currently enabled, so turning the env var on requires no
          further code changes — the placement is already correctly declared. */}
      <div id={`ezoic-pub-ad-placeholder-${EZOIC_ID[variant]}`} style={{ minHeight: v.height }}>
        {!live && (
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
        )}
      </div>
    </div>
  );
}
