import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق مرسى.",
};

export default function ContactPageAr() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12" dir="rtl">
      <h1 className="mb-4 text-2xl font-bold">تواصل معنا</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] leading-relaxed text-gray-700">
        نصائح إخبارية، تصحيحات، إعلانات، أو أي شيء آخر — تواصل مباشرة مع غرفة أخبار مرسى.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">غرفة الأخبار</div>
          <a href="mailto:news@marsa.example" className="text-sm font-medium hover:text-accent-light">
            news@marsa.example
          </a>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">التصحيحات</div>
          <a href="mailto:corrections@marsa.example" className="text-sm font-medium hover:text-accent-light">
            corrections@marsa.example
          </a>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">الإعلانات</div>
          <a href="/ar/advertise" className="text-sm font-medium hover:text-accent-light">
            صفحة الإعلان معنا ←
          </a>
        </div>
      </div>

      <p className="mt-8 font-mono text-xs text-gray-500">مرسى · جدة، المملكة العربية السعودية</p>
    </section>
  );
}
