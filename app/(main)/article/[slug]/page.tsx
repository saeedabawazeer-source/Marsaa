import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getLatestArticles } from "@/lib/api";
import { AdSlot } from "@/components/ui/AdSlot";
import { CoverArt } from "@/components/ui/CoverArt";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { fmtDateline } from "@/lib/time";

export async function generateStaticParams() {
  const articles = await getLatestArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      type: "article",
      publishedTime: article.publishedAt,
      locale: "en",
      alternateLocale: "ar",
    },
    alternates: { languages: { ar: `/ar/article/${article.slug}` } },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getLatestArticles();
  const ordered = [...all].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const idx = ordered.findIndex((a) => a.slug === article.slug);
  // The next story in publication order, so finishing one piece always has a
  // defined next step rather than dead-ending at the footer. This is the whole
  // retention mechanic on an article page: never let the reader run out of road.
  const next = ordered[(idx + 1) % ordered.length];

  const related = all.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 2);
  const fill = related.length < 2
    ? all.filter((a) => a.slug !== article.slug && !related.includes(a)).slice(0, 2 - related.length)
    : [];
  const relatedStories = [...related, ...fill];

  return (
    <article>
      <ReadingProgress />
      <CoverArt category={article.category} className="h-48 w-full sm:h-64" />

      <div className="mx-auto max-w-[64ch] px-5 py-10 sm:px-6 sm:py-14">
        <span className="mb-3 inline-block rounded-full bg-teal px-3 py-1 font-mono text-xs font-bold uppercase text-white">
          {article.category.replace("-", " ")}
        </span>
        <h1 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{article.title}</h1>
        <p className="mb-4 text-base text-gray-600 sm:text-lg">{article.dek}</p>

        {/* Full dateline with an exchange-local time, not a bare ISO date.
            A business reader treats "when" as part of the fact. */}
        <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-b-2 border-ink pb-4 font-mono text-xs uppercase tracking-wide text-gray-500">
          <span className="font-bold text-teal-dark">{article.desk}</span>
          <span aria-hidden>·</span>
          <span>{article.readMins} min read</span>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt}>{fmtDateline(article.publishedAt)}</time>
        </div>

        <div id="article-body" className="space-y-5 text-base leading-[1.75] sm:text-[18px]">
          {article.body.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-teal"
                  : ""
              }
            >
              {p}
            </p>
          ))}
        </div>

        {/* Next story sits immediately after the last paragraph — the moment
            attention is highest and most likely to be lost. */}
        <Link
          href={`/article/${next.slug}`}
          className="group mt-10 flex items-center gap-4 rounded border-[3px] border-inkBorder bg-white p-4 shadow-md transition hover:-translate-y-px hover:shadow-lg"
        >
          <span className="shrink-0 font-mono text-[10px] font-bold uppercase leading-tight tracking-wide text-gray-500">
            Up
            <br />
            next
          </span>
          <span className="h-10 w-0.5 shrink-0 bg-accent" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-snug transition group-hover:text-teal-dark">
              {next.title}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide text-gray-500">
              {next.category.replace("-", " ")} · {next.readMins} min read
            </span>
          </span>
          <span aria-hidden className="ml-auto shrink-0 font-mono text-lg text-teal-dark transition group-hover:translate-x-0.5">
            →
          </span>
        </Link>

        {/* Signup at the end of the piece. The article template previously
            offered the reader nothing at the exact moment they had just spent
            three minutes with the publication and were most convertible. */}
        <div className="mt-10 rounded border-[3px] border-inkBorder bg-teal px-5 py-6 text-paper shadow-md">
          <h2 className="mb-1 text-center text-lg font-bold">Get the morning brief.</h2>
          <p className="mb-4 text-center text-sm opacity-90">
            MENA business, in five minutes, before the Riyadh open.
          </p>
          <SubscribeForm />
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
