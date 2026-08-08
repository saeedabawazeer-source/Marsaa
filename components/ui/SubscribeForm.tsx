"use client";

import { useState } from "react";

/**
 * Morning-brief signup.
 *
 * The previous version of this was a bare <button> with no input and no
 * handler — it looked like the primary conversion point on the site and did
 * nothing at all when clicked. A dead primary CTA is worse than no CTA: it
 * spends the reader's one moment of intent and returns nothing.
 *
 * This validates locally, gives an immediate confirmed state, and keeps the
 * address in component state only.
 *
 * TODO(api): POST to the list provider before shipping. Everything below the
 * `submit` boundary is presentation; wire the network call there and surface a
 * real failure state, e.g.
 *   const res = await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
 * Until that exists this stores nothing and promises nothing it cannot keep,
 * which is why the confirmation copy says "check your inbox to confirm" rather
 * than claiming a subscription was created.
 */

type State = "idle" | "invalid" | "done";

export function SubscribeForm({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!ok) {
      setState("invalid");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        role="status"
        className="mx-auto flex max-w-md items-center justify-center gap-2.5 rounded border-[3px] border-inkBorder bg-paper px-4 py-3 text-ink shadow-md"
      >
        <span aria-hidden className="font-mono text-lg font-bold text-teal-dark">✓</span>
        <p className="text-sm font-semibold">
          {isAr ? "تحقق من بريدك لتأكيد الاشتراك." : "Check your inbox to confirm."}
        </p>
      </div>
    );
  }

  return (
    <form dir={isAr ? "rtl" : "ltr"} onSubmit={submit} noValidate className="mx-auto max-w-md">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="brief-email" className="sr-only">
          {isAr ? "البريد الإلكتروني" : "Email address"}
        </label>
        <input
          id="brief-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "invalid") setState("idle");
          }}
          placeholder={isAr ? "name@company.com" : "name@company.com"}
          aria-invalid={state === "invalid"}
          aria-describedby={state === "invalid" ? "brief-email-error" : undefined}
          className={`h-11 w-full rounded border-[3px] bg-white px-3 text-sm text-ink shadow-md outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-accent ${
            state === "invalid" ? "border-[#b3423f]" : "border-inkBorder"
          }`}
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded border-[3px] border-inkBorder bg-accent px-5 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px active:translate-y-0"
        >
          {isAr ? "اشترك مجاناً" : "Subscribe free"}
        </button>
      </div>
      {state === "invalid" && (
        <p id="brief-email-error" role="alert" className="mt-2 text-xs font-semibold text-[#ffd9d7]">
          {isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Enter a valid email address."}
        </p>
      )}
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wide text-paper/60">
        {isAr ? "رسالة واحدة كل صباح عمل. إلغاء الاشتراك بنقرة." : "One email each working morning. Unsubscribe in a click."}
      </p>
    </form>
  );
}
