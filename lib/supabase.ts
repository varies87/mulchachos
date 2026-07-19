import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client components: image upload, sign in. */
export const supabaseBrowser = () => createBrowserClient(URL, KEY);

/** Server components and server actions. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(URL, KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component. Middleware refreshes the session.
        }
      },
    },
  });
}
