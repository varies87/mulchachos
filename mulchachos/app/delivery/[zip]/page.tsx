import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PHONE } from "@/components/SiteHeader";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";
import { neighborhoodFor } from "@/lib/content";

export const dynamic = "force-dynamic";

const MONO = "font-[family-name:var(--font-mono)]";
const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-7 py-4 text-lg " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

const STEPS = [
  { n: "01", t: "Price your beds", b: "Measure length by width and pick a material. A real number comes up in about a minute." },
  { n: "02", t: "We haul it in", b: "Delivery lands the morning of the job. Nothing sits in your driveway overnight." },
  { n: "03", t: "We spread and edge", b: "Even depth, clean bed lines, walks blown off. You come home and it is done." },
];

async function isServiced(zip: string) {
  const settings = await getPricingSettings();
  return { serviced: settings.service_zips.includes(zip), settings };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zip: string }>;
}): Promise<Metadata> {
  const { zip } = await params;
  const area = neighborhoodFor(zip);
  return {
    title: `Mulch and rock delivery in ${area} (${zip})`,
    description: `Bulk mulch, decomposed granite, and river rock delivered and spread in ${area}, ${zip}. Price your beds in under a minute and book without a site visit.`,
    alternates: { canonical: `/delivery/${zip}` },
  };
}

export default async function DeliveryZipPage({
  params,
}: {
  params: Promise<{ zip: string }>;
}) {
  const { zip } = await params;
  if (!/^\d{5}$/.test(zip)) notFound();

  const [{ serviced, settings }, materials] = await Promise.all([
    isServiced(zip),
    getActiveMaterials(),
  ]);

  if (!serviced) notFound();

  const area = neighborhoodFor(zip);
  const featured = materials.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Mulch and rock delivery and installation",
    provider: {
      "@type": "LocalBusiness",
      name: "Preston Hollow Mulchachos",
      telephone: PHONE,
      areaServed: `${area}, Dallas, TX ${zip}`,
    },
    areaServed: { "@type": "PostalAddress", postalCode: zip, addressRegion: "TX" },
  };

  return (
    <main>
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12">
        <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
          {area} · {zip}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.03] sm:text-6xl">
          Mulch and rock delivery
          <br />
          <span className="text-[var(--clay)]">in {area}.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--ink-soft)]">
          Bulk mulch, decomposed granite, and river rock, delivered and spread
          right here in {zip}. A real price in about a minute, and you can book
          without waiting on a site visit.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a href="/estimate" className={CTA}>Price my beds</a>
          <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
            or call {PHONE}
          </a>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className={MONO + " text-xs text-[var(--clay)]"}>{s.n}</span>
              <h2 className="mt-3 text-xl font-semibold">{s.t}</h2>
              <p className="mt-2 text-[var(--ink-soft)]">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-extrabold">What we drop in {area}</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((m) => (
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

        <a href="/materials" className="mt-8 inline-block font-medium text-[var(--clay)]">
          See every material →
        </a>
      </section>

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
