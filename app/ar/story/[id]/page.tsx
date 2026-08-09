import type { Metadata } from "next";
import Link from "next/link";
import { getItemById, getNews } from "@/lib/feeds";
import { NewsCard } from "@/components/ui/NewsCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { Thumb } from "@/components/ui/Thumb";
import { fmtDateline } from "@/lib/time";
import { CATEGORY_LABELS_AR } from "@/lib/labels";
import { absolute } from "@/lib/site";

/** Arabic mirror of the in-app preview — same data, same boundary. */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { item } = await getItemById(params.id, "ar");
  if (!item) return { title: "خبر" };
  return {
    title: `${item.title} — عبر ${item.sourceNameAr}`,
    description: item.summary || undefined,
    openGraph: { title: item.title, description: item.summary || undefined, images: item.image ? [item.image] : undefined },
  };
}

export default async function ArabicStoryPage({ params }: { params: { id: string } }) {
  const { item, url } = await getItemById(params.id, "ar");

  if (!item) {
    return (
      <section dir="rtl" className="mx-auto max-w-[64ch] px-5 py-16 sm:px-6">
        <h1 className="mb-3 text-2xl font-bold">لم يعد هذا الخبر على الشريط.</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
          يعرض مرسى ما ينشره مصادره حالياً فقط. هذا الخبر لم يعد ضمن تغذيتهم، لذا لا يوجد ما يُعرض هنا.
        </p>
        <div className="flex flex-wrap gap-3">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-md border-2 border-inkBorder bg-accent px-4 py-2 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px">
              جرّب موقع الناشر ↗
            </a>
          )}
          <Link href="/ar" className="rounded-md border-2 border-inkBorder bg-white px-4 py-2 text-sm font-bold shadow-md transition hover:-translate-y-px">
            العودة إلى الشريط
          </Link>
        </div>
      </section>
    );
  }

  const news = await getNews({ limit: 60 });
  const same = news.items.filter((i) => i.id !== item.id && i.section === item.section).slice(0, 3);
  const fill = same.length < 3 ? news.items.filter((i) => i.id !== item.id && !same.includes(i)).slice(0, 3 - same.length) : [];
  const related = [...same, ...fill];

  // See app/(main)/story/[id]/page.tsx for why `author` names the publisher,
  // never Marsa — same reasoning, Arabic edition.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.summary || undefined,
    image: item.image ? [item.image] : undefined,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    url: absolute(`/ar/story/${item.id}`),
    mainEntityOfPage: absolute(`/ar/story/${item.id}`),
    isBasedOn: item.link,
    sameAs: item.link,
    author: { "@type": "Organization", name: item.sourceNameAr, url: item.link },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "مرسى",
      logo: { "@type": "ImageObject", url: absolute("/icon-512.png") },
    },
    articleSection: item.section,
    inLanguage: "ar",
  };

  return (
    <article dir="rtl">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <div className="border-b-4 border-inkBorder">
        <Thumb
          src={item.image}
          alt=""
          source={item.sourceNameAr}
          section={item.section}
          eager
          sizes="(max-width: 1240px) 100vw, 1240px"
          className="mx-auto h-[220px] w-full max-w-[1240px] sm:h-[340px] lg:h-[440px]"
        />
      </div>

      <div className="mx-auto max-w-[70ch] px-5 py-9 sm:px-6 sm:py-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold text-white">
            {CATEGORY_LABELS_AR[item.section] ?? item.section}
          </span>
          <span className="rounded-full border-2 border-inkBorder bg-paper px-2.5 py-1 font-mono text-[11px] font-bold text-ink">
            {item.sourceNameAr}
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-[1.15] sm:text-4xl">{item.title}</h1>
        {item.summary && <p className="mb-5 text-lg leading-relaxed text-gray-700">{item.summary}</p>}

        <div className="mb-7 border-b-2 border-ink pb-4 font-mono text-xs text-gray-500">
          <time dateTime={item.publishedAt}>{fmtDateline(item.publishedAt, "ar")}</time>
        </div>

        <div className="rounded-lg border-2 border-inkBorder bg-paper p-5 shadow-md">
          <p className="mb-3 text-[15px] leading-relaxed text-gray-700">
            نشرت <strong>{item.sourceNameAr}</strong> هذا الخبر. يعرض مرسى العنوان والصورة والملخّص فقط —
            النص الكامل من حقّ الناشر، ويُقرأ على موقعه.
          </p>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border-2 border-inkBorder bg-accent px-5 py-2.5 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px"
          >
            اقرأ الخبر كاملاً على {item.sourceNameAr} ↗
          </a>
        </div>

        <div className="mt-9 rounded-lg border-2 border-inkBorder bg-teal px-5 py-6 text-paper shadow-md">
          <h2 className="mb-1 text-center text-lg font-bold">احصل على النشرة الصباحية.</h2>
          <p className="mb-4 text-center text-sm opacity-90">أخبار أعمال الخليج، مختصرة، قبل افتتاح السوق.</p>
          <SubscribeForm lang="ar" />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pb-10 sm:px-6">
          <h2 className="mb-4 border-b-2 border-ink pb-2 text-xl font-bold">التالي على الشريط</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <NewsCard key={r.id} item={r} now={news.fetchedAt} lang="ar" />
            ))}
          </div>
        </section>
      )}

      <AdSlot lang="ar" />
    </article>
  );
}
