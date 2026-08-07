import type { Metadata } from "next";
import { getArticlesByCategory, getLatestArticles } from "@/lib/api";
import { ArticleCard } from "@/components/ui/Card";
import { AdSlot } from "@/components/ui/AdSlot";
import { CATEGORY_LABELS_AR } from "@/lib/labels";
import type { Category } from "@/lib/types";

// Real 1:1 mirror of app/(main)/category/[slug]/page.tsx.
export async function generateStaticParams() {
  const articles = await getLatestArticles();
  const cats = Array.from(new Set(articles.map((a) => a.category)));
  return cats.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const label = CATEGORY_LABELS_AR[params.slug as Category] ?? params.slug;
  return { title: label, description: `أخبار ${label} من مرسى — أخبار الأعمال في الشرق الأوسط، من جدة.` };
}

export default async function ArabicCategoryPage({ params }: { params: { slug: string } }) {
  const articles = await getArticlesByCategory(params.slug);
  const label = CATEGORY_LABELS_AR[params.slug as Category] ?? params.slug;

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12" dir="rtl">
      <h1 className="mb-6 text-2xl font-bold">{label}</h1>
      {articles.length === 0 ? (
        <p className="text-gray-600">لا توجد أخبار في قسم {label} بعد — تابعونا قريباً.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} lang="ar" />
          ))}
        </div>
      )}
      <div className="mt-10">
        <AdSlot lang="ar" />
      </div>
    </section>
  );
}
