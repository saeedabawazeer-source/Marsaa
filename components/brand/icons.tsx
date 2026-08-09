/**
 * Marsa's icon set.
 *
 * Hand-drawn on a 24×24 grid, stroked (not filled) at 1.75 so they sit at the
 * same optical weight as the type around them. `currentColor` throughout, so an
 * icon inherits whatever colour its context sets and there is never a second
 * place to update a palette.
 *
 * NO EMOJI. Not in the markup, not as a fallback, not as decoration. Emoji
 * render as a different typeface on every platform, carry a colour the design
 * does not control, are read aloud by screen readers as their CLDR name
 * ("sparkles") in the middle of a sentence, and look like a consumer app rather
 * than a business publication. Every glyph in this file is a real SVG this
 * project owns.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Desk icons — one per section, paired with a colour in lib/sections.ts
 * ------------------------------------------------------------------ */

/** Markets — a candlestick run, the one chart every trader reads first. */
export const MarketsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V10M9 20V4M15 20V8M20 20V13" />
    <path d="M2 20h20" />
  </Icon>
);

/** Energy — a derrick/flow line rather than a lightning bolt (too generic). */
export const EnergyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Icon>
);

/** Real estate — a tower block, not a suburban house. */
export const RealEstateIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-5h6v5" />
    <path d="M9 9h.01M15 9h.01M9 12.5h.01M15 12.5h.01" />
  </Icon>
);

/** Trade — a container ship's stacked boxes over a waterline. */
export const TradeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 18c1.5 0 1.5 1.5 3 1.5S6.5 18 8 18s1.5 1.5 3 1.5S12.5 18 14 18s1.5 1.5 3 1.5S18.5 18 20 18" />
    <path d="M4 15V9h16v6" />
    <path d="M9 9V5h6v4" />
    <path d="M12 5V3" />
  </Icon>
);

/** Policy — a ministry colonnade. */
export const PolicyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 21h18" />
    <path d="M4 21V10M9 21V10M15 21V10M20 21V10" />
    <path d="M2 10h20L12 3 2 10Z" />
  </Icon>
);

/* ------------------------------------------------------------------ *
 * Interface icons
 * ------------------------------------------------------------------ */

/** Share — the standard three-node graph, understood everywhere. */
export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </Icon>
);

export const WhatsAppIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.05c-.24.68-1.42 1.31-1.95 1.36-.5.05-.98.24-3.3-.69-2.78-1.1-4.55-3.95-4.69-4.14-.14-.19-1.12-1.49-1.12-2.84 0-1.35.71-2.02.96-2.29.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.62.48.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.3.37-.42.49-.14.14-.29.29-.12.57.16.28.73 1.2 1.56 1.95 1.08.96 1.98 1.26 2.26 1.4.28.14.44.12.61-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.14.46.21.53.32.07.12.07.66-.17 1.34Z" />
  </svg>
);

export const XIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m20 6-11 11-5-5" />
  </Icon>
);

export const ArrowIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

/** Puzzles — a grid with one cell filled, reading as both crossword and sudoku. */
export const PuzzleIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="0.5" fill="currentColor" stroke="none" />
  </Icon>
);

export const FlameIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 22c4 0 7-2.7 7-6.5 0-4.5-4-6-4-9.5-2 1-3 2.5-3 4.5-1-.7-1.5-1.8-1.5-3C8 9 5 11.2 5 15.5 5 19.3 8 22 12 22Z" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </Icon>
);

/** Save-for-later, outline and filled. Replaces the ★ / ☆ glyph pair. */
export const StarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5Z" />
  </Icon>
);

export const StarFilledIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="m12 3.5 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5Z" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
