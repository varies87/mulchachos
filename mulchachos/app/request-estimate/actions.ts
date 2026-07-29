"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { notifyOwner, confirmToCustomer, esc, looksLikeEmail, row } from "@/lib/notify";

/**
 * A request to be contacted about a job. Like inquiries, RLS allows the insert
 * and nothing else, so a visitor can send one but can never read anyone's.
 * On success we email you the details so they land in your inbox, not just the
 * admin panel. Photos are uploaded to storage from the browser first; we only
 * store the paths they returned.
 */
export async function submitEstimateRequest(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const num = (k: string) => {
    const n = Number(formData.get(k));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const name = s("name");
  const phone = s("phone");
  const email = s("email");
  const address = s("address");

  if (!name) return { error: "Please add your name." };
  if (!phone) return { error: "Add a phone number so we can reach you." };
  if (!email) return { error: "Add an email so we can send your quote." };
  if (!looksLikeEmail(email)) return { error: "That email does not look right." };
  if (!address) return { error: "Add the job address so we know where we are headed." };

  let photoPaths: string[] = [];
  try {
    const raw = s("photo_paths");
    if (raw) photoPaths = JSON.parse(raw);
  } catch {
    photoPaths = [];
  }
  // Trust the paths only if they land in the visitor's own upload prefix.
  photoPaths = photoPaths
    .filter((p) => typeof p === "string" && p.startsWith("requests/"))
    .slice(0, 12);

  const zip = s("zip");
  const materialName = s("material_name");
  const squareFeet = num("square_feet");
  const depthInches = num("depth_inches");
  const estimatedTotal = num("estimated_total");
  const preferredTime = s("preferred_time");
  const notes = s("notes");
  const weedFabric = s("weed_fabric") === "1";
  const limitedAccess = s("limited_access") === "1";
  const edging = s("edging") === "1";

  const sb = await supabaseServer();
  const { error } = await sb.from("estimate_requests").insert({
    name,
    phone,
    email: email || null,
    contact: email ? `${phone} / ${email}` : phone, // kept for older views
    address,
    zip: zip || null,
    material_slug: s("material_slug") || null,
    material_name: materialName || null,
    square_feet: squareFeet,
    depth_inches: depthInches,
    weed_fabric: weedFabric,
    limited_access: limitedAccess,
    edging: edging,
    estimated_total: estimatedTotal,
    quote_note: s("quote_note") || null,
    preferred_time: preferredTime || null,
    notes: notes || null,
    photo_paths: photoPaths,
  });

  if (error) return { error: "Something went wrong. Please call 214-708-7503 instead." };

  // Email it to you. Never let a mail failure fail the request itself.
  const extras = [
    weedFabric ? "weed fabric" : null,
    limitedAccess ? "limited access" : null,
    edging ? "edging" : null,
  ].filter(Boolean).join(", ");

  const usd = (n: number | null) =>
    n ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;">
      <h2 style="margin:0 0 4px;color:#453738;">New job request</h2>
      <p style="margin:0 0 16px;color:#8A7878;">From the estimator on your site.</p>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("Name", name)}
        ${row("Phone", phone)}
        ${row("Email", email || null)}
        ${row("Address", address)}
        ${row("ZIP", zip || null)}
        ${row("Material", materialName || null)}
        ${row("Area", squareFeet ? `${squareFeet.toLocaleString()} sq ft` : null)}
        ${row("Depth", depthInches ? `${depthInches}"` : null)}
        ${row("Add-ons", extras || null)}
        ${row("Their estimate", usd(estimatedTotal))}
        ${row("Timing", preferredTime || null)}
        ${row("Photos", photoPaths.length ? `${photoPaths.length} attached (view in admin)` : "none")}
        ${row("Notes", notes || null)}
      </table>
      <p style="margin:18px 0 0;">
        <a href="https://prestonhollowmulchachos.com/admin/requests" style="color:#B7655D;">Open it in the admin panel &rarr;</a>
      </p>
    </div>`;

  await notifyOwner({
    subject: `New job request from ${esc(name)}`,
    html,
    replyTo: email && looksLikeEmail(email) ? email : undefined,
  });

  // Confirmation to the customer, so they know it went through.
  if (email && looksLikeEmail(email)) {
    const estimateLine =
      materialName && estimatedTotal
        ? `${materialName}, about ${usd(estimatedTotal)}`
        : materialName || null;
    await confirmToCustomer({ to: email, name, estimateLine });
  }

  return { ok: true };
}
