import { supabaseServer } from "./supabase-server";

export interface Material {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  category: "mulch" | "rock" | "other";
  swatch: string;
  image_url: string | null;
  cost_per_yard: number;
  instant_bookable: boolean;
  active: boolean;
  sort_order: number;
}

export interface DiscountTier {
  category: "mulch" | "rock";
  min_yards: number;
  discount_per_yard: number;
}

export interface PricingSettings {
  mulch_min_yards: number;
  rock_min_yards: number;
  labor_per_yard: number;
  delivery_fee: number;
  yards_per_trip: number;
  minimum_job: number;
  limited_access_surcharge: number;
  edging_per_foot: number;
  instant_book_yard_cap: number;
  deposit_rate: number;
  service_zips: string[];
}

/** Public pages: only what customers should see, in the order you set. */
export async function getActiveMaterials(): Promise<Material[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("materials")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Material[];
}

/** Admin panel: everything, including hidden materials. */
export async function getAllMaterials(): Promise<Material[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb.from("materials").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Material[];
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("pricing_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as PricingSettings;
}

export async function getDiscountTiers(): Promise<DiscountTier[]> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("discount_tiers")
    .select("*")
    .order("min_yards");
  if (error) throw error;
  return (data ?? []) as DiscountTier[];
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
