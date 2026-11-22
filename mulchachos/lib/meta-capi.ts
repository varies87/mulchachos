import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "./pixel";

// Meta Conversions API: reports the same Lead the browser pixel does, but from
// our server, so ad blockers and iOS tracking limits can't drop it. Meta
// matches the two by event_id and counts the lead once.
//
// Needs META_CAPI_TOKEN in Vercel's environment variables (Events Manager →
// your pixel → Settings → Conversions API → Generate access token). Without
// it, nothing is sent and the request goes through as normal.

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Meta's normalisation rules, then SHA-256. Empty in, nothing out. */
function hashed(v: string | null | undefined, kind: "email" | "phone" | "name" | "zip") {
  if (!v) return undefined;
  let n = v.trim().toLowerCase();
  if (kind === "phone") {
    n = n.replace(/\D/g, "");
    if (n.length === 10) n = "1" + n; // US numbers need the country code
  }
  if (kind === "name") n = n.replace(/[^\p{L}]/gu, "");
  if (kind === "zip") n = n.replace(/\s/g, "").slice(0, 5);
  return n ? [sha256(n)] : undefined;
}

export async function sendLeadToMeta(opts: {
  eventId: string;
  sourceUrl: string;
  name: string;
  email: string;
  phone: string;
  zip: string;
  category: string | null;
  ip: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
}): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return;

  const [first, ...rest] = opts.name.trim().split(/\s+/);
  const user_data: Record<string, unknown> = {
    em: hashed(opts.email, "email"),
    ph: hashed(opts.phone, "phone"),
    fn: hashed(first, "name"),
    ln: hashed(rest.join(" "), "name"),
    zp: hashed(opts.zip, "zip"),
    st: [sha256("tx")],
    country: [sha256("us")],
    client_ip_address: opts.ip ?? undefined,
    client_user_agent: opts.userAgent ?? undefined,
    fbp: opts.fbp ?? undefined,
    fbc: opts.fbc ?? undefined,
  };

  const body: Record<string, unknown> = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: "website",
      event_source_url: opts.sourceUrl,
      user_data,
      custom_data: opts.category ? { content_category: opts.category } : undefined,
    }],
  };
  // Set META_CAPI_TEST_CODE to a Test Events code to see events in Events
  // Manager → Test Events. Remove it once they show up.
  if (process.env.META_CAPI_TEST_CODE) body.test_event_code = process.env.META_CAPI_TEST_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) console.error("Meta CAPI lead failed:", res.status, await res.text());
  } catch (err) {
    // Never let ad reporting fail a customer's request.
    console.error("Meta CAPI lead error:", err);
  }
}
