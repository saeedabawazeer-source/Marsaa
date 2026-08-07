"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Submark } from "../brand/Submark";
import { CATEGORIES, CATEGORY_LABELS_AR } from "@/lib/labels";

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
    <nav className="border-b-4 border-inkBorder bg-paper px-4 py-3 sm:px-6 sm:py-4" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <Link href="/ar" className="flex items-center gap-2 sm:gap-2.5">
          <Submark size={36} className="sm:hidden" />
          <Submark size={42} className="hidden sm:block" />
          <span>
            <span className="block font-display text-xl font-bold leading-none tracking-tight sm:text-2xl">مرسى</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-teal-dark sm:block">أخبار الأعمال، من جدة</span>
          </span>
        </Link>

        <div className="hidden flex-wrap gap-5 text-sm font-medium md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={enHref}
            className="hidden rounded border-2 border-inkBorder px-2 py-1.5 font-mono text-xs font-bold sm:block"
            title="English"
          >
            English
          </Link>
          <button className="rounded border-[3px] border-inkBorder bg-accent px-3 py-1.5 text-xs font-bold shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-px active:translate-y-px active:shadow-sm sm:px-4 sm:py-2 sm:text-sm">
            اشترك
          </button>
        </div>
      </div>

      <details className="mt-3 md:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true">☰</span> القائمة
        </summary>
        <div className="mt-3 flex flex-col gap-3 border-t-2 border-ink pt-3 text-sm font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
          <Link href={enHref} className="border-b-2 border-transparent pb-1 hover:border-accent">
            English
          </Link>
        </div>
      </details>
    </nav>
  );
}
