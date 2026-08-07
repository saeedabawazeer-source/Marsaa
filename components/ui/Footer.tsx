import Link from "next/link";
import { BrickSignature } from "../brand/BrickSignature";

// Footer credit per docs/brand.md §3.6: no BUILDER stamp badge, but the real SAEED
// lego-brick signature stays — same GSAP bounce animation, same locked Port colors,
// unchanged. Just a small "Built by" label above it instead of the rotated badge.
export function Footer() {
  return (
    <footer className="bg-ink px-6 pb-7 pt-10 text-paper">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-1.5 text-base font-bold">Marsa</div>
            <div className="font-mono text-[11px] opacity-70">MENA business news. Jeddah, Saudi Arabia.</div>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <Link href="/privacy" className="hover:text-accent-light">Privacy policy</Link>
            <Link href="/terms" className="hover:text-accent-light">Terms of use</Link>
            <Link href="/advertise" className="hover:text-accent-light">Advertise</Link>
            <Link href="/contact" className="hover:text-accent-light">Contact</Link>
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-white/15 pt-5">
          <span className="font-mono text-xs opacity-70">© {new Date().getFullYear()} Marsa • Jeddah, Saudi Arabia</span>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <span className="mb-2 font-mono text-[10px] uppercase tracking-wider opacity-50">Built by</span>
          <a href="https://saeed.sbs" target="_blank" rel="noopener noreferrer" aria-label="Saeed — saeed.sbs">
            <BrickSignature />
          </a>
        </div>
      </div>
    </footer>
  );
}
