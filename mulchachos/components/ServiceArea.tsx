import { neighborhoodFor } from "@/lib/content";
import { PHONE } from "./SiteHeader";

const MONO = "font-[family-name:var(--font-mono)]";

/**
 * Where we deliver. Groups the service ZIPs by neighborhood so a visitor can
 * find their own, and links each ZIP to its landing page. The ZIP list is the
 * same one the pricing panel uses, so this stays true as the area changes.
 */
export default function ServiceArea({ zips }: { zips: string[] }) {
  if (zips.length === 0) return null;

  // neighborhood -> sorted unique zips
  const byArea = new Map<string, string[]>();
  for (const z of zips) {
    const area = neighborhoodFor(z);
    byArea.set(area, [...(byArea.get(area) ?? []), z]);
  }
  const areas = [...byArea.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-extrabold">Where we deliver</h2>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            A tight loop around Preston Hollow and North Dallas. If your ZIP is
            on the list, you can book without a site visit. Just outside it?{" "}
            <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
              Call {PHONE}
            </a>{" "}
            and we will tell you straight.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {areas.map(([area, list]) => (
            <div key={area}>
              <p className={MONO + " text-xs uppercase tracking-widest text-[var(--muted)]"}>
                {area}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {[...new Set(list)].sort().map((z) => (
                  <li key={z}>
                    <a href={`/delivery/${z}`} className={"tnum text-sm text-[var(--ink-soft)] hover:text-[var(--clay)] " + MONO}>
                      {z}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
