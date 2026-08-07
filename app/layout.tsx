import type { Metadata } from "next";
import "./globals.css";

// Nav/Footer live in app/(main)/layout.tsx, not here — this root layout is
// shared by both the English site and /ar, and /ar needs its own RTL nav/footer
// instead of these English ones.

// Note: using a plain <link> tag for Google Fonts instead of next/font/google.
// next/font/google fetches font files at build time, which is unreliable in
// network-restricted/offline build environments. A <link> tag matches Port's
// original static approach and keeps the build fully offline-safe.

export const metadata: Metadata = {
  title: { default: "Marsa — MENA Business News from Jeddah", template: "%s | Marsa" },
  description: "Marsa covers MENA business, markets, energy, and trade from Jeddah — sharp daily coverage of the deals and decisions moving the region.",
  icons: { icon: "/favicon-32.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Marsa — MENA Business News from Jeddah",
    description: "MENA business, markets, and trade news, based in Jeddah.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              name: "Marsa",
              url: "https://marsa.example",
              description: "MENA business, markets, and trade news based in Jeddah, Saudi Arabia.",
              areaServed: "MENA",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
