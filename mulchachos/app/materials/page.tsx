import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Materials",
  description:
    "Mulch, decomposed granite, and river rock we deliver and " +
    "spread across Preston Hollow and North Dallas.",
};

const MONO = "font-[family-name:var(--font-mono)]";

const BTN =
  "mt-4 inline-block rounded-full border border-[var(--clay)] " +
  "px-4 py-2 text-sm font-medium text-[var(--clay)] " +
  "hover:bg-[var(--clay)] hover:text-white";

export default async function MaterialsPage() {
  const [materials, settings] = await Promise.all([
    getActiveMaterials(),
    getPricingSettings(),
  ]);

  const mulch = materials.filter((m) => m.category === "mulch");
  const rock = materials.filter((m) => m.category !== "mulch");

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-4 pt-12">
        <h1 className="max-w-2xl text-4xl font-extrabold sm:text-6xl">
          What goes in the beds.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
          Every price is per cubic yard, delivered and spread.
          You are billed for the volume actually used.
        </p>
      </section>

      <Group title="Mulch" items={mulch} />
      <Group title="Rock and granite" items={rock} />

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}

type Item = Awaited<ReturnType<typeof getActiveMaterials>>[number];

function Group({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className={ MONO + " text-xs uppercase tracking-widest text-[var(--muted)]" }>
        {title}
      </h2>

      <div className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <article key={m.id}>
            <div className="h-44 overflow-hidden rounded-lg" style={{ backgroundColor: m.swatch }}>
              {m.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.image_url} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <span className={"tnum text-sm " + MONO}>
                ${m.cost_per_yard}/yd³
              </span>
            </div>

            <p className="mt-2 text-[var(--ink-soft)]">{m.blurb}</p>

            {!m.instant_bookable && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Quoted by load and haul distance.
              </p>
            )}

            <a href={"/estimate?material=" + m.slug} className={BTN}>
              Price this
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
