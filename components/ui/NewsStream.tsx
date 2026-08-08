"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NewsItem } from "@/lib/feeds";
import Link from "next/link";
import { fmtClock, fmtDay, fmtAgo } from "@/lib/time";
import { Thumb } from "./Thumb";

/**
 * The reading surface.
 *
 * A portal earns its existence in exactly one way: it has to be faster to find
 * out what happened here than on the six sites it aggregates. Everything below
 * serves that, and nothing below is ornament.
 *
 *   - **New since your last visit.** The single strongest reason to come back
 *     tomorrow. Stored locally, never sent anywhere, and rendered only after
 *     mount so the server and client agree on first paint.
 *   - **Filter and search over the whole stream**, instant, no round trip.
 *     Publishers make you use their site search; a portal shouldn't.
 *   - **Keyboard navigation.** j/k to move, o or Enter to open, s to save.
 *     Anyone reading a business wire daily reads it with their hands on the
 *     keyboard within a week.
 *   - **Save for later**, because the common failure on a morning scan is
 *     finding something you have no time to read yet.
 *
 * Every headline opens the publisher's page in a new tab. That is the honest
 * behaviour for aggregated work, and the new tab is deliberate: it keeps the
 * reader's place in the stream instead of making them walk back.
 */

const LAST_VISIT_KEY = "marsa.lastVisit";
const SAVED_KEY = "marsa.saved";

type Density = "comfortable" | "compact";

function useLocalSet(key: string): [Set<string>, (id: string) => void, boolean] {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* storage unavailable (private mode, blocked) — saving degrades, nothing breaks */
    }
    setReady(true);
  }, [key]);

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return [ids, toggle, ready];
}

function dayBucket(iso: string, now: string, lang: "en" | "ar"): string {
  const d = new Date(iso);
  const n = new Date(now);
  const days = Math.floor((n.getTime() - d.getTime()) / 86_400_000);
  const sameDate = fmtDay(iso, lang) === fmtDay(now, lang);
  if (sameDate) return lang === "ar" ? "اليوم" : "Today";
  if (days <= 2) return lang === "ar" ? "أمس" : "Yesterday";
  return fmtDay(iso, lang);
}

