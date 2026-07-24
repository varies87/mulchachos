import { supabaseServer } from "./supabase-server";

export interface Testimonial {
  id: string;
  author: string;
  neighborhood: string | null;
  quote: string;
  rating: number;
  sort_order: number;
  active: boolean;
}

export interface JobPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  neighborhood: string | null;
  material_slug: string | null;
  sort_order: number;
  active: boolean;
}

/**
 * Real customer quotes, in the order set in the admin panel. Ships empty:
 * the Testimonials section hides itself until there is something true to show.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) return []; // Table not migrated yet, or empty. Section just hides.
  return (data ?? []) as Testimonial[];
}

/**
 * Real delivery photos for the home page gallery. Ships empty, and the gallery
 * falls back to the delivery videos until real photos are added.
 */
export async function getJobPhotos(): Promise<JobPhoto[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("job_photos")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as JobPhoto[];
}

/** Admin views: everything, active first, so hidden items are still editable. */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .order("active", { ascending: false })
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as Testimonial[];
}

export async function getAllJobPhotos(): Promise<JobPhoto[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("job_photos")
    .select("*")
    .order("active", { ascending: false })
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as JobPhoto[];
}

/**
 * The neighborhoods behind the service ZIPs, for landing-page and footer copy.
 * A ZIP with no entry falls back to plain "North Dallas".
 */
export const ZIP_NEIGHBORHOODS: Record<string, string> = {
  "75225": "Preston Hollow",
  "75229": "Preston Hollow",
  "75230": "Preston Hollow",
  "75209": "Bluffview",
  "75220": "Midway Hollow",
  "75205": "Highland Park",
  "75219": "Oak Lawn",
  "75231": "Lake Highlands",
  "75240": "North Dallas",
};

export function neighborhoodFor(zip: string): string {
  return ZIP_NEIGHBORHOODS[zip] ?? "North Dallas";
}
