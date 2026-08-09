import type { Metadata } from "next";
import "./globals.css";
import { SITE, SITE_URL, absolute } from "@/lib/site";

// Nav/Footer live in app/(main)/layout.tsx, not here — this root layout is
// shared by both the English site and /ar, and /ar needs its own RTL nav/footer
// instead of these English ones.

// Note: using a plain <link> tag for Google Fonts instead of next/font/google.
// next/font/google fetches font files at build time, which is unreliable in
// network-restricted/offline build environments. A <link> tag matches the
// original static approach and keeps the build fully offline-safe.

/**
 * `metadataBase` is what turns every relative OG image and canonical path in
 * the app into an absolute URL. Without it Next emits relative Open Graph URLs,
 * which WhatsApp, X and Slack all refuse to resolve — the reason a shared link
 * previews as a bare grey box. Given that shareability is the point, this one
 * line is load-bearing.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Gulf business news", "Saudi business news", "Tadawul", "TASI", "MENA markets",
    "Saudi energy news", "Jeddah", "أخبار الأعمال", "السوق السعودي", "تداول",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
    languages: { en: "/", ar: "/ar" },
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${SITE.name} — English` },
        { url: "/feed.xml?lang=ar", title: `${SITE.nameAr} — العربية` },
      ],
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/submark.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE_URL,
    locale: SITE.locale,
    alternateLocale: [SITE.localeAr],
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /**
   * Structured data.
   *
   * Declared as an @graph so the organisation, the site and its search action
   * are one connected description rather than three unrelated blobs — which is
   * what lets Google and the AI crawlers resolve "Marsa" to a publisher rather
   * than a string. The previous version claimed `url: https://marsa.example`,
   * a reserved documentation domain that resolves nowhere, so every crawler
   * that read it was handed an identifier it could not verify.
   *
   * `NewsMediaOrganization` is the honest type. Marsa aggregates rather than
   * reports, and that is stated in `description` rather than implied away.
   */
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": absolute("/#organization"),
        name: SITE.name,
        alternateName: SITE.nameAr,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absolute("/icon-512.png"),
          width: 512,
          height: 512,
        },
        description: SITE.description,
        foundingLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: SITE.city,
            addressCountry: SITE.country,
          },
        },
        areaServed: [
          { "@type": "Place", name: "Saudi Arabia" },
          { "@type": "Place", name: "Gulf Cooperation Council" },
          { "@type": "Place", name: "Middle East and North Africa" },
        ],
        knowsLanguage: ["en", "ar"],
      },
      {
        "@type": "WebSite",
        "@id": absolute("/#website"),
        url: SITE_URL,
        name: SITE.name,
        alternateName: SITE.nameAr,
        description: SITE.description,
        publisher: { "@id": absolute("/#organization") },
        inLanguage: ["en", "ar"],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" hrefLang="en" href={absolute("/")} />
        <link rel="alternate" hrefLang="ar" href={absolute("/ar")} />
        <link rel="alternate" hrefLang="x-default" href={absolute("/")} />
      </head>
      <body className="font-display">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
        {children}
      </body>
    </html>
  );
}
