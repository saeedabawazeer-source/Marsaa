import { NavAr } from "@/components/ui/NavAr";
import { FooterAr } from "@/components/ui/FooterAr";

// Real Arabic layout — mirrors app/(main)/layout.tsx exactly (Nav+children+Footer),
// just with the Arabic nav/footer. dir="rtl" is set on this wrapper div rather than
// <html> since the root layout (app/layout.tsx) is shared across /  and /ar.
// TODO(i18n): move to proper locale routing so <html lang dir> is correct at the
// document level — see brand.md note in app/ar/page.tsx history.
export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" lang="ar" style={{ fontFamily: "Tajawal, 'Noto Sans Arabic', sans-serif" }}>
      <NavAr />
      {children}
      <FooterAr />
    </div>
  );
}
