"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Submark } from "../brand/Submark";

const LINKS = [
  { href: "/category/markets", label: "Markets" },
  { href: "/category/energy", label: "Energy" },
  { href: "/category/real-estate", label: "Real Estate" },
  { href: "/category/trade", label: "Trade" },
  { href: "/category/policy", label: "Policy" },
];

// Deep-links the language switch to the Arabic equivalent of the current page
// (not just the Arabic homepage), so /category/energy → /ar/category/energy
// and /article/slug → /ar/article/slug. Real 1:1 parity means the switch has
// to land you on the same story, not force you back to the top.
function arabicEquivalent(pathname: string): string {
  if (
    pathname.startsWith("/article/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/story/") ||
    pathname === "/game" ||
    pathname === "/sudoku" ||
    pathname === "/puzzles"
  ) {
    return `/ar${pathname}`;
  }
  return "/ar";
}

export function Nav() {
  const pathname = usePathname();
  const arHref = arabicEquivalent(pathname);

  return (
    <nav className="border-b-4 border-inkBorder bg-paper">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Submark size={34} className="sm:hidden" />
          <Submark size={42} className="hidden sm:block" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none tracking-tight sm:text-2xl">
              Marsa
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-teal-dark sm:block">
              MENA business, from Jeddah
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-wrap items-center gap-5 text-sm font-medium md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
          {/* The five desks are the taxonomy; the puzzles are not a sixth desk,
              so they sit apart from them rather than pretending to be one. */}
          <Link
            href="/puzzles"
            className="rounded-full border-2 border-inkBorder bg-accent px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide transition hover:-translate-y-0.5"
          >
            Puzzles ✦
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Was `hidden sm:block` — on a phone there was no way to reach the
              Arabic edition from the bar at all, which is not what 1:1
              bilingual parity means. Now always present, sized to the 44px
              tap floor. */}
          <Link
            href={arHref}
            className="flex h-11 min-w-[44px] items-center justify-center rounded border-2 border-inkBorder px-2 font-mono text-xs font-bold"
            title="العربية"
          >
            ع
            <span className="hidden sm:inline">ربية</span>
          </Link>
          <Link
            href="/#brief"
            className="flex h-11 items-center rounded border-[3px] border-inkBorder bg-accent px-3 text-xs font-bold shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-px active:translate-y-px active:shadow-sm sm:px-4 sm:text-sm"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* Mobile: a real horizontal desk rail instead of a collapsed menu.
          The old <details> hid every section behind a text-sized ☰ that missed
          the 44px tap floor, and pushed the page down when opened. A scrolling
          rail keeps all five desks plus Puzzles one thumb-tap away and costs no
          vertical space. */}
      <div className="flex items-stretch gap-2 overflow-x-auto border-t-2 border-ink px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-inkBorder px-3 font-mono text-[11px] font-bold uppercase tracking-wide transition active:translate-y-px ${
                active ? "bg-teal text-paper" : "bg-white text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/puzzles"
          className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-inkBorder px-3 font-mono text-[11px] font-bold uppercase tracking-wide transition active:translate-y-px ${
            pathname === "/puzzles" || pathname === "/game" || pathname === "/sudoku"
              ? "bg-accent-dark text-paper"
              : "bg-accent text-ink"
          }`}
        >
          Puzzles ✦
        </Link>
      </div>
    </nav>
  );
}
