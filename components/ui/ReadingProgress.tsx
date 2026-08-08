"use client";

import { useEffect, useState } from "react";

/**
 * Reading progress rail, pinned under the header on article pages.
 *
 * This is the cheapest real retention mechanic a publication has: a visible,
 * shrinking distance-to-finish measurably reduces mid-article abandonment,
 * because the reader can see that "a bit more" is genuinely a bit more. It
 * costs one element and no layout shift.
 *
 * It measures the article element specifically rather than the whole document,
 * so the footer and the related-stories block do not count toward "finished" —
 * hitting 100% should mean the reader finished the piece, not that they scrolled
 * past the ad slot.
 */
export function ReadingProgress({ targetId = "article-body" }: { targetId?: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Distance scrolled into the element, over the distance it can scroll.
      const total = Math.max(1, rect.height - viewport);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setPct(Math.round((scrolled / total) * 100));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      className="sticky top-0 z-40 h-1 w-full bg-ink/10"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
