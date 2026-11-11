// Google reviews setup: finds the business's Place ID (service-area
// businesses with a hidden address don't show up in Google's Place ID Finder)
// and tests the live reviews connection. Admin-only via the admin layout.

export const dynamic = "force-dynamic";

const H = "font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight";
const CARD = "rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5";
const MONO = "font-[family-name:var(--font-mono)]";

interface Found {
  id: string;
  name: string;
  address: string | null;
  mapsUri: string | null;
}

async function searchPlaces(key: string, q: string): Promise<{ found: Found[]; error?: string }> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri",
      },
      // Without this, businesses with a hidden address are left out entirely.
      body: JSON.stringify({ textQuery: q, includePureServiceAreaBusinesses: true, pageSize: 10 }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    if (!res.ok) return { found: [], error: data?.error?.message ?? `Google returned ${res.status}` };
    type P = { id: string; displayName?: { text?: string }; formattedAddress?: string; googleMapsUri?: string };
    return {
      found: ((data.places ?? []) as P[]).map((p) => ({
        id: p.id,
        name: p.displayName?.text ?? "(no name)",
        address: p.formattedAddress ?? null,
        mapsUri: p.googleMapsUri ?? null,
      })),
    };
  } catch (err) {
    return { found: [], error: String(err) };
  }
}

async function testDetails(key: string, placeId: string) {
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false as const, error: data?.error?.message ?? `Google returned ${res.status}` };
    const reviews = (data.reviews ?? []) as { text?: { text?: string } }[];
    return {
      ok: true as const,
      name: data.displayName?.text as string | undefined,
      rating: data.rating as number | undefined,
      count: (data.userRatingCount ?? 0) as number,
      withText: reviews.filter((r) => (r.text?.text ?? "").trim()).length,
    };
  } catch (err) {
    return { ok: false as const, error: String(err) };
  }
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className={ok ? "text-[var(--success)]" : "text-[var(--danger)]"}>{ok ? "✓" : "✗"}</span>
      <span>{children}</span>
    </li>
  );
}

export default async function GoogleSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  const query = (q ?? "").trim();
  const search = key && query ? await searchPlaces(key, query) : null;
  const test = key && placeId ? await testDetails(key, placeId) : null;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className={H}>Google reviews</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connects the home page to your Google Business listing. Settings live in
          Vercel → Settings → Environment Variables; redeploy after changing them.
        </p>
      </div>

      <section className={CARD}>
        <h2 className="font-bold">Status</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Check ok={!!key}>
            <span className={MONO}>GOOGLE_PLACES_API_KEY</span> {key ? "is set" : "is missing"}
          </Check>
          <Check ok={!!placeId}>
            <span className={MONO}>GOOGLE_PLACE_ID</span>{" "}
            {placeId ? <>is set to <span className={MONO}>{placeId}</span></> : "is missing. Find it below."}
          </Check>
          {test && !test.ok && <Check ok={false}>Google said: {test.error}</Check>}
          {test && test.ok && (
            <>
              <Check ok>
                Connected to <strong>{test.name ?? "your listing"}</strong>: {test.rating?.toFixed(1) ?? "no"} stars from{" "}
                {test.count} reviews
              </Check>
              <Check ok={test.withText > 0}>
                {test.withText > 0
                  ? `${test.withText} written reviews available. They're live on the home page.`
                  : "No written reviews yet (star-only ratings can't be shown). The section appears once one comes in."}
              </Check>
            </>
          )}
        </ul>
      </section>

      <section className={CARD}>
        <h2 className="font-bold">Find your Place ID</h2>
        {!key ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Add the API key in Vercel and redeploy first.</p>
        ) : (
          <>
            <form className="mt-3 flex flex-wrap gap-2" action="/admin/google">
              <input
                name="q"
                defaultValue={query || "Preston Hollow Mulchachos Dallas"}
                className="min-w-0 flex-1 rounded-lg border border-[var(--line-strong)] bg-transparent px-3 py-2"
              />
              <button className="rounded-full bg-[var(--clay)] px-5 py-2 font-medium text-white">Search Google</button>
            </form>

            {search?.error && <p className="mt-3 text-sm text-[var(--danger)]">Google said: {search.error}</p>}
            {search && !search.error && search.found.length === 0 && (
              <p className="mt-3 text-sm text-[var(--muted)]">No matches. Try your business name exactly as it appears on Google, or your phone number.</p>
            )}
            {search && search.found.length > 0 && (
              <ul className="mt-4 space-y-3">
                {search.found.map((p) => (
                  <li key={p.id} className="rounded-lg border border-[var(--line)] p-3 text-sm">
                    <p className="font-medium">
                      {p.name}{" "}
                      {p.mapsUri && (
                        <a href={p.mapsUri} target="_blank" rel="noopener noreferrer" className="text-[var(--clay)] underline">
                          view on Maps
                        </a>
                      )}
                    </p>
                    <p className="text-[var(--muted)]">{p.address ?? "No public address (service-area business)"}</p>
                    <p className="mt-2">
                      Place ID: <code className={MONO + " select-all rounded bg-[var(--paper-deep)] px-1.5 py-0.5"}>{p.id}</code>
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-[var(--muted)]">
              Copy the right one into <span className={MONO}>GOOGLE_PLACE_ID</span> in Vercel, then redeploy.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
