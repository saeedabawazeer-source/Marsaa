import type { Metadata } from "next";
import { getArticlesByCategory, getLatestArticles } from "@/lib/api";
import { ArticleCard } from "@/components/ui/Card";
import { AdSlot } from "@/components/ui/AdSlot";

const LABELS: Record<string, string> = {
  markets: "Markets",
  energy: "Energy",
  "real-estate": "Real Estate",
  startups: "Startups",
  trade: "Trade",
  policy: "Policy",
};

export async function generateStaticParams() {
  const articles = await getLatestArticles();
  const cats = Array.from(new Set(articles.map((a) => a.category)));
  return cats.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const label = LABELS[params.slug] ?? params.slug;
  return { title: label, description: `${label} news from Marsa — MENA business, from Jeddah.` };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const articles = await getArticlesByCategory(params.slug);
  const label = LABELS[params.slug] ?? params.slug;

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">{label}</h1>
      {articles.length === 0 ? (
        <p className="text-gray-600">No stories in {label.toLowerCase()} yet — check back soon.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
      <div className="mt-10">
        <AdSlot />
      </div>
    </section>
  );
}
