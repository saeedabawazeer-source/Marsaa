import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Marsa collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">Privacy Policy</h1>
      <p className="mb-8 font-mono text-xs text-gray-500">Last updated: August 2026</p>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-800">
        <p>
          Marsa (&quot;we&quot;, &quot;us&quot;) publishes MENA business news from Jeddah, Saudi Arabia. This page
          explains, in plain terms, what data we collect when you use this site and what we do with it.
        </p>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">What we collect</h2>
          <p>
            Standard web analytics (pages viewed, approximate location by IP, device/browser type) and, if you
            subscribe to updates, the email address you provide. We do not sell personal data to third parties.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Cookies</h2>
          <p>
            We use essential cookies to run the site and, where enabled, analytics cookies to understand traffic.
            You can disable cookies in your browser at any time; the site will still function.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Advertising</h2>
          <p>
            If and when Marsa runs advertising, ad partners may use cookies or similar technology to serve relevant
            ads. See our <a href="/advertise" className="underline hover:text-accent-light">Advertise</a> page for
            details on our ad approach.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Your rights</h2>
          <p>
            You can request a copy of, or deletion of, any personal data we hold about you by contacting us — see{" "}
            <a href="/contact" className="underline hover:text-accent-light">Contact</a>.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          This is a general-purpose placeholder policy for a site in development. Before public launch, this page
          should be reviewed by counsel against Saudi Personal Data Protection Law (PDPL) requirements.
        </p>
      </div>
    </section>
  );
}
