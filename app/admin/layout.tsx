import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();

  if (!auth.user) redirect("/admin/login");

  // Signed in is not the same as allowed. The allowlist is the real gate,
  // and RLS enforces it again at the database.
  const { data: admin } = await sb
    .from("admins")
    .select("email")
    .eq("email", auth.user.email)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
          Not an admin account
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          {auth.user.email} is signed in but not on the allowlist. Add it to the
          admins table in Supabase.
        </p>
        <form action={signOut}>
          <button className="mt-6 text-sm text-[var(--granite)] underline underline-offset-4">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-display)] font-extrabold">
              Mulchachos
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a href="/" className="text-[var(--muted)] hover:text-[var(--paper)]">
              View site
            </a>
            <form action={signOut}>
              <button className="text-[var(--muted)] hover:text-[var(--paper)]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
