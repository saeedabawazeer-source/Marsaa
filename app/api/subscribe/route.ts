import { NextResponse } from "next/server";

/**
 * Morning-brief signup endpoint.
 *
 * This exists because the previous signup form was worse than no form: it
 * validated the address client-side, removed itself from the DOM, and painted
 * "Check your inbox to confirm" without making a single network request. The
 * address went nowhere and no inbox was ever going to receive anything. A
 * product telling a user a false thing about their own data is a ship-blocker
 * regardless of how good the rest of it looks.
 *
 * The honest design: this route only claims success when a list provider is
 * actually configured. Set MARSA_SUBSCRIBE_WEBHOOK to the provider's intake URL
 * (Buttondown, Mailchimp, Resend Audiences, a Zapier catch hook — anything that
 * accepts a JSON POST) and signups start working with no other change. Leave it
 * unset and the endpoint returns 503, which the form surfaces to the reader as
 * "signups aren't open yet" rather than pretending.
 */

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const endpoint = process.env.MARSA_SUBSCRIBE_WEBHOOK;
  if (!endpoint) {
    // Nothing is configured, so nothing was stored. Say so.
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.MARSA_SUBSCRIBE_TOKEN
          ? { authorization: `Bearer ${process.env.MARSA_SUBSCRIBE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ email: email.trim(), source: "marsa-web", list: "morning-brief" }),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "provider_unreachable" }, { status: 502 });
  }
}
