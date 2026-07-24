import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface RequestRow {
  name: string | null;
  email: string | null;
  phone: string | null;
  contact: string | null;
  material_name: string | null;
  estimated_total: number | null;
  final_total: number | null;
  created_at: string;
}

interface Customer {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  count: number;
  total: number;
  confirmed: number;
  materials: string[];
  last: string;
}

const MONO = "font-[family-name:var(--font-mono)]";
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function CustomersPage() {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("estimate_requests")
    .select("name, email, phone, contact, material_name, estimated_total, final_total, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as RequestRow[];

  // Group by email when we have one, else by phone, else by name. Email is
  // required on new requests, so repeat customers thread together on it.
  const byKey = new Map<string, Customer>();
  for (const r of rows) {
    const email = r.email?.trim().toLowerCase() || null;
    const key = email || r.phone?.trim() || r.contact?.trim() || r.name?.trim() || "unknown";

    const existing = byKey.get(key);
    // The real amount when you have entered one, otherwise the website estimate.
    const amount = r.final_total ?? r.estimated_total ?? 0;
    const materials = existing?.materials ?? [];
    if (r.material_name && !materials.includes(r.material_name)) materials.push(r.material_name);

    byKey.set(key, {
      key,
      name: existing?.name || r.name || "—",
      email: existing?.email ?? r.email ?? null,
      phone: existing?.phone ?? r.phone ?? null,
      count: (existing?.count ?? 0) + 1,
      total: (existing?.total ?? 0) + amount,
      confirmed: (existing?.confirmed ?? 0) + (r.final_total != null ? 1 : 0),
      materials,
      last: existing?.last ?? r.created_at, // rows are newest-first, so first seen is latest
    });
  }

  // Repeat customers first, then by how much they have requested.
  const customers = [...byKey.values()].sort(
    (a, b) => b.count - a.count || b.total - a.total
  );
  const repeat = customers.filter((c) => c.count > 1).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Customers</h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        {customers.length === 0
          ? "No requests yet."
          : `${customers.length} so far${repeat > 0 ? `, ${repeat} who came back` : ""}.`}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Grouped by email across every request and logged order. Totals use the
        real job amount where you have entered one, and the website estimate
        until then.
      </p>

      <div className="mt-8 space-y-3">
        {customers.map((c) => (
          <article key={c.key} className="rounded-xl border border-[var(--line)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <span className={MONO + " text-sm"}>
                {c.count > 1 && (
                  <span className="mr-3 rounded-full bg-[var(--paper-deep)] px-2 py-0.5 text-xs text-[var(--clay)]">
                    {c.count} orders
                  </span>
                )}
                <span className="tnum font-semibold">{money(c.total)}</span>
                <span className="text-[var(--muted)]">
                  {c.confirmed === c.count ? " total" : c.confirmed > 0 ? " so far" : " est."}
                </span>
              </span>
            </div>

            <p className={MONO + " mt-1 text-sm"}>
              {c.phone && <a href={`tel:${c.phone}`} className="text-[var(--clay)]">{c.phone}</a>}
              {c.email && (
                <>
                  {c.phone ? <span className="text-[var(--muted)]"> · </span> : null}
                  <a href={`mailto:${c.email}`} className="text-[var(--clay)]">{c.email}</a>
                </>
              )}
            </p>

            {c.materials.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.materials.map((m) => (
                  <span key={m} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--ink-soft)]">
                    {m}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-[var(--muted)]">
              Last request {new Date(c.last).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>

      {customers.length === 0 && (
        <p className="mt-6 rounded-sm border border-dashed border-[var(--line)] p-10 text-center text-[var(--muted)]">
          Once requests come in, everyone shows here grouped by email, with what
          they asked about and their running estimated total.
        </p>
      )}
    </div>
  );
}
