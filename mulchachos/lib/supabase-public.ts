import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client for public pages: prices, materials, testimonials, photos.
 * It never touches cookies, so pages that use it can be cached and served
 * instantly instead of hitting the database on every visit. Row-level security
 * still limits it to what any visitor may see. Admin pages keep using
 * supabaseServer(), which carries the signed-in session.
 */
let client: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return client;
}
