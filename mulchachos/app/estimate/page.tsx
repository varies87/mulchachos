import type { Metadata } from "next";
import Estimator from "@/components/Estimator";
import SiteHeader from "@/components/SiteHeader";
import {
  getActiveMaterials,
  getDiscountTiers,
  getPricingSettings,
} from "@/lib/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Price your beds",
  description:
    "Enter your bed sizes and pick a material for an itemized " +
    "mulch or rock estimate in about a minute.",
};

export default async function EstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string }>;
}) {
  const [{ material }, materials, settings, tiers] = await Promise.all([
    searchParams,
    getActiveMaterials(),
    getPricingSettings(),
    getDiscountTiers(),
  ]);

  const initial =
    materials.find((m) => m.slug === material) ?? materials[0];

  if (!initial) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-extrabold">No materials yet</h1>
          <p className="mt-3 text-[var(--ink-soft)]">
            Add one in the admin panel and this page starts working.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-10">
        <h1 className="max-w-2xl text-4xl font-extrabold sm:text-6xl">
          Price your beds.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
          Rough measurements are fine. You are billed for the volume
          we actually spread, at the rate quoted here.
        </p>
      </div>

      <Estimator materials={materials} settings={settings} tiers={tiers} initial={initial} />
    </main>
  );
}
