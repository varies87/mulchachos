"use server";

import { supabaseServer } from "@/lib/supabase-server";

/**
 * A scheduling request. Like inquiries, RLS allows the insert and nothing
 * else, so a visitor can book a walk-through but can never read anyone's.
 * Photos are uploaded straight to storage from the browser before this runs;
 * we only store the paths they returned.
 */
export async function submitEstimateRequest(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const num = (k: string) => {
    const n = Number(formData.get(k));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const name = s("name");
  const contact = s("contact");
  const address = s("address");

  if (!name) return { error: "Please add your name." };
  if (!contact) return { error: "Add a phone number or email so we can reach you." };
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

  const sb = await supabaseServer();
  const { error } = await sb.from("estimate_requests").insert({
    name,
    contact,
    address,
    zip: s("zip") || null,
    material_slug: s("material_slug") || null,
    material_name: s("material_name") || null,
    square_feet: num("square_feet"),
    depth_inches: num("depth_inches"),
    weed_fabric: s("weed_fabric") === "1",
    limited_access: s("limited_access") === "1",
    edging: s("edging") === "1",
    estimated_total: num("estimated_total"),
    quote_note: s("quote_note") || null,
    preferred_time: s("preferred_time") || null,
    notes: s("notes") || null,
    photo_paths: photoPaths,
  });

  if (error) return { error: "Something went wrong. Please call 214-708-7503 instead." };
  return { ok: true };
}
