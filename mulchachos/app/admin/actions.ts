"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { slugify } from "@/lib/materials";

async function requireAdmin() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return sb;
}

/** Public pages are statically cached, so every write has to bust them. */
function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/estimate");
  revalidatePath("/admin");
}

const num = (v: FormDataEntryValue | null, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export async function saveMaterial(formData: FormData) {
  const sb = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const row = {
    name,
    slug: String(formData.get("slug") || "").trim() || slugify(name),
    blurb: String(formData.get("blurb") ?? "").trim(),
    category: String(formData.get("category") ?? "mulch"),
    swatch: String(formData.get("swatch") ?? "#4A3728"),
    image_url: String(formData.get("image_url") ?? "") || null,
    cost_per_yard: num(formData.get("cost_per_yard")),
    instant_bookable: formData.get("instant_bookable") === "on",
    active: formData.get("active") === "on",
    sort_order: num(formData.get("sort_order"), 99),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await sb.from("materials").update(row).eq("id", id)
    : await sb.from("materials").insert(row);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Another material already uses that URL slug."
          : error.message,
    };
  }

  refreshPublicPages();
  return { ok: true };
}

/** Hides a material from the public site without destroying job history. */
export async function toggleActive(id: string, active: boolean) {
  const sb = await requireAdmin();
  const { error } = await sb.from("materials").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  refreshPublicPages();
  return { ok: true };
}

export async function deleteMaterial(id: string) {
  const sb = await requireAdmin();
  const { error } = await sb.from("materials").delete().eq("id", id);
  if (error) return { error: error.message };
  refreshPublicPages();
  return { ok: true };
}

export async function savePricing(formData: FormData) {
  const sb = await requireAdmin();

  const zips = String(formData.get("service_zips") ?? "")
    .split(/[\s,]+/)
    .map((z) => z.trim())
    .filter((z) => /^\d{5}$/.test(z));

  const { error } = await sb
    .from("pricing_settings")
    .update({
      labor_per_yard: num(formData.get("labor_per_yard")),
      delivery_fee: num(formData.get("delivery_fee")),
      yards_per_trip: num(formData.get("yards_per_trip"), 6),
      minimum_job: num(formData.get("minimum_job")),
      limited_access_surcharge: num(formData.get("limited_access_surcharge")),
      edging_per_foot: num(formData.get("edging_per_foot")),
      instant_book_yard_cap: num(formData.get("instant_book_yard_cap"), 12),
      deposit_rate: num(formData.get("deposit_rate"), 0.5),
      service_zips: zips,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  refreshPublicPages();
  return { ok: true };
}

/** Testimonials appear on the home page as soon as they are active. */
export async function saveTestimonial(formData: FormData) {
  const sb = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const author = String(formData.get("author") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  if (!author) return { error: "Add who said it." };
  if (!quote) return { error: "Add the quote." };

  const row = {
    author,
    neighborhood: String(formData.get("neighborhood") ?? "").trim() || null,
    quote,
    rating: Math.min(5, Math.max(1, num(formData.get("rating"), 5))),
    sort_order: num(formData.get("sort_order"), 0),
    active: formData.get("active") === "on",
  };

  const { error } = id
    ? await sb.from("testimonials").update(row).eq("id", id)
    : await sb.from("testimonials").insert(row);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

export async function deleteTestimonial(id: string) {
  const sb = await requireAdmin();
  const { error } = await sb.from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

/** Job photos lead the home page proof section as soon as one is active. */
export async function saveJobPhoto(formData: FormData) {
  const sb = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const image_url = String(formData.get("image_url") ?? "").trim();
  if (!image_url) return { error: "Add a photo first." };

  const row = {
    image_url,
    caption: String(formData.get("caption") ?? "").trim() || null,
    neighborhood: String(formData.get("neighborhood") ?? "").trim() || null,
    material_slug: String(formData.get("material_slug") ?? "").trim() || null,
    sort_order: num(formData.get("sort_order"), 0),
    active: formData.get("active") === "on",
  };

  const { error } = id
    ? await sb.from("job_photos").update(row).eq("id", id)
    : await sb.from("job_photos").insert(row);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/photos");
  return { ok: true };
}

export async function deleteJobPhoto(id: string) {
  const sb = await requireAdmin();
  const { error } = await sb.from("job_photos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/photos");
  return { ok: true };
}

/** Record the real amount of a job. Pass null to clear it. */
export async function setRequestTotal(id: string, total: number | null) {
  const sb = await requireAdmin();
  const clean = total !== null && Number.isFinite(total) && total >= 0 ? total : null;
  const { error } = await sb
    .from("estimate_requests")
    .update({ final_total: clean })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/requests");
  revalidatePath("/admin/customers");
}

/** Log an order that came in off the website — a text, a call, in person. */
export async function addManualOrder(formData: FormData) {
  const sb = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Add a name." };

  const total = num(formData.get("final_total"), 0);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const { error } = await sb.from("estimate_requests").insert({
    name,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: email || null,
    contact: null,
    material_name: String(formData.get("material_name") ?? "").trim() || null,
    final_total: total > 0 ? total : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    source: String(formData.get("source") ?? "text").trim() || "text",
    status: "new",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/requests");
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/** Move an estimate request along: new → scheduled → quoted → closed. */
export async function setRequestStatus(id: string, status: string) {
  const allowed = ["new", "scheduled", "quoted", "closed"];
  if (!allowed.includes(status)) return;
  const sb = await supabaseServer();
  const { error } = await sb
    .from("estimate_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/requests");
}

/** Toggle an inquiry between waiting and dealt with. */
export async function setHandled(id: string, handled: boolean) {
  const sb = await supabaseServer();
  const { error } = await sb
    .from("inquiries")
    .update({ handled })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/inquiries");
}
