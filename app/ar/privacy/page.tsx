import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف تجمع مرسى بياناتك وتستخدمها وتحميها.",
};

export default function PrivacyPageAr() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12" dir="rtl">
      <h1 className="mb-2 text-2xl font-bold">سياسة الخصوصية</h1>
      <p className="mb-8 font-mono text-xs text-gray-500">آخر تحديث: أغسطس 2026</p>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-800">
        <p>
          تنشر مرسى أخبار الأعمال في الشرق الأوسط وشمال أفريقيا من جدة، المملكة العربية السعودية. توضح هذه الصفحة
          بعبارات بسيطة ما هي البيانات التي نجمعها عند استخدامك للموقع وما نفعله بها.
        </p>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">ما الذي نجمعه</h2>
          <p>
            بيانات تحليلات الويب المعتادة (الصفحات المُشاهدة، الموقع التقريبي عبر عنوان الإنترنت، نوع الجهاز والمتصفح)،
            وإذا اشتركت لتلقي التحديثات، عنوان بريدك الإلكتروني. لا نبيع البيانات الشخصية لأطراف ثالثة.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">ملفات تعريف الارتباط</h2>
          <p>
            نستخدم ملفات تعريف ارتباط أساسية لتشغيل الموقع، وحيثما تم تفعيلها، ملفات تحليلية لفهم حركة الزوار. يمكنك
            تعطيل ملفات تعريف الارتباط من متصفحك في أي وقت، وسيستمر الموقع في العمل.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">الإعلانات</h2>
          <p>
            إذا وعندما تعرض مرسى إعلانات، قد يستخدم شركاء الإعلان ملفات تعريف ارتباط أو تقنيات مشابهة لعرض إعلانات
            ذات صلة. راجع صفحة{" "}
            <a href="/ar/advertise" className="underline hover:text-accent-light">الإعلان معنا</a> لمزيد من التفاصيل.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">حقوقك</h2>
          <p>
            يمكنك طلب نسخة من أي بيانات شخصية نحتفظ بها عنك أو طلب حذفها عبر التواصل معنا — انظر صفحة{" "}
            <a href="/ar/contact" className="underline hover:text-accent-light">تواصل معنا</a>.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          هذه سياسة أولية عامة لموقع قيد التطوير. قبل الإطلاق الفعلي، يجب مراجعة هذه الصفحة من قِبل مستشار قانوني في ضوء
          متطلبات نظام حماية البيانات الشخصية السعودي (PDPL).
        </p>
      </div>
    </section>
  );
}
