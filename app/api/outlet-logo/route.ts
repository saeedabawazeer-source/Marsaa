import { LOGO_ALLOWLIST } from "@/lib/outlets";

/**
 * Publisher logo proxy.
 *
 * Serves a publisher's own favicon from Marsa's origin so that rendering a feed
 * does not make the reader's browser talk to thirty other companies. On a page
 * with forty cards that is forty third-party requests carrying the reader's IP
 * and referrer — a tracking surface Marsa would have to declare in its privacy
 * policy and could not switch off.
 *
 * SSRF: `domain` is matched against a fixed allowlist built from lib/outlets.ts
 * before any fetch happens. It is never used to build a URL until it has been
 * found in that set, so a caller cannot point this at an internal address, a
 * cloud metadata endpoint, or an arbitrary host. Redirects are followed by
 * fetch, so the response content-type is checked too — a redirect that lands on
 * HTML gets rejected rather than passed through.
 */

export const runtime = "nodejs";
export const revalidate = 604800; // a week; mastheads do not move often

const ICON_SOURCES = (domain: string) => [
  // Most publishers ship at least one of these. Ordered by likely quality.
  `https://${domain}/apple-touch-icon.png`,
  `https://${domain}/apple-touch-icon-precomposed.png`,
  `https://${domain}/favicon-96x96.png`,
  `https://${domain}/favicon-32x32.png`,
  `https://${domain}/favicon.png`,
  `https://${domain}/favicon.ico`,
];

const OK_TYPES = ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/jpeg", "image/webp", "image/svg+xml"];

async function tryFetch(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "MarsaPortal/1.0 (+https://marsa.news; masthead fetch)" },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!OK_TYPES.includes(type)) return null;

    const buf = await res.arrayBuffer();
    // A 0-byte or absurd response is a soft-404 dressed as an image.
    if (buf.byteLength < 70 || buf.byteLength > 400_000) return null;

    return new Response(buf, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=604800, s-maxage=604800, immutable",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get("domain")?.toLowerCase().trim() ?? "";

  // Allowlist check happens before the value is used to construct anything.
  if (!LOGO_ALLOWLIST.has(domain)) {
    return new Response(null, { status: 404, headers: { "cache-control": "public, max-age=86400" } });
  }

  for (const candidate of ICON_SOURCES(domain)) {
    const hit = await tryFetch(candidate);
    if (hit) return hit;
  }

  // No usable mark. The client renders its monogram tile instead.
  return new Response(null, { status: 404, headers: { "cache-control": "public, max-age=86400" } });
}
