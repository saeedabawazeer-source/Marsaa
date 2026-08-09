"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/brand/icons";

/**
 * Morning-brief signup.
 *
 * The first version of this component was a bare <button> that did nothing. The
 * second validated the address and then painted a green "Check your inbox to
 * confirm" without ever making a network call — the address was discarded and
 * no confirmation was coming. That is a worse failure than the dead button,
 * because it lies to the reader about what happened to their data.
 *
 * This version posts to /api/subscribe and reports what actually occurred. When
 * no list provider is configured the route answers 503 and the reader is told
 * signups are not open yet, which is true, instead of being thanked for a
 * subscription that does not exist.
 */

type State = "idle" | "invalid" | "sending" | "done" | "unavailable" | "error";

export function SubscribeForm({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("invalid");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) setState("done");
      else if (res.status === 503) setState("unavailable");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        role="status"
        className="mx-auto flex max-w-md items-center justify-center gap-2.5 rounded border-[3px] border-inkBorder bg-paper px-4 py-3 text-ink shadow-md"
      >
        <span aria-hidden className="text-teal-dark"><CheckIcon size={18} /></span>
        <p className="text-sm font-semibold">
          {isAr ? "تم التسجيل. تحقق من بريدك للتأكيد." : "You're on the list. Check your inbox to confirm."}
        </p>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        role="status"
        className="mx-auto max-w-md rounded border-[3px] border-inkBorder bg-paper px-4 py-3 text-ink shadow-md"
      >
        <p className="text-sm font-semibold">
          {isAr ? "التسجيل لم يُفتح بعد." : "Signups aren't open yet."}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          {isAr
            ? "لم يتم حفظ بريدك. الصحيفة لم تطلق النشرة بعد."
            : "Your address was not saved — the brief hasn't launched yet."}
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
            if (state !== "sending") setState("idle");
          }}
          placeholder="name@company.com"
          aria-invalid={state === "invalid"}
          aria-describedby={state === "invalid" || state === "error" ? "brief-email-error" : undefined}
          className={`h-11 w-full rounded border-[3px] bg-white px-3 text-sm text-ink shadow-md outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-accent ${
            state === "invalid" || state === "error" ? "border-[#b3423f]" : "border-inkBorder"
          }`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-11 shrink-0 rounded border-[3px] border-inkBorder bg-accent px-5 text-sm font-bold text-ink shadow-md transition hover:-translate-y-px active:translate-y-0 disabled:opacity-70"
        >
          {state === "sending" ? (isAr ? "جارٍ..." : "Sending…") : isAr ? "اشترك مجاناً" : "Subscribe free"}
        </button>
      </div>

      {(state === "invalid" || state === "error") && (
        <p id="brief-email-error" role="alert" className="mt-2 text-xs font-semibold text-[#ffd9d7]">
          {state === "invalid"
            ? isAr
              ? "يرجى إدخال بريد إلكتروني صحيح."
              : "Enter a valid email address."
            : isAr
              ? "تعذر إتمام الطلب. حاول مرة أخرى."
              : "Something went wrong. Try again."}
        </p>
      )}

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wide text-paper/60">
        {isAr ? "رسالة واحدة كل صباح عمل. إلغاء الاشتراك بنقرة." : "One email each working morning. Unsubscribe in a click."}
      </p>
    </form>
  );
}
