import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing your use of Marsa.",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">Terms of Use</h1>
      <p className="mb-8 font-mono text-xs text-gray-500">Last updated: August 2026</p>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-800">
        <p>By using Marsa, you agree to the following terms.</p>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Content</h2>
          <p>
            Marsa publishes news and commentary on MENA business, markets, and trade. Articles reflect reporting and
            analysis at the time of publication and are not investment, legal, or financial advice. Verify any
            figures or decisions against primary sources before acting on them.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Use of the site</h2>
          <p>
            You may read, share, and link to Marsa articles for personal and editorial use. Reproducing full articles
            elsewhere without permission, or using the site for scraping/automated bulk collection, is not permitted.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">No warranty</h2>
          <p>
            The site is provided &quot;as is&quot;. We work to keep coverage accurate and corrections prompt, but we
            do not guarantee the site will be error-free or uninterrupted.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Changes</h2>
          <p>We may update these terms as the product evolves; material changes will be reflected on this page.</p>
        </div>

        <p className="text-sm text-gray-500">
          Questions about these terms can be sent via the{" "}
          <a href="/contact" className="underline hover:text-accent-light">Contact</a> page.
        </p>
      </div>
    </section>
  );
}
