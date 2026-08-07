import type { Category } from "@/lib/types";

/**
 * Honest placeholder cover art — bold flat geometric icon per category on a
 * category-colored ground, in the same visual language as the logo (flat fill,
 * thick ink linework, no gradients/photos). This is NOT meant to simulate real
 * editorial photography; it's a real, shippable placeholder until real photo/
 * illustration assets exist per article.
 *
 * TODO(cms): once a real photo/illustration pipeline exists, add an optional
 * `coverImage` field to Article (lib/types.ts) and render that here when present,
 * falling back to this component when it's not — don't fake photos in the meantime.
 */

const BG: Record<Category, string> = {
  markets: "#0B7A75",
  energy: "#C8912B",
  trade: "#131110",
  startups: "#0B7A75",
  "real-estate": "#C8912B",
  policy: "#131110",
};

const FG: Record<Category, string> = {
  markets: "#F6EFE3",
  energy: "#131110",
  trade: "#F6EFE3",
  startups: "#F6EFE3",
  "real-estate": "#131110",
  policy: "#F6EFE3",
};

// All icon shapes are kept inside a compact, centered safe zone (roughly
// y 45–85, x 42–122 within the 164x130 viewBox) so that preserveAspectRatio
// "slice" — which crops symmetrically from the edges to fill containers of
// very different aspect ratios (short wide cards vs. tall hero strips) —
// never cuts into the icon itself, only into the flat background color.
function Icon({ category, color }: { category: Category; color: string }) {
  switch (category) {
    case "markets":
      return (
        <g fill={color}>
          <rect x="46" y="65" width="18" height="20" />
          <rect x="73" y="55" width="18" height="30" />
          <rect x="100" y="45" width="18" height="40" />
        </g>
      );
    case "energy":
      return (
        <path
          d="M82 45 C 70 58, 63 65, 63 76 C 63 88, 71 96, 82 96 C 93 96, 101 88, 101 76 C 101 68, 96 63, 92 68 C 92 59, 87 50, 82 45 Z"
          fill={color}
        />
      );
    case "trade":
      return (
        <g fill={color}>
          <rect x="42" y="52" width="26" height="18" />
          <rect x="72" y="52" width="26" height="18" />
          <rect x="102" y="52" width="20" height="18" />
          <rect x="42" y="74" width="26" height="18" />
          <rect x="72" y="74" width="26" height="18" />
        </g>
      );
    case "startups":
      return (
        <path
          d="M82 44 L92 66 L114 70 L96 80 L100 100 L82 88 L64 100 L68 80 L50 70 L72 66 Z"
          fill={color}
        />
      );
    case "real-estate":
      return (
        <g fill={color}>
          <rect x="44" y="62" width="20" height="24" />
          <rect x="72" y="48" width="20" height="38" />
          <rect x="100" y="58" width="20" height="28" />
        </g>
      );
    case "policy":
    default:
      return (
        <g fill={color}>
          <rect x="58" y="43" width="48" height="44" rx="4" />
          <rect x="66" y="54" width="32" height="5" fill={BG.policy} />
          <rect x="66" y="65" width="32" height="5" fill={BG.policy} />
          <rect x="66" y="76" width="20" height="5" fill={BG.policy} />
        </g>
      );
  }
}

export function CoverArt({ category, className = "" }: { category: Category; className?: string }) {
  const bg = BG[category] ?? BG.policy;
  const fg = FG[category] ?? FG.policy;
  return (
    <svg viewBox="0 0 164 130" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <rect width="164" height="130" fill={bg} />
      <Icon category={category} color={fg} />
    </svg>
  );
}
