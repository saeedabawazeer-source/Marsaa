import type { Category } from "./types";

// Shared bilingual labels so every page (Nav, NavAr, category pages, cards)
// pulls from one source instead of re-typing translations per component.
export const CATEGORY_LABELS_EN: Record<Category, string> = {
  markets: "Markets",
  energy: "Energy",
  "real-estate": "Real Estate",
  startups: "Startups",
  trade: "Trade",
  policy: "Policy",
};

export const CATEGORY_LABELS_AR: Record<Category, string> = {
  markets: "الأسواق",
  energy: "الطاقة",
  "real-estate": "العقارات",
  startups: "الشركات الناشئة",
  trade: "التجارة",
  policy: "السياسات",
};

export const DESK_LABELS_AR: Record<string, string> = {
  "Markets Desk": "قسم الأسواق",
  "Energy Desk": "قسم الطاقة",
  "Trade Desk": "قسم التجارة",
  "Startups Desk": "قسم الشركات الناشئة",
  "Real Estate Desk": "قسم العقارات",
  "Policy Desk": "قسم السياسات",
};

export const CATEGORIES: Category[] = ["markets", "energy", "real-estate", "startups", "trade", "policy"];
