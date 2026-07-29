import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WeedFabric from "@/components/WeedFabric";
import { PHONE } from "@/components/SiteHeader";
import {
  getActiveMaterials,
  getMaterialBySlug,
  getPricingSettings,
} from "@/lib/materials";

export const dynamic = "force-dynamic";

const MONO = "font-[family-name:var(--font-mono)]";
const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-7 py-4 text-lg " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMaterialBySlug(slug);
  if (!m) return { title: "Material not found" };
  return {
    title: `${m.name} — delivered and spread`,
    description: `${m.blurb} Delivered and spread across Preston Hollow and North Dallas at $${m.cost_per_yard} per cubic yard.`,
    alternates: { canonical: `/materials/${m.slug}` },
  };
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [material, all, settings] = await Promise.all([
    getMaterialBySlug(slug),
    getActiveMaterials(),
    getPricingSettings(),
  ]);

  if (!material) notFound();

  const isRock = material.category !== "mulch";
  const related = all.filter(
    (m) => m.category === material.category && m.slug !== material.slug
  );
  const minYards = isRock ? settings.rock_min_yards : settings.mulch_min_yards;

  const guidance = isRock
    ? [
        {
          head: "Put fabric under it",
          body: "Stone does not break down, so weeds that come up through bare rock stay up. Heavy duty fabric underneath is the difference between a bed that looks new in five years and one you are weeding by June.",
        },
        {
          head: "Three inches covers most beds",
          body: "Enough to hide the soil and hold together underfoot. Deeper on paths and high-traffic runs.",
        },
        {
          head: "A one-time job, done right",
          body: "Rock is the kind of thing you lay once. We confirm the size and depth on site so you are not topping it up next spring.",
        },
      ]
    : [
        {
          head: "Three inches is the standard",
          body: "Two if the bed still has good mulch and you are topping up, four if you are starting over on bare soil.",
        },
        {
          head: "It feeds the bed",
          body: "Hardwood breaks down into the soil over a season, which is the point. Cedar holds its color and keeps insects out.",
        },
        {
          head: "Even depth, clean lines",
          body: "We spread to an even depth, edge the bed, and blow off the walks before we leave.",
        },
      ];

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-10">
        <nav className="text-sm text-[var(--muted)]">
          <a href="/materials" className="hover:text-[var(--clay)]">Materials</a>
          <span className="px-2">/</span>
          <span>{material.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="relative h-64 overflow-hidden rounded-xl sm:h-80 lg:h-full lg:min-h-[380px]" style={{ backgroundColor: material.swatch }}>
            {material.image_url && (
              <Image src={material.image_url} alt={material.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            )}
          </div>

          <div className="self-center">
            <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
              {isRock ? "Rock and granite" : "Mulch"}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{material.name}</h1>
            <p className="mt-4 text-lg text-[var(--ink-soft)]">{material.blurb}</p>

            <p className="mt-6 flex items-baseline gap-2">
              <span className={"tnum text-3xl font-extrabold " + MONO}>
                ${material.cost_per_yard}
              </span>
              <span className="text-[var(--ink-soft)]">per cubic yard, delivered and spread</span>
            </p>

            {!material.instant_bookable && (
              <p className="mt-3 rounded-lg bg-[var(--paper-deep)] p-3 text-sm text-[var(--ink-soft)]">
                Priced by load and haul distance, so this one gets a quick call
                to confirm before we book it.
              </p>
            )}

            {minYards > 0 && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {minYards} yd³ minimum on {isRock ? "rock" : "mulch"} jobs.
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a href={`/estimate?material=${material.slug}`} className={CTA}>
                Price this material
              </a>
              <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
                or call {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {guidance.map((g) => (
            <div key={g.head} className="border-l-2 border-[var(--line-strong)] pl-5">
              <h2 className="font-semibold">{g.head}</h2>
              <p className="mt-1 text-[var(--ink-soft)]">{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      {isRock && <WeedFabric />}

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className={MONO + " text-xs uppercase tracking-widest text-[var(--muted)]"}>
            More {isRock ? "rock and granite" : "mulch"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((m) => (
              <a key={m.id} href={`/materials/${m.slug}`} className="group block">
                <span className="relative block h-28 w-full overflow-hidden rounded-lg sm:h-32" style={{ backgroundColor: m.swatch }}>
                  {m.image_url && (
                    <Image src={m.image_url} alt={m.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                  )}
                </span>
                <span className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className={"tnum text-xs text-[var(--muted)] " + MONO}>${m.cost_per_yard}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
