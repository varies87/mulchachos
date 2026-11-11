import { supabaseServer } from "@/lib/supabase-server";
import MarkHandled from "@/components/admin/MarkHandled";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: string;
  name: string;
  contact: string;
  message: string;
  quote_note: string | null;
  handled: boolean;
  created_at: string;
}

const MONO = "font-[family-name:var(--font-mono)]";

export default async function InquiriesPage() {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("inquiries")
    .select("*")
    .order("handled")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Inquiry[];
  const open = rows.filter((r) => !r.handled);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Inquiries</h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        {open.length === 0 ? "Nothing waiting on you." : `${open.length} waiting on a reply.`}
      </p>

      <div className="mt-8 space-y-4">
        {rows.length === 0 && (
          <p className="text-[var(--muted)]">No inquiries yet.</p>
        )}

        {rows.map((r) => (
          <article key={r.id} className={"rounded-xl border p-5 " + (r.handled ? "border-[var(--line)] opacity-60" : "border-[var(--clay)]")}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{r.name}</h2>
              <span className={MONO + " text-xs text-[var(--muted)]"}>
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>

            <p className={MONO + " mt-1 text-sm text-[var(--clay)]"}>
              {r.contact}
            </p>

            <p className="mt-3 whitespace-pre-wrap">{r.message}</p>

            {r.quote_note && (
              <p className="mt-3 rounded-lg bg-[var(--paper-deep)] p-3 text-xs text-[var(--ink-soft)]">
                Their estimate: {r.quote_note}
              </p>
            )}

            <div className="mt-4">
              <MarkHandled id={r.id} handled={r.handled} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
