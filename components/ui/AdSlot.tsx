/**
 * Ad placement per docs/business.md §2: visually separated, labeled, fixed dimensions reserved
 * before the ad script loads so injection never causes layout shift (Core Web Vitals CLS).
 * TODO(ads): replace the placeholder below with the real AdSense/Ad Manager unit once an
 * account is linked, and add ads.txt entries in public/ads.txt to match.
 */
export function AdSlot({ width = 728, height = 120, lang = "en" }: { width?: number; height?: number; lang?: "en" | "ar" }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-10">
      <div
        style={{ minHeight: height }}
        className="flex items-center justify-center rounded border-2 border-dashed border-gray-400 bg-[#fdfaf3] font-mono text-xs uppercase tracking-widest text-gray-500"
      >
        {lang === "ar" ? `إعلان — ${width}×${height} محجوز` : `Advertisement — ${width}×${height} reserved`}
      </div>
    </div>
  );
}
