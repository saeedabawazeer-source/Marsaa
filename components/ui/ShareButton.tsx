"use client";

import { useEffect, useRef, useState } from "react";
import { ShareIcon, WhatsAppIcon, XIcon, LinkIcon, CheckIcon } from "@/components/brand/icons";

/**
 * Sharing, built for how this audience actually shares.
 *
 * In the Gulf a story travels by being forwarded into a family or work WhatsApp
 * group, not by being tweeted. So WhatsApp is a first-class target rather than
 * one entry in a generic row, and the payload is written to look right in a
 * chat bubble: headline, then attribution, then the link on its own line. A
 * bare URL forwarded with no context is the thing people scroll past.
 *
 * On phones the native sheet comes first — it reaches the apps the reader
 * actually has, including ones this menu would never think to list, and it is
 * the interaction they already know. The explicit menu is the desktop path and
 * the fallback when `navigator.share` is absent.
 *
 * The link carries a UTM so shared traffic is distinguishable in analytics from
 * search and direct. That matters for ad reporting; it is not tracking the
 * reader.
 */

export interface ShareCopy {
  share: string;
  whatsapp: string;
  x: string;
  copy: string;
  copied: string;
  close: string;
}

const EN: ShareCopy = {
  share: "Share",
  whatsapp: "WhatsApp",
  x: "X",
  copy: "Copy link",
  copied: "Copied",
  close: "Close",
};

const AR: ShareCopy = {
  share: "مشاركة",
  whatsapp: "واتساب",
  x: "إكس",
  copy: "نسخ الرابط",
  copied: "تم النسخ",
  close: "إغلاق",
};

function withSource(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "share");
    u.searchParams.set("utm_medium", "social");
    return u.toString();
  } catch {
    return url;
  }
}

export function ShareButton({
  url,
  title,
  sourceName,
  lang = "en",
  variant = "icon",
  className = "",
}: {
  url: string;
  title: string;
  sourceName?: string;
  lang?: "en" | "ar";
  variant?: "icon" | "full";
  className?: string;
}) {
  const t = lang === "ar" ? AR : EN;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absolute, setAbsolute] = useState(url);
  const wrapRef = useRef<HTMLDivElement>(null);

  // The canonical URL is only known in the browser for relative hrefs, and
  // sharing a relative path produces a dead link in a chat.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setAbsolute(new URL(url, window.location.origin).toString());
    } catch {
      setAbsolute(url);
    }
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareUrl = withSource(absolute);
  const credit = sourceName ? (lang === "ar" ? `— ${sourceName}` : `— ${sourceName}`) : "";
  const message = `${title}\n${credit}\n\n${shareUrl}`.replace(/\n{3,}/g, "\n\n");

  async function onPrimary(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      } catch {
        // A cancelled sheet is not an error; fall through to the menu only if
        // the sheet never opened.
        return;
      }
    }
    setOpen((v) => !v);
  }

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the menu links still work */
    }
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={wrapRef} className={`relative ${className}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={onPrimary}
        aria-label={t.share}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "full"
            ? "inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-inkBorder bg-white px-3 font-mono text-[11px] font-bold transition hover:-translate-y-px active:translate-y-0"
            : "inline-grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/90 text-gray-600 backdrop-blur transition hover:border-inkBorder hover:text-ink"
        }
      >
        <ShareIcon size={variant === "full" ? 14 : 15} />
        {variant === "full" && t.share}
      </button>

      {open && (
        <div
          role="menu"
          onClick={stop}
          className="absolute bottom-full z-30 mb-2 w-44 overflow-hidden rounded-lg border-2 border-inkBorder bg-white shadow-[0_4px_0_0_rgba(26,26,26,0.9)] ltr:right-0 rtl:left-0"
        >
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold transition hover:bg-[#25D366]/12"
          >
            <span className="text-[#25D366]">
              <WhatsAppIcon size={16} />
            </span>
            {t.whatsapp}
          </a>
          <a
            role="menuitem"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 border-t border-gray-200 px-3 py-2.5 text-[13px] font-semibold transition hover:bg-gray-100"
          >
            <XIcon size={14} />
            {t.x}
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2.5 border-t border-gray-200 px-3 py-2.5 text-start text-[13px] font-semibold transition hover:bg-gray-100"
          >
            {copied ? <CheckIcon size={15} /> : <LinkIcon size={15} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>
      )}
    </div>
  );
}