export function NewsStream({
  items,
  now,
  sources,
  lang = "en",
}: {
  items: NewsItem[];
  now: string;
  sources: string[];
  lang?: "en" | "ar";
}) {
  const isAr = lang === "ar";
  const base = isAr ? "/ar/story" : "/story";
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("all");
  const [onlySaved, setOnlySaved] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");
  const [cursor, setCursor] = useState(-1);

  const [saved, toggleSaved] = useLocalSet(SAVED_KEY);
  const [lastVisit, setLastVisit] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(LAST_VISIT_KEY);
      setLastVisit(raw ? Number(raw) : null);
      // Stamp on the way in, so "new" means new since the previous session
      // rather than resetting the moment the reader scrolls.
      window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
      setLastVisit(null);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (source !== "all" && (isAr ? i.sourceNameAr : i.sourceName) !== source) return false;
      if (onlySaved && !saved.has(i.id)) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q);
    });
  }, [items, query, source, onlySaved, saved, isAr]);

  const freshCount = useMemo(() => {
    if (!mounted || lastVisit == null) return 0;
    return items.filter((i) => new Date(i.publishedAt).getTime() > lastVisit).length;
  }, [items, lastVisit, mounted]);

  // Keyboard navigation. Ignored while the reader is typing in the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        setCursor((c) => {
          const next = e.key === "j" ? Math.min(c + 1, filtered.length - 1) : Math.max(c - 1, 0);
          rowRefs.current[next]?.scrollIntoView({ block: "center", behavior: "smooth" });
          rowRefs.current[next]?.focus({ preventScroll: true });
          return next;
        });
      } else if (e.key === "o" && cursor >= 0 && filtered[cursor]) {
        e.preventDefault();
        window.open(`${base}/${filtered[cursor].id}`, "_self");
      } else if (e.key === "s" && cursor >= 0 && filtered[cursor]) {
        e.preventDefault();
        toggleSaved(filtered[cursor].id);
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("stream-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, filtered, toggleSaved, base]);

  let currentBucket = "";

  return (
    <section dir={isAr ? "rtl" : "ltr"}>
      {/* Controls */}
      <div className="mb-5 border-b-2 border-ink pb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-baseline gap-2.5 text-xl font-bold">
            {isAr ? "الشريط" : "The wire"}
            {mounted && freshCount > 0 && (
              <span className="rounded-full bg-teal px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-paper">
                {isAr ? `${freshCount} جديد` : `${freshCount} new`}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-2">
            <label htmlFor="stream-search" className="sr-only">
              {isAr ? "بحث" : "Search headlines"}
            </label>
            <input
              id="stream-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(-1);
              }}
              placeholder={isAr ? "بحث…  /" : "Search…  /"}
              className="h-9 w-44 rounded border-2 border-inkBorder bg-white px-2.5 text-sm outline-none transition focus:ring-2 focus:ring-accent sm:w-56"
            />
            <button
              type="button"
              onClick={() => setDensity((d) => (d === "compact" ? "comfortable" : "compact"))}
              aria-pressed={density === "compact"}
              title={isAr ? "كثافة العرض" : "Toggle density"}
              className="h-9 rounded border-2 border-inkBorder bg-white px-2.5 font-mono text-[11px] font-bold uppercase transition hover:bg-paper"
            >
              {density === "compact" ? (isAr ? "مريح" : "Roomy") : isAr ? "مضغوط" : "Dense"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSource("all")}
            className={`rounded-full border-2 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition ${
              source === "all" ? "border-inkBorder bg-ink text-paper" : "border-gray-300 bg-white hover:border-inkBorder"
            }`}
          >
            {isAr ? "الكل" : "All"}
          </button>
          {sources.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSource(s);
                setCursor(-1);
              }}
              className={`rounded-full border-2 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition ${
                source === s ? "border-inkBorder bg-ink text-paper" : "border-gray-300 bg-white hover:border-inkBorder"
              }`}
            >
              {s}
            </button>
          ))}
          {mounted && saved.size > 0 && (
            <button
              type="button"
              onClick={() => setOnlySaved((v) => !v)}
              aria-pressed={onlySaved}
              className={`rounded-full border-2 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition ${
                onlySaved ? "border-inkBorder bg-accent text-ink" : "border-gray-300 bg-white hover:border-inkBorder"
              }`}
            >
              ★ {isAr ? `محفوظ ${saved.size}` : `Saved ${saved.size}`}
            </button>
          )}
        </div>
      </div>

      {/* Stream */}
      {filtered.length === 0 ? (
        <p className="rounded border-2 border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          {onlySaved
            ? isAr
              ? "لا توجد عناصر محفوظة."
              : "Nothing saved yet — press s on a headline to keep it."
            : isAr
              ? "لا نتائج مطابقة."
              : "No headlines match that."}
        </p>
      ) : (
        <ol className="divide-y-2 divide-dashed divide-gray-200 border-t-2 border-dashed border-gray-200">
          {filtered.map((item, i) => {
            const bucket = dayBucket(item.publishedAt, now, lang);
            const showBucket = bucket !== currentBucket;
            if (showBucket) currentBucket = bucket;
            const isNew = mounted && lastVisit != null && new Date(item.publishedAt).getTime() > lastVisit;
            const isSaved = mounted && saved.has(item.id);

            return (
              <li key={item.id} className={showBucket ? "pt-1" : ""}>
                {showBucket && (
                  <h3 className="sticky top-0 z-10 -mx-1 bg-paper/95 px-1 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-dark backdrop-blur">
                    {bucket}
                  </h3>
                )}
                <div className={`flex items-start gap-3 ${density === "compact" ? "py-2" : "py-3.5"}`}>
                  <time
                    dateTime={item.publishedAt}
                    title={fmtAgo(item.publishedAt, now, lang)}
                    className="w-11 shrink-0 pt-0.5 font-mono text-[11px] font-bold tabular-nums text-gray-500"
                  >
                    {fmtClock(item.publishedAt)}
                  </time>

                  {/* The wire used to be a wall of grey text, which is a hard
                      thing to scan and a harder thing to want to come back to.
                      A 4:3 thumbnail per row gives the eye somewhere to land.
                      Hidden in compact mode: a reader who asked for density is
                      asking for headlines per screen, not pictures. */}
                  {density === "comfortable" && (
                    <Link
                      href={`${base}/${item.id}`}
                      tabIndex={-1}
                      aria-hidden
                      className="hidden shrink-0 overflow-hidden rounded border-2 border-inkBorder transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_rgba(20,20,20,0.16)] sm:block"
                    >
                      <Thumb
                        src={item.image}
                        alt=""
                        source={isAr ? item.sourceNameAr : item.sourceName}
                        section={item.section}
                        sizes="112px"
                        className="h-[84px] w-[112px]"
                      />
                    </Link>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      href={`${base}/${item.id}`}
                      onFocus={() => setCursor(i)}
                      className={`group block outline-none ${
                        cursor === i ? "ring-2 ring-accent ring-offset-2 ring-offset-paper" : ""
                      }`}
                    >
                      <span
                        className={`block font-semibold leading-snug transition group-hover:text-teal-dark group-hover:underline ${
                          density === "compact" ? "text-[14px]" : "text-[15px]"
                        }`}
                      >
                        {isNew && (
                          <span aria-label="New" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />
                        )}
                        {item.title}
                        <span aria-hidden className="ml-1 font-mono text-[11px] text-gray-400 group-hover:text-teal-dark">
                          →
                        </span>
                      </span>

                      {density === "comfortable" && item.summary && (
                        <span className="mt-1 block text-[13px] leading-relaxed text-gray-600">{item.summary}</span>
                      )}
                    </Link>

                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-gray-500">
                      <span className="font-bold text-ink">{isAr ? item.sourceNameAr : item.sourceName}</span>
                      <span aria-hidden>·</span>
                      <span>{fmtAgo(item.publishedAt, now, lang)}</span>
                      <button
                        type="button"
                        onClick={() => toggleSaved(item.id)}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? "Remove from saved" : "Save for later"}
                        className={`ml-auto rounded px-1.5 py-0.5 transition hover:bg-gray-100 ${
                          isSaved ? "text-accent-dark" : "text-gray-400"
                        }`}
                      >
                        {isSaved ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-5 font-mono text-[10px] leading-relaxed text-gray-500">
        {isAr
          ? "مرسى بوابة إخبارية. العناوين والصور تعود لناشريها، ويفتح النص الكامل في موقع المصدر. اختصارات: j / k للتنقل، o للفتح، s للحفظ."
          : "Marsa is a portal. Headlines, summaries and pictures belong to the publishers named; the full article opens on their site. Keys: j / k to move, o to open, s to save, / to search."}
      </p>
    </section>
  );
}
