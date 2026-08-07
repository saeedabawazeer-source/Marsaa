import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center px-6 py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded border-4 border-inkBorder bg-teal font-display text-2xl font-bold text-accent-light shadow-dramatic-accent">
        M
      </div>
      <h1 className="mb-2 text-2xl font-bold">This story sailed off.</h1>
      <p className="mb-6 text-gray-600">The page you&apos;re looking for doesn&apos;t exist, or has moved.</p>
      <Link href="/" className="rounded border-[3px] border-inkBorder bg-accent px-4 py-2 text-sm font-bold shadow-md">
        Back to Marsa
      </Link>
    </div>
  );
}
