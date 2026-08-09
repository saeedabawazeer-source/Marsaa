import type { ReactNode } from "react";
import type { Section } from "./feeds";
import {
  MarketsIcon,
  EnergyIcon,
  RealEstateIcon,
  TradeIcon,
  PolicyIcon,
} from "@/components/brand/icons";

/**
 * One desk, one colour, one icon — defined once.
 *
 * Colour alone was doing all the work here, which fails twice: about 1 in 12 men
 * cannot reliably separate the teal and the ochre, and the whole scheme
 * collapses to identical greys when a page is printed or screenshotted in
 * monochrome. Pairing every desk with a distinct silhouette means the category
 * survives both. This is also why the icons are shapes rather than emoji — an
 * emoji's colour is the font's decision, not ours.
 *
 * `hex` exists alongside the Tailwind classes for the places that cannot take a
 * class: OG image generation, the RSS feed, and inline SVG fills.
 */
export interface SectionStyle {
  slug: Section;
  en: string;
  ar: string;
  /** Solid fill, for the badge itself. */
  bg: string;
  /** Text colour that meets contrast on `bg`. */
  fg: string;
  /** Tinted surface, for chips and hovers. */
  tint: string;
  /** Border for the tinted surface. */
  ring: string;
  /** Bare colour, for non-class contexts. */
  hex: string;
  icon: (props: { size?: number; className?: string }) => ReactNode;
}

export const SECTION_STYLES: Record<Section, SectionStyle> = {
  markets: {
    slug: "markets",
    en: "Markets",
    ar: "الأسواق",
    bg: "bg-[#0B7A75]",
    fg: "text-white",
    tint: "bg-[#0B7A75]/10",
    ring: "border-[#0B7A75]/30",
    hex: "#0B7A75",
    icon: MarketsIcon,
  },
  energy: {
    slug: "energy",
    en: "Energy",
    ar: "الطاقة",
    bg: "bg-[#C8912B]",
    fg: "text-[#131110]",
    tint: "bg-[#C8912B]/12",
    ring: "border-[#C8912B]/35",
    hex: "#C8912B",
    icon: EnergyIcon,
  },
  "real-estate": {
    slug: "real-estate",
    en: "Real Estate",
    ar: "العقارات",
    bg: "bg-[#A2542B]",
    fg: "text-white",
    tint: "bg-[#A2542B]/10",
    ring: "border-[#A2542B]/30",
    hex: "#A2542B",
    icon: RealEstateIcon,
  },
  trade: {
    slug: "trade",
    en: "Trade",
    ar: "التجارة",
    bg: "bg-[#1F4E6B]",
    fg: "text-white",
    tint: "bg-[#1F4E6B]/10",
    ring: "border-[#1F4E6B]/30",
    hex: "#1F4E6B",
    icon: TradeIcon,
  },
  policy: {
    slug: "policy",
    en: "Policy",
    ar: "السياسات",
    bg: "bg-[#07514D]",
    fg: "text-white",
    tint: "bg-[#07514D]/10",
    ring: "border-[#07514D]/30",
    hex: "#07514D",
    icon: PolicyIcon,
  },
};

export const SECTION_ORDER: Section[] = ["markets", "energy", "real-estate", "trade", "policy"];

export function sectionLabel(slug: Section, lang: "en" | "ar"): string {
  const s = SECTION_STYLES[slug];
  return lang === "ar" ? s.ar : s.en;
}

/** The desk chip used on cards, category headers and the nav rail. */
export function SectionChip({
  slug,
  lang = "en",
  size = "sm",
  solid = false,
  className = "",
}: {
  slug: Section;
  lang?: "en" | "ar";
  size?: "sm" | "md";
  solid?: boolean;
  className?: string;
}) {
  const s = SECTION_STYLES[slug];
  const IconComponent = s.icon;
  const iconSize = size === "md" ? 14 : 12;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-bold uppercase tracking-[0.08em]",
        size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]",
        solid ? `${s.bg} ${s.fg} border-transparent` : `${s.tint} ${s.ring} text-ink`,
        className,
      ].join(" ")}
    >
      <IconComponent size={iconSize} />
      {sectionLabel(slug, lang)}
    </span>
  );
}
