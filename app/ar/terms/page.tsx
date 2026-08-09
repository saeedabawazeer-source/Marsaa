import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "الشروط التي تحكم استخدامك لموقع مرسى.",
};

export default function TermsPageAr() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12" dir="rtl">
      <h1 className="mb-2 text-2xl font-bold">شروط الاستخدام</h1>
      <p className="mb-8 font-mono text-xs text-gray-500">آخر تحديث: أغسطس 2026</p>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-800">
        <p>باستخدامك لموقع مرسى، فإنك توافق على الشروط التالية.</p>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">المحتوى</h2>
          <p>
            تنشر مرسى أخباراً وتحليلات حول أعمال وأسواق وتجارة الشرق الأوسط. تعكس المقالات التقارير والتحليل في وقت
            النشر وليست نصيحة استثمارية أو قانونية أو مالية. تحقق من أي أرقام أو قرارات مقابل المصادر الأساسية قبل
            التصرف بناءً عليها.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">استخدام الموقع</h2>
          <p>
            يمكنك قراءة ومشاركة مقالات مرسى والربط بها للاستخدام الشخصي والتحريري. لا يُسمح بإعادة نشر المقالات كاملة
            في مواقع أخرى دون إذن، أو استخدام الموقع للجمع الآلي الجماعي للبيانات.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">إخلاء المسؤولية</h2>
          <p>
            يُقدَّم الموقع &quot;كما هو&quot;. نعمل على الحفاظ على دقة التغطية وسرعة التصحيحات، لكننا لا نضمن خلو الموقع من
            الأخطاء أو عدم انقطاعه.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">التغييرات</h2>
          <p>قد نحدّث هذه الشروط مع تطور المنتج؛ ستنعكس التغييرات الجوهرية في هذه الصفحة.</p>
        </div>

        <p className="text-sm text-gray-500">
          يمكن إرسال الأسئلة حول هذه الشروط عبر صفحة{" "}
          <a href="/ar/contact" className="underline hover:text-accent-light">تواصل معنا</a>.
        </p>
      </div>
    </section>
  );
}
