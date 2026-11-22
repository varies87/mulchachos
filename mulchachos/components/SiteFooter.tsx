import { PHONE } from "./SiteHeader";
import { getPricingSettings } from "@/lib/materials";
import { neighborhoodFor } from "@/lib/content";

const MONO = "font-[family-name:var(--font-mono)]";

/**
 * Links every ZIP landing page from every page, so visitors and Google can
 * reach them. The list is the service ZIPs set in the admin panel; adding a
 * ZIP there creates its page and its footer link.
 */
async function serviceZips(): Promise<string[]> {
  try {
    return (await getPricingSettings()).service_zips;
  } catch {
    return [];
  }
}

export default async function SiteFooter() {
  const zips = await serviceZips();
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <a href={"tel:" + PHONE} className="text-2xl font-extrabold text-[var(--clay)]">
              {PHONE}
            </a>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Preston Hollow Mulchachos LLC
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              Dallas, Texas
            </p>
          </div>

          <div>
            <p className={ MONO + " text-xs uppercase tracking-widest text-[var(--muted)]" }>
              Service area
            </p>
            <p className="mt-3 max-w-sm text-sm text-[var(--ink-soft)]">
              Dallas and the cities around it: Irving, Carrollton,
              Richardson, Plano, Grand Prairie, and more.
            </p>
          </div>

          {zips.length > 0 && (
            <div>
              <p className={ MONO + " text-xs uppercase tracking-widest text-[var(--muted)]" }>
                Neighborhoods
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                {zips.map((z) => (
                  <li key={z}>
                    <a href={`/delivery/${z}`} className="text-[var(--ink-soft)] hover:text-[var(--clay)]">
                      {neighborhoodFor(z)} <span className="text-[var(--muted)]">{z}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="mt-10 text-xs text-[var(--muted)]">
          <a href="/privacy" className="hover:underline">Privacy and terms</a>
        </p>
      </div>
    </footer>
  );
}
