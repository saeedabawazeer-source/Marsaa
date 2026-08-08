import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getLatestArticles } from "@/lib/api";
import { AdSlot } from "@/components/ui/AdSlot";
import { CoverArt } from "@/components/ui/CoverArt";

export async function generateStaticParams() {
  const articles = await getLatestArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  return { title: article.title, description: article.dek };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getLatestArticles();
  const related = all.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 2);
  const more = related.length < 2 ? all.filter((a) => a.slug !== article.slug && !related.includes(a)).slice(0, 2 - related.length) : [];
  const relatedStories = [...related, ...more];

  return (
    <article>
      <CoverArt category={article.category} className="h-48 w-full sm:h-64" />
      <div className="mx-auto max-w-[64ch] px-5 py-10 sm:px-6 sm:py-14">
      <span className="mb-3 inline-block rounded-full bg-teal px-3 py-1 font-mono text-xs font-bold uppercase text-white">
        {article.category.replace("-", " ")}
      </span>
      <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{article.title}</h1>
      <p className="mb-4 text-base text-gray-600 sm:text-lg">{article.dek}</p>
      <div className="mb-8 border-b-2 border-ink pb-4 font-mono text-xs uppercase tracking-wide text-gray-500">
        {article.desk} · {article.readMins} min read · {article.publishedAt}
      </div>
      <div className="space-y-5 text-base leading-[1.75] sm:text-[18px]">
        {article.body.map((p, i) => (
          <p
            key={i}
            className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-teal" : ""}
          >
            {p}
          </p>
        ))}
      </div>
      <div className="mt-10">
        <AdSlot width={336} height={280} />
      </div>

      {relatedStories.length > 0 && (
        <div className="mt-12 border-t-4 border-ink pt-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-wide text-gray-500">Keep reading</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedStories.map((r) => (
              <Link
                key={r.slug}
                href={`/article/${r.slug}`}
                className="block rounded border-[3px] border-inkBorder bg-white p-4 shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg"
              >
                <span className="mb-2 inline-block rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-paper">
                  {r.category.replace("-", " ")}
                </span>
                <h3 className="text-sm font-semibold leading-snug">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </article>
  );
}
