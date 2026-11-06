"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { notifyOwner, confirmToCustomer, esc, looksLikeEmail, row } from "@/lib/notify";
import {
  getActiveMaterials,
  getDiscountTiers,
  getFabricTiers,
  getPricingSettings,
  type Material,
} from "@/lib/materials";
import { buildQuote, volumeLabel, type Quote } from "@/lib/pricing";
import { decodeQuote } from "@/lib/quote-link";

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

  if (error) {
    // Shows up in Vercel > Logs so a failed save is never a mystery.
    console.error("estimate request insert failed:", error.code, error.message, error.details, error.hint);
    return { error: "Something went wrong. Please call 214-708-7503 instead." };
  }

  // Email it to you. Never let a mail failure fail the request itself.
  const usd = (n: number | null) =>
    n ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null;

  const beds = decodeQuote({ b: s("beds") }).beds;
  const detail = await rebuildQuote({
    slug: s("material_slug"),
    beds,
    fallbackSquareFeet: squareFeet ?? 0,
    depthInches: depthInches ?? 3,
    zip,
    weedFabric,
    limitedAccess,
    edging,
  });

  const html = ownerEmail({
    name, phone, email, address, zip, preferredTime, notes,
    photoCount: photoPaths.length,
    beds,
    squareFeet,
    depthInches,
    weedFabric, limitedAccess, edging,
    customerSaw: estimatedTotal,
    materialName,
    detail,
  });

  const headline = detail
    ? `${detail.quote.billedYards.toFixed(2)} yd³ ${detail.material.name}, ${usd(detail.quote.total)}`
    : materialName || "no estimate";

  await notifyOwner({
    subject: `New job request: ${name} (${headline})`,
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

// ---------------------------------------------------------------------------
// Owner email: everything you need to call the customer back and price the
// job without opening the admin panel.
// ---------------------------------------------------------------------------

interface QuoteDetail {
  material: Material;
  quote: Quote;
  squareFeet: number;
  edgingFeet: number;
}

/**
 * Re-run the estimator on the server with your current prices, so the email
 * shows the full breakdown (and can't be fooled by an edited web page).
 * Returns null when there is no estimate to rebuild. Never throws.
 */
async function rebuildQuote(opts: {
  slug: string;
  beds: { length: number; width: number }[];
  fallbackSquareFeet: number;
  depthInches: number;
  zip: string;
  weedFabric: boolean;
  limitedAccess: boolean;
  edging: boolean;
}): Promise<QuoteDetail | null> {
  if (!opts.slug) return null;
  try {
    const [materials, settings, tiers, fabricTiers] = await Promise.all([
      getActiveMaterials(),
      getPricingSettings(),
      getDiscountTiers(),
      getFabricTiers(),
    ]);
    const material = materials.find((m) => m.slug === opts.slug);
    if (!material) return null;

    const bedSqft = opts.beds.reduce((sum, b) => sum + b.length * b.width, 0);
    const squareFeet = bedSqft || opts.fallbackSquareFeet;
    if (squareFeet <= 0) return null;
    const edgingFeet = opts.edging
      ? opts.beds.reduce((sum, b) => sum + 2 * (b.length + b.width), 0)
      : 0;

    const quote = buildQuote({
      material,
      settings,
      tiers,
      fabricTiers,
      weedFabric: opts.weedFabric,
      squareFeet,
      depthInches: opts.depthInches,
      zip: opts.zip,
      limitedAccess: opts.limitedAccess,
      edgingFeet,
    });
    return { material, quote, squareFeet, edgingFeet };
  } catch (err) {
    console.error("could not rebuild quote for email:", err);
    return null;
  }
}

const dollars = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const CATEGORY: Record<string, string> = { mulch: "Mulch", rock: "Rock", other: "Other" };

function section(title: string): string {
  return `<tr><td colspan="2" style="padding:18px 0 6px;font-weight:bold;color:#453738;border-bottom:1px solid #E5DCD0;">${esc(title)}</td></tr>`;
}

function ownerEmail(r: {
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  preferredTime: string;
  notes: string;
  photoCount: number;
  beds: { length: number; width: number }[];
  squareFeet: number | null;
  depthInches: number | null;
  weedFabric: boolean;
  limitedAccess: boolean;
  edging: boolean;
  customerSaw: number | null;
  materialName: string;
  detail: QuoteDetail | null;
}): string {
  const d = r.detail;
  const q = d?.quote;

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [r.address, r.zip].filter(Boolean).join(" ")
  )}`;
  const tel = r.phone.replace(/[^\d+]/g, "");

  const bedList = r.beds.length
    ? r.beds.map((b) => `${b.length} × ${b.width} ft`).join(", ")
    : null;

  const addOns = [
    r.weedFabric ? "Weed fabric" : null,
    r.limitedAccess ? "Limited access (wheelbarrow haul)" : null,
    r.edging ? `Edging and weed pull${d?.edgingFeet ? ` (${d.edgingFeet} ft)` : ""}` : null,
  ].filter(Boolean).join(", ");

  // --- Customer -------------------------------------------------------------
  let rows = section("Customer");
  rows += `<tr><td style="padding:6px 16px 6px 0;color:#8A7878;">Phone</td><td style="padding:6px 0;"><a href="tel:${esc(tel)}" style="color:#B7655D;">${esc(r.phone)}</a></td></tr>`;
  rows += row("Name", r.name);
  rows += row("Email", r.email || null);
  rows += `<tr><td style="padding:6px 16px 6px 0;color:#8A7878;vertical-align:top;">Address</td><td style="padding:6px 0;"><a href="${esc(mapUrl)}" style="color:#B7655D;">${esc(r.address)}${r.zip ? ` ${esc(r.zip)}` : ""}</a></td></tr>`;
  rows += row("Timing", r.preferredTime || null);
  rows += row("Photos", r.photoCount ? `${r.photoCount} attached (view in admin)` : "None");
  rows += row("Notes", r.notes || null);

  // --- Job ------------------------------------------------------------------
  rows += section("Job");
  if (d && q) {
    rows += row("Material", `${d.material.name} (${CATEGORY[d.material.category] ?? d.material.category})`);
    rows += row("Beds", bedList);
    rows += row("Area", `${d.squareFeet.toLocaleString()} sq ft`);
    rows += row("Depth", `${r.depthInches ?? 3}"`);
    rows += row("Yards needed", `${q.rawYards.toFixed(2)} yd³ (rounds to ${q.yards.toFixed(2)})`);
    rows += row(
      "Yards billed",
      q.minimumYardsApplied
        ? `${volumeLabel(d.material.category, q.billedYards)} (minimum applied)`
        : volumeLabel(d.material.category, q.billedYards)
    );
    rows += row("Truck trips", q.trips);
    rows += row("Add-ons", addOns || "None");
  } else {
    rows += row("Material", r.materialName || "Not picked");
    rows += row("Beds", bedList);
    rows += row("Area", r.squareFeet ? `${r.squareFeet.toLocaleString()} sq ft` : null);
    rows += row("Depth", r.depthInches ? `${r.depthInches}"` : null);
    rows += row("Add-ons", addOns || "None");
    rows += row("Estimate", "They didn't use the estimator, so there's no price yet.");
  }

  // --- Price ----------------------------------------------------------------
  if (q) {
    rows += section("Price");
    for (const li of q.lineItems) {
      rows += `<tr><td style="padding:6px 16px 6px 0;color:#453738;vertical-align:top;">${esc(li.label)}${
        li.detail ? `<br/><span style="color:#8A7878;font-size:12px;">${esc(li.detail)}</span>` : ""
      }</td><td style="padding:6px 0;text-align:right;color:#453738;vertical-align:top;">${dollars(li.amount)}</td></tr>`;
    }
    if (q.savings > 0 && q.tier) {
      rows += row("Volume discount", `$${q.discountPerYard}/yd off at ${q.tier.min_yards}+ yd (saves ${dollars(q.savings)}, already in the rate)`);
    }
    if (q.minimumApplied) {
      rows += row("Job minimum", `Subtotal ${dollars(q.subtotal)} raised to the ${dollars(q.total)} minimum`);
    }
    rows += `<tr><td style="padding:10px 16px 6px 0;font-weight:bold;color:#453738;border-top:1px solid #E5DCD0;">Total</td><td style="padding:10px 0 6px;text-align:right;font-weight:bold;color:#453738;border-top:1px solid #E5DCD0;">${dollars(q.total)}</td></tr>`;
    if (q.deposit > 0) rows += row("Deposit", dollars(q.deposit));
    if (r.customerSaw && Math.abs(r.customerSaw - q.total) >= 1) {
      rows += row("Note", `Their screen showed ${dollars(r.customerSaw)}. The total above uses your current prices.`);
    }
  }

  // --- Heads up -------------------------------------------------------------
  const flags = q?.reviewReasons ?? [];
  const flagBlock = flags.length
    ? `<div style="margin:16px 0 0;padding:10px 14px;background:#FBEDE6;border-radius:8px;color:#8A3B2F;font-size:14px;"><strong>Check before booking:</strong><br/>${flags.map(esc).join("<br/>")}</div>`
    : "";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;">
      <h2 style="margin:0 0 4px;color:#453738;">New job request</h2>
      <p style="margin:0 0 4px;color:#8A7878;">From the estimator on your site.</p>
      ${flagBlock}
      <table style="border-collapse:collapse;font-size:14px;width:100%;">
        ${rows}
      </table>
      <p style="margin:18px 0 0;">
        <a href="https://prestonhollowmulchachos.com/admin/requests" style="color:#B7655D;">Open it in the admin panel &rarr;</a>
      </p>
    </div>`;
}
