import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Marsa"
      width={165}
      height={48}
      className={className}
      priority
    />
  );
}
