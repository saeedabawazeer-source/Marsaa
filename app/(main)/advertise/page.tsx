import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach MENA business decision-makers through Marsa.",
};

export default function AdvertisePage() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">Advertise on Marsa</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] leading-relaxed text-gray-700">
        Marsa covers the markets, energy, real estate, and startup deals moving the Gulf and wider MENA region. Our
        readers are founders, operators, investors, and executives tracking the region&apos;s business decisions.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">Display</div>
          <p className="text-sm text-gray-700">In-feed and sidebar placements across the homepage and article pages.</p>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">Sponsored coverage</div>
          <p className="text-sm text-gray-700">Clearly labeled sponsored content, reviewed for editorial standards.</p>
        </div>
      </div>

      <div className="rounded border-[3px] border-inkBorder bg-ink p-6 text-paper">
        <p className="mb-3 text-sm">
          Marsa is currently in build/pre-launch. Ad placements and rate cards aren&apos;t live yet — reach out and
          we&apos;ll follow up once inventory opens.
        </p>
        <a
          href="mailto:hello@marsa.example"
          className="inline-block rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold text-ink shadow-md"
        >
          Email the team
        </a>
      </div>
    </section>
  );
}
