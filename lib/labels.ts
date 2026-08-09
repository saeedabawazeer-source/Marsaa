import type { Section } from "./feeds";

// Desk labels for the live portal sections (five desks, matching the nav).
//
// This used to key off a leftover `Category` type from the old mock-article
// system that included a sixth "startups" desk with no real feed classifier
// behind it (lib/feeds.ts's DESK_RULES never produces "startups"). That
// mismatch meant NavAr — which builds its links from CATEGORIES — rendered a
// 6th "Startups" link on the Arabic site with no English equivalent and no
// stories behind it: a bilingual-parity break. Retyped against the real
// `Section` from feeds.ts so the two navs can no longer drift apart.

// Shared bilingual labels so every page (Nav, NavAr, category pages, cards)
// pulls from one source instead of re-typing translations per component.
export const CATEGORY_LABELS_EN: Record<Section, string> = {
  markets: "Markets",
  energy: "Energy",
  "real-estate": "Real Estate",
  trade: "Trade",
  policy: "Policy",
};

export const CATEGORY_LABELS_AR: Record<Section, string> = {
  markets: "الأسواق",
  energy: "الطاقة",
  "real-estate": "العقارات",
  trade: "التجارة",
  policy: "السياسات",
};

export const DESK_LABELS_AR: Record<string, string> = {
  "Markets Desk": "قسم الأسواق",
  "Energy Desk": "قسم الطاقة",
  "Trade Desk": "قسم التجارة",
  "Real Estate Desk": "قسم العقارات",
  "Policy Desk": "قسم السياسات",
};

export const CATEGORIES: Section[] = ["markets", "energy", "real-estate", "trade", "policy"];
