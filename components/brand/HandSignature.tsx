/**
 * Animated hand-drawn signature technique (docs/brand.md §3.6 technique 1 / logo-and-submark.md §4.1).
 * Port's real version cycles pre-rendered SVG frames (1.svg...12.svg) of an actual signature.
 * This project doesn't have that signature asset yet, so this implements the same "draws itself"
 * effect via stroke-dasharray/stroke-dashoffset on a placeholder scrawl — swap the <path> below
 * for the real traced signature path once the asset exists; the animation technique stays the same.
 *
 * Kept deliberately subtle per feedback: thin stroke, muted color via className, a slow
 * continuous draw/undraw breathing loop rather than one loud reveal — this sits next to a
 * small "Built by" label in the footer instead of the old rotated BUILDER stamp badge.
 */
export function HandSignature({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 50"
      width="140"
      height="44"
      aria-hidden="true"
    >
      <path
        d="M6 38 C 18 8, 28 8, 34 30 C 40 50, 48 20, 54 24 C 60 28, 62 40, 70 32 C 82 20, 86 42, 100 30 C 112 20, 118 34, 132 26 C 142 20, 148 30, 154 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: "draw-signature 2.4s ease-in-out infinite alternate",
        }}
      />
      <style>{`@keyframes draw-signature { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}
