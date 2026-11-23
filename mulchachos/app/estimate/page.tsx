import type { Metadata } from "next";
import Estimator from "@/components/Estimator";
import { showsPrice } from "@/lib/pricing";
import SiteHeader from "@/components/SiteHeader";
import {
  getActiveMaterials,
  getDiscountTiers,
  getPricingSettings,
} from "@/lib/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get an estimate",
  description:
    "Enter your bed sizes and pick a material. Mulch can be priced here " +
    "or we'll send you an estimate as soon as possible for bulk rock projects.",
  alternates: { canonical: "/estimate" },
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

  // Weed fabric rates never reach the browser either (fabricTiers is empty
  // below), so the estimator's total leaves fabric out.
  // Rock rates never reach the browser: the estimator only needs them for
  // the quantity, and we text rock prices instead of showing them.
  const strip = <T extends { category: string; cost_per_yard: number }>(m: T): T =>
    showsPrice(m.category) ? m : { ...m, cost_per_yard: 0 };
  const publicMaterials = materials.map(strip);
  const publicInitial = initial ? strip(initial) : initial;

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
          Measure your beds.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
          Rough measurements are fine.
        </p>
      </div>

      <Estimator materials={publicMaterials} settings={settings} tiers={tiers} fabricTiers={[]} initial={publicInitial} />
    </main>
  );
}
