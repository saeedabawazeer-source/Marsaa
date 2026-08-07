import Image from "next/image";

export function Submark({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/submark.svg"
      alt="Marsa"
      width={size}
      height={size}
      className={`rounded shadow-md ${className}`}
    />
  );
}
