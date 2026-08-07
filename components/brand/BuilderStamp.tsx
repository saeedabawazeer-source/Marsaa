export function BuilderStamp() {
  return (
    <span className="inline-flex items-center gap-2 -rotate-2 rounded bg-black px-3.5 py-2 font-mono text-xs font-bold tracking-widest text-white shadow-dramatic-accent border-[3px] border-accent">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_theme(colors.accent.DEFAULT)]" />
      BUILDER
    </span>
  );
}
