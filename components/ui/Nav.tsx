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
  if (pathname.startsWith("/article/") || pathname.startsWith("/category/")) {
    return `/ar${pathname}`;
  }
  return "/ar";
}

export function Nav() {
  const pathname = usePathname();
  const arHref = arabicEquivalent(pathname);
  return (
    <nav className="border-b-4 border-inkBorder bg-paper px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <Submark size={36} className="sm:hidden" />
          <Submark size={42} className="hidden sm:block" />
          <span>
            <span className="block font-display text-xl font-bold leading-none tracking-tight sm:text-2xl">Marsa</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-teal-dark sm:block">MENA business, from Jeddah</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-wrap gap-5 text-sm font-medium md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={arHref}
            className="hidden rounded border-2 border-inkBorder px-2 py-1.5 font-mono text-xs font-bold sm:block"
            title="العربية"
          >
            العربية
          </Link>
          {/* Was an inert <button>: the most prominent element above the fold
              did nothing at all when clicked. It now jumps to the real signup. */}
          <Link
            href="/#brief"
            className="rounded border-[3px] border-inkBorder bg-accent px-3 py-1.5 text-xs font-bold shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg active:translate-x-px active:translate-y-px active:shadow-sm sm:px-4 sm:py-2 sm:text-sm"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* Mobile menu — zero-JS <details>/<summary>, no client component needed */}
      <details className="mt-3 md:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true">☰</span> Menu
        </summary>
        <div className="mt-3 flex flex-col gap-3 border-t-2 border-ink pt-3 text-sm font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-1 hover:border-accent">
              {l.label}
            </Link>
          ))}
          <Link href={arHref} className="border-b-2 border-transparent pb-1 hover:border-accent">
            العربية
          </Link>
        </div>
      </details>
    </nav>
  );
}
