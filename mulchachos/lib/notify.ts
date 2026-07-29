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

interface Send {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/** Core Resend call. Best-effort: never throws into the caller. */
async function sendResend({ to, subject, html, replyTo }: Send): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;

  if (!key || !from) {
    console.warn("email skipped: set RESEND_API_KEY and NOTIFY_FROM.");
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
      console.error("Resend returned", res.status, await res.text());
    }
  } catch (err) {
    console.error("email failed:", err);
  }
}

interface Notice {
  subject: string;
  html: string;
  replyTo?: string;
}

/** Email you (the owner) at NOTIFY_EMAIL. */
export async function notifyOwner({ subject, html, replyTo }: Notice): Promise<void> {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    console.warn("notifyOwner skipped: set NOTIFY_EMAIL.");
    return;
  }
  await sendResend({ to, subject, html, replyTo });
}

/**
 * Send the customer a friendly confirmation that their request came through,
 * with the estimate they saw. Replies route back to your Gmail.
 */
export async function confirmToCustomer(opts: {
  to: string;
  name: string;
  estimateLine?: string | null;
}): Promise<void> {
  const first = opts.name.trim().split(/\s+/)[0] || "there";
  const owner = process.env.NOTIFY_EMAIL;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;color:#453738;">
      <p style="font-size:16px;">Hi ${esc(first)},</p>
      <p style="font-size:16px;line-height:1.5;">
        Thanks for reaching out to Preston Hollow Mulchachos. We have your request
        and we'll call or text shortly to confirm the material and pick a delivery
        morning. Nothing is booked or charged yet.
      </p>
      ${
        opts.estimateLine
          ? `<p style="font-size:16px;background:#EDE4D8;border-radius:8px;padding:12px 16px;">
               <strong>Your estimate:</strong> ${esc(opts.estimateLine)}<br/>
               <span style="color:#6F5D5E;font-size:14px;">We bill for the volume actually spread.</span>
             </p>`
          : ""
      }
      <p style="font-size:16px;line-height:1.5;">
        Questions in the meantime? Just reply to this email or call
        <a href="tel:214-708-7503" style="color:#B7655D;">214-708-7503</a>.
      </p>
      <p style="font-size:16px;">— Preston Hollow Mulchachos</p>
    </div>`;

  await sendResend({
    to: opts.to,
    subject: "We got your request — Preston Hollow Mulchachos",
    html,
    replyTo: owner || undefined,
  });
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
