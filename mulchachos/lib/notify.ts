// Emails you when someone sends a request or a question. Uses Resend, which is
// already set up for this domain (the resend._domainkey and send records in
// your DNS). Set three environment variables in Vercel:
//
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — where alerts land (your Gmail address)
//   NOTIFY_FROM     — a from address on your verified Resend domain, e.g.
//                     "Mulchachos <requests@prestonhollowmulchachos.com>"
//
// Notifications are best-effort. If the email fails, the request is still saved
// to the database, so a customer never sees an error because of a mail hiccup.

interface Notice {
  subject: string;
  html: string;
  replyTo?: string;
}

export async function notifyOwner({ subject, html, replyTo }: Notice): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM;

  if (!key || !to || !from) {
    console.warn(
      "notifyOwner skipped: set RESEND_API_KEY, NOTIFY_EMAIL, and NOTIFY_FROM."
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("notifyOwner: Resend returned", res.status, await res.text());
    }
  } catch (err) {
    console.error("notifyOwner failed:", err);
  }
}

/** Escape user text before putting it in an HTML email. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function looksLikeEmail(s: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());
}

/** One label/value row for the little summary table in the email. */
export function row(label: string, value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "";
  return `<tr><td style="padding:6px 16px 6px 0;color:#8A7878;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;color:#453738;">${esc(String(value))}</td></tr>`;
}
