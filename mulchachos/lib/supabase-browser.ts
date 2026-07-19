import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Safe to import from client components.
 * Must never import next/headers, or it poisons the client bundle.
 */
export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
