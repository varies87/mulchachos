import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client for server components and server actions.
 * Never import this from a client component.
 */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a server component. Proxy refreshes the session.
          }
        },
      },
    }
  );
}
