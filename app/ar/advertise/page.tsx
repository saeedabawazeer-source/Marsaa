import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الإعلان معنا",
  description: "تواصل مع صناع القرار في قطاع الأعمال بالشرق الأوسط عبر مرسى.",
};

export default function AdvertisePageAr() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12" dir="rtl">
      <h1 className="mb-4 text-2xl font-bold">الإعلان على مرسى</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] leading-relaxed text-gray-700">
        تغطي مرسى الأسواق والطاقة والعقارات وصفقات الشركات الناشئة التي تحرك الخليج ومنطقة الشرق الأوسط الأوسع.
        قراؤنا هم المؤسسون والمشغّلون والمستثمرون والمدراء التنفيذيون الذين يتابعون قرارات الأعمال في المنطقة.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">إعلانات مرئية</div>
          <p className="text-sm text-gray-700">مواقع إعلانية ضمن الصفحة الرئيسية وصفحات المقالات.</p>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">محتوى برعاية</div>
          <p className="text-sm text-gray-700">محتوى برعاية مُصنّف بوضوح، تتم مراجعته وفق المعايير التحريرية.</p>
        </div>
      </div>

      <div className="rounded border-[3px] border-inkBorder bg-ink p-6 text-paper">
        <p className="mb-3 text-sm">
          مرسى حالياً في مرحلة البناء وما قبل الإطلاق. المساحات الإعلانية وقوائم الأسعار غير متاحة بعد — تواصل معنا
          وسنرد عليك فور فتح المساحات الإعلانية.
        </p>
        <a
          href="mailto:hello@marsa.example"
          className="inline-block rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold text-ink shadow-md"
        >
          راسل الفريق
        </a>
      </div>
    </section>
  );
}
