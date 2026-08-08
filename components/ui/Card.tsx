import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverArt } from "./CoverArt";
import { CATEGORY_LABELS_AR, DESK_LABELS_AR } from "@/lib/labels";
import { fmtDay } from "@/lib/time";

const PILL_STYLES: Record<string, string> = {
  markets: "bg-teal text-white",
  energy: "bg-accent text-ink",
  trade: "bg-ink text-paper",
  startups: "bg-teal text-white",
  "real-estate": "bg-accent text-ink",
  policy: "bg-ink text-paper",
};

// coverImage-aware: renders a real photo when Article.coverImage is set
// (once real image assets exist — see lib/types.ts), falling back to the
// honest abstract CoverArt icon otherwise. Same component serves both the
// English and Arabic sites via the `lang` prop, so cards stay 1:1.
export function ArticleCard({ article, big = false, lang = "en" }: { article: Article; big?: boolean; lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const href = isAr ? `/ar/article/${article.slug}` : `/article/${article.slug}`;
  const title = isAr ? article.titleAr : article.title;
  const dek = isAr ? article.dekAr : article.dek;
  const categoryLabel = isAr ? CATEGORY_LABELS_AR[article.category] : article.category.replace("-", " ");
  const deskLabel = isAr ? DESK_LABELS_AR[article.desk] ?? article.desk : article.desk.toUpperCase();
  const minLabel = isAr ? `${article.readMins} دقائق` : `${article.readMins} MIN`;
  const artClass = big ? "h-40 w-full" : "h-28 w-full";

  return (
    <Link
      href={href}
      dir={isAr ? "rtl" : "ltr"}
      className="group block overflow-hidden rounded border-[3px] border-inkBorder bg-white shadow-md transition hover:-translate-x-px hover:-translate-y-px hover:shadow-lg"
    >
      {article.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.coverImage} alt={article.coverImageAlt ?? title} className={`${artClass} object-cover`} />
      ) : (
        <CoverArt category={article.category} className={artClass} />
      )}
      <div className={big ? "p-6" : "p-4"}>
        <span className={`mb-2.5 inline-block rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${PILL_STYLES[article.category] ?? "bg-ink text-paper"}`}>
          {categoryLabel}
        </span>
        <h3 className={`mb-2 font-semibold leading-snug transition group-hover:text-teal-dark ${big ? "text-xl sm:text-2xl" : "text-base"}`}>
          {title}
        </h3>
        <p className={`mb-2.5 text-gray-600 ${big ? "text-base" : "text-sm"}`}>{dek}</p>
        <div className="font-mono text-[11px] text-gray-500">
          {deskLabel}{isAr ? "" : " ·"} {minLabel} · {fmtDay(article.publishedAt, lang)}
        </div>
      </div>
    </Link>
  );
}
