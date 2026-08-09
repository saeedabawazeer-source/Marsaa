import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Marsa team.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-4 text-2xl font-bold">Contact</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] leading-relaxed text-gray-700">
        Story tips, corrections, advertising, or anything else — reach the Marsa desk directly.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">Newsroom</div>
          <a href="mailto:news@marsa.example" className="text-sm font-medium hover:text-accent-light">
            news@marsa.example
          </a>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">Corrections</div>
          <a href="mailto:corrections@marsa.example" className="text-sm font-medium hover:text-accent-light">
            corrections@marsa.example
          </a>
        </div>
        <div className="rounded border-[3px] border-inkBorder bg-paper p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-wide text-teal-dark">Advertising</div>
          <a href="/advertise" className="text-sm font-medium hover:text-accent-light">
            See advertise page
          </a>
        </div>
      </div>

      <p className="mt-8 font-mono text-xs text-gray-500">Marsa · Jeddah, Saudi Arabia</p>
    </section>
  );
}
