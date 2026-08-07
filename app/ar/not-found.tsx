import Link from "next/link";

export default function NotFoundAr() {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center px-6 py-24 text-center" dir="rtl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded border-4 border-inkBorder bg-teal font-display text-2xl font-bold text-accent-light shadow-dramatic-accent">
        م
      </div>
      <h1 className="mb-2 text-2xl font-bold">هذه الصفحة أبحرت بعيداً.</h1>
      <p className="mb-6 text-gray-600">الصفحة التي تبحث عنها غير موجودة، أو تم نقلها.</p>
      <Link href="/ar" className="rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold shadow-md">
        العودة إلى مرسى
      </Link>
    </div>
  );
}
