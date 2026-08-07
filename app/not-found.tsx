import Link from "next/link";

// Root-level not-found — required by Next.js for truly unmatched routes
// (route-group not-found.tsx files only cover notFound() calls inside pages
// within that group). Kept minimal since it renders outside app/(main)/layout.tsx,
// so it can't assume Nav/Footer are present.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded border-4 border-inkBorder bg-teal font-bold text-2xl text-accent-light shadow-dramatic-accent">
          M
        </div>
        <h1 className="mb-2 text-2xl font-bold">This story sailed off.</h1>
        <p className="mb-6 text-gray-600">The page you&apos;re looking for doesn&apos;t exist, or has moved.</p>
        <Link href="/" className="rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold shadow-md">
          Back to Marsa
        </Link>
      </body>
    </html>
  );
}
