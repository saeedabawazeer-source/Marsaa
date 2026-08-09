"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Submark } from "../brand/Submark";
import { CATEGORIES, CATEGORY_LABELS_AR } from "@/lib/labels";
import { PuzzleIcon } from "@/components/brand/icons";

const LINKS = CATEGORIES.map((c) => ({ href: `/ar/category/${c}`, label: CATEGORY_LABELS_AR[c] }));

// Mirrors Nav.tsx exactly (same structure/classes), just RTL-flipped labels
// and a switch back to the equivalent English page instead of Arabic.
function englishEquivalent(pathname: string): string {
  const stripped = pathname.replace(/^\/ar/, "") || "/";
  return stripped;
}

export function NavAr() {
  const pathname = usePathname();
  const enHref = englishEquivalent(pathname);

  return (
    <nav className="border-b-4 border-inkBorder bg-paper" dir="rtl">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-4">
        <Link href="/ar" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Submark size={34} className="sm:hidden" />
          <Submark size={42} className="hidden sm:block" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none tracking-tight sm:text-2xl">
              مرسى
            </span>
            <span className="hidden font-mono text-[11px] tracking-wider text-teal-dark sm:block">
              أخبار الأعمال، من جدة
            </span>
          </span>
        </Link>

        <div className="hidden flex-wrap items-center gap-5 text-sm font-medium md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
          <Link
            href="/ar/puzzles"
            className="rounded-full border-2 border-inkBorder bg-accent px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wide transition hover:-translate-y-0.5"
          >
            <span className="inline-flex items-center gap-1.5"><PuzzleIcon size={12} />الألغاز</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href={enHref}
            className="flex h-11 min-w-[44px] items-center justify-center rounded border-2 border-inkBorder px-2 font-mono text-xs font-bold"
            title="English"
          >
            EN
          </Link>
          {/* Was an inert <button> that did nothing when tapped — the same
              defect already fixed on the English nav but never mirrored here.
              Now it goes to the real signup anchor. */}
          <Link
            href="/ar#brief"
            className="flex h-11 items-center rounded border-[3px] border-inkBorder bg-accent px-3 text-xs font-bold shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-px active:translate-y-px active:shadow-sm sm:px-4 sm:text-sm"
          >
            اشترك
          </Link>
        </div>
      </div>

      {/* Same horizontal desk rail as the English nav — all five desks plus the
          puzzles one tap away, no collapsed menu, no sub-44px targets. */}
      <div className="flex items-stretch gap-2 overflow-x-auto border-t-2 border-ink px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-inkBorder px-3 font-mono text-[11px] font-bold tracking-wide transition active:translate-y-px ${
                active ? "bg-teal text-paper" : "bg-white text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/ar/puzzles"
          className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-inkBorder px-3 font-mono text-[11px] font-bold tracking-wide transition active:translate-y-px ${
            pathname === "/ar/puzzles" || pathname === "/ar/game" || pathname === "/ar/sudoku"
              ? "bg-accent-dark text-paper"
              : "bg-accent text-ink"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><PuzzleIcon size={12} />الألغاز</span>
        </Link>
      </div>
    </nav>
  );
}
