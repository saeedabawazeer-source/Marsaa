import Link from "next/link";
import { BrickSignature } from "../brand/BrickSignature";

// Mirrors Footer.tsx exactly — same signature, same saeed.sbs link — with the
// "Built by" label translated to "بُني بواسطة" so the credit is fully Arabic
// on this page too, per docs/brand.md §3.6.
export function FooterAr() {
  return (
    <footer className="bg-ink px-6 pb-7 pt-10 text-paper" dir="rtl">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-1.5 text-base font-bold">مرسى</div>
            <div className="font-mono text-[11px] opacity-70">أخبار الأعمال في الشرق الأوسط. جدة، المملكة العربية السعودية.</div>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <Link href="/ar/privacy" className="hover:text-accent-light">سياسة الخصوصية</Link>
            <Link href="/ar/terms" className="hover:text-accent-light">شروط الاستخدام</Link>
            <Link href="/ar/advertise" className="hover:text-accent-light">الإعلان معنا</Link>
            <Link href="/ar/contact" className="hover:text-accent-light">تواصل معنا</Link>
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-white/15 pt-5">
          <span className="font-mono text-xs opacity-70">© {new Date().getFullYear()} مرسى • جدة، المملكة العربية السعودية</span>
        </div>

        <div className="mt-6 flex flex-col items-center" dir="rtl">
          <span className="mb-2 font-mono text-[10px] uppercase tracking-wider opacity-50">بُني بواسطة</span>
          <a href="https://saeed.sbs" target="_blank" rel="noopener noreferrer" aria-label="سعيد — saeed.sbs">
            <BrickSignature />
          </a>
        </div>
      </div>
    </footer>
  );
}
