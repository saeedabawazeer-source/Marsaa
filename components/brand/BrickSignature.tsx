"use client";

import { useEffect, useRef } from "react";

/**
 * The locked SAEED brick/voxel signature — see docs/brand.md §3.6 and docs/logo-and-submark.md §4.2.
 * This is a personal identity mark, not a brand element: it always spells SAEED and always uses
 * Port's exact color mapping below. Do NOT wire this to the project's own teal/accent tokens.
 */
const FONT: Record<string, string[]> = {
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
};

// Locked palette — Port's exact letter-to-color mapping. Never derive these from the project's tokens.
const FACES: Record<string, [string, string, string]> = {
  paper: ["#F6EFE3", "#FFFDF6", "#D8CFBE"],
  teal: ["#0B7A75", "#17A099", "#07514D"],
  orange: ["#FF6B35", "#FF8B5E", "#D14E1F"],
};

const WORD = "SAEED";
const LETTER_COLOR: Record<number, keyof typeof FACES> = { 0: "paper", 1: "teal", 2: "paper", 3: "paper", 4: "orange" };

function brick(w: number, fc: [string, string, string]) {
  const S = 26, D = 7;
  let studs = "";
  for (let i = 0; i < w; i++) {
    const cx = i * S + S / 2 + D / 2;
    studs += `<ellipse cx="${cx}" cy="${-D / 2}" rx="4" ry="2.2" fill="${fc[1]}"/>`;
  }
  const W1 = w * S;
  return (
    `<g stroke="#131110" stroke-width="1.2" stroke-linejoin="round">` +
    `<polygon points="0,0 ${D},-${D} ${W1 + D},-${D} ${W1},0" fill="${fc[1]}"/>` +
    `<polygon points="${W1},0 ${W1 + D},-${D} ${W1 + D},${26 - D} ${W1},${26}" fill="${fc[2]}"/>` +
    `<rect width="${W1}" height="26" fill="${fc[0]}"/>${studs}</g>`
  );
}

export function BrickSignature() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const S = 26, y0 = 4;
    const all: { tx: number; ty: number; w: number; cl: keyof typeof FACES }[] = [];

    for (let r = 0; r < 7; r++) {
      for (let li = 0; li < WORD.length; li++) {
        const row = FONT[WORD[li]][r];
        let ci = 0;
        while (ci < 5) {
          if (row[ci] !== "1") { ci++; continue; }
          let run = 0;
          while (ci + run < 5 && row[ci + run] === "1") run++;
          all.push({ tx: (li * 6 + ci) * S, ty: y0 + r * S, w: run, cl: LETTER_COLOR[li] });
          ci += run;
        }
      }
    }
    all.sort((a, b) => b.ty - a.ty || a.tx - b.tx);
    const W = WORD.length * 6 * S;
    const H = y0 + 8 * S;

    el.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" style="width:min(130px,42%);overflow:visible" role="img" aria-label="Saeed, built brick by brick">` +
      all.map((b) => `<g class="vox" data-x="${b.tx}" data-cy="${b.ty}">${brick(b.w, FACES[b.cl])}</g>`).join("") +
      `</svg>`;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let cancelled = false;
    import("gsap").then(({ gsap }) => {
      if (cancelled || !el) return;
      const blocks = Array.from(el.querySelectorAll<SVGGElement>(".vox"));
      gsap.set(blocks, {
        opacity: 0,
        x: (_i, target) => parseFloat((target as SVGGElement).dataset.x || "0"),
        y: () => -(80 + Math.random() * 60),
      });
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          const tl = gsap.timeline();
          blocks.forEach((b, i) => {
            tl.to(b, { y: parseFloat(b.dataset.cy || "0"), opacity: 1, duration: 0.5, ease: "bounce.out" }, i * 0.015);
          });
          observer.disconnect();
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={ref} className="flex justify-center" aria-hidden="true" />;
}
