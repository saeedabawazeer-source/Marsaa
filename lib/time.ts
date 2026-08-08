/**
 * Time formatting for a Jeddah newsroom.
 *
 * Every timestamp on the site is rendered in Asia/Riyadh (AST, UTC+3) — the
 * timezone the newsroom actually publishes in — rather than the visitor's
 * local time or the server's UTC. A business-news reader in Jeddah, Dubai, or
 * London all need to see the same "when did this print" moment, and for a
 * market publication that moment is exchange-local.
 *
 * Absolute times are used everywhere rather than pre-rendered relative times
 * ("2h ago"). Relative strings baked at build time silently go stale the
 * moment the build finishes — the single most common way a static news site
 * ends up lying about its own freshness. Where relative time genuinely helps
 * (the wire), it is computed at render time and the page carries a short
 * revalidate window so it stays honest.
 */

const TZ = "Asia/Riyadh";

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const out: Record<string, string> = {};
  for (const p of f.formatToParts(d)) if (p.type !== "literal") out[p.type] = p.value;
  return {
    day: out.day,
    monthIndex: Number(out.month) - 1,
    year: out.year,
    hour: out.hour === "24" ? "00" : out.hour,
    minute: out.minute,
  };
}

/** "09:12" — exchange-local clock time, for wire items and today's stories. */
export function fmtClock(iso: string | Date): string {
  const p = parts(iso);
  return `${p.hour}:${p.minute}`;
}

/** "07 Aug" / "07 أغسطس" — for anything not published today. */
export function fmtDay(iso: string | Date, lang: "en" | "ar" = "en"): string {
  const p = parts(iso);
  const month = lang === "ar" ? AR_MONTHS[p.monthIndex] : EN_MONTHS[p.monthIndex];
  return `${p.day} ${month}`;
}

/** "07 Aug 2026, 09:12 AST" — the full dateline on an article page. */
export function fmtDateline(iso: string | Date, lang: "en" | "ar" = "en"): string {
  const p = parts(iso);
  const month = lang === "ar" ? AR_MONTHS[p.monthIndex] : EN_MONTHS[p.monthIndex];
  const suffix = lang === "ar" ? "بتوقيت السعودية" : "AST";
  return `${p.day} ${month} ${p.year}, ${p.hour}:${p.minute} ${suffix}`;
}

function sameDay(a: string | Date, b: string | Date): boolean {
  const x = parts(a);
  const y = parts(b);
  return x.day === y.day && x.monthIndex === y.monthIndex && x.year === y.year;
}

/**
 * Clock time if it ran today, otherwise the date. This is the convention every
 * serious wire uses, and it is why a reader can tell at a glance whether a
 * front page is live or last week's — the thing Marsa was previously hiding by
 * printing bare ISO dates with no time at all.
 */
export function fmtStamp(iso: string | Date, now: string | Date, lang: "en" | "ar" = "en"): string {
  return sameDay(iso, now) ? fmtClock(iso) : fmtDay(iso, lang);
}

/** "12 min ago" — only ever used where it is recomputed on render. */
export function fmtAgo(iso: string | Date, now: string | Date, lang: "en" | "ar" = "en"): string {
  const mins = Math.max(0, Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 60000));
  if (lang === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} د`;
    const h = Math.round(mins / 60);
    if (h < 24) return `قبل ${h} س`;
    return `قبل ${Math.round(h / 24)} ي`;
  }
  if (mins < 1) return "now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** True if the story ran within the last 24h — drives the "NEW" flag. */
export function isFresh(iso: string | Date, now: string | Date): boolean {
  return new Date(now).getTime() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;
}
