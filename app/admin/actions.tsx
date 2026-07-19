"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
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
