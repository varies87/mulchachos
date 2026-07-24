import { supabaseServer } from "@/lib/supabase-server";
import RequestStatus from "@/components/admin/RequestStatus";
import RequestTotal from "@/components/admin/RequestTotal";
import AddOrder from "@/components/admin/AddOrder";

export const dynamic = "force-dynamic";

interface EstimateRequest {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  zip: string | null;
  material_name: string | null;
  square_feet: number | null;
  depth_inches: number | null;
  weed_fabric: boolean;
  limited_access: boolean;
  edging: boolean;
  estimated_total: number | null;
  final_total: number | null;
  source: string | null;
  quote_note: string | null;
  preferred_time: string | null;
  notes: string | null;
  photo_paths: string[];
  status: string;
  created_at: string;
}

const MONO = "font-[family-name:var(--font-mono)]";
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function RequestsPage() {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("estimate_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as EstimateRequest[];
  const open = rows.filter((r) => r.status !== "closed");

  // Sign photo URLs so the owner can view them without a public bucket.
  const allPaths = rows.flatMap((r) => r.photo_paths ?? []);
  const signed = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: urls } = await sb.storage
      .from("estimate-photos")
      .createSignedUrls(allPaths, 60 * 60);
    (urls ?? []).forEach((u) => {
      if (u.signedUrl && u.path) signed.set(u.path, u.signedUrl);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Estimate requests</h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        {open.length === 0 ? "Nothing open." : `${open.length} open.`}
      </p>

      <div className="mt-6">
        <AddOrder />
      </div>

      <div className="mt-4 space-y-4">
        {rows.length === 0 && (
          <p className="text-[var(--muted)]">No requests yet.</p>
        )}

        {rows.map((r) => (
          <article key={r.id} className={"rounded-xl border p-5 " + (r.status === "closed" ? "border-[var(--line)] opacity-60" : "border-[var(--clay)]")}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {r.name}
                {r.source && r.source !== "website" && (
                  <span className="ml-2 rounded-full bg-[var(--paper-deep)] px-2 py-0.5 text-xs font-normal text-[var(--clay)]">
                    {r.source}
                  </span>
                )}
              </h2>
              <span className={MONO + " text-xs text-[var(--muted)]"}>
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>

            <p className={MONO + " mt-1 text-sm"}>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="text-[var(--clay)]">{r.phone}</a>
              )}
              {r.email && (
                <>
                  {r.phone ? <span className="text-[var(--muted)]"> · </span> : null}
                  <a href={`mailto:${r.email}`} className="text-[var(--clay)]">{r.email}</a>
                </>
              )}
              {!r.phone && !r.email && r.contact ? (
                <span className="text-[var(--clay)]">{r.contact}</span>
              ) : null}
            </p>

            {r.address && (
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {r.address}{r.zip ? ` · ${r.zip}` : ""}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--ink-soft)]">
              {r.material_name && <span>{r.material_name}</span>}
              {r.square_feet ? <span className={MONO}>{r.square_feet.toLocaleString()} sq ft</span> : null}
              {r.depth_inches ? <span className={MONO}>{r.depth_inches}&quot; deep</span> : null}
              {r.estimated_total ? <span className={MONO}>est. {money(r.estimated_total)}</span> : null}
              {r.weed_fabric && <span>+ fabric</span>}
              {r.limited_access && <span>+ limited access</span>}
              {r.edging && <span>+ edging</span>}
            </div>

            {r.preferred_time && (
              <p className="mt-2 text-sm">
                <span className="text-[var(--muted)]">Timing:</span> {r.preferred_time}
              </p>
            )}

            {r.notes && <p className="mt-3 whitespace-pre-wrap">{r.notes}</p>}

            {r.photo_paths?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {r.photo_paths.map((p) => {
                  const url = signed.get(p);
                  return url ? (
                    <a key={p} href={url} target="_blank" rel="noreferrer" className="block h-24 w-24 overflow-hidden rounded-lg border border-[var(--line)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Customer photo" className="h-full w-full object-cover" />
                    </a>
                  ) : (
                    <span key={p} className="flex h-24 w-24 items-center justify-center rounded-lg border border-[var(--line)] text-xs text-[var(--muted)]">
                      photo
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <RequestTotal id={r.id} value={r.final_total} />
              <RequestStatus id={r.id} status={r.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
