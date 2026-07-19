import type { Metadata } from "next";
import Estimator from "@/components/Estimator";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

export const dynamic = "force-dynamic";

const LOGO = "font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight";

export const metadata: Metadata = {
  title: "Price your beds",
  description:
    "Enter your bed size and pick a material for an itemized mulch or rock price in about a minute. Preston Hollow, University Park, and North Dallas.",
};

export default async function EstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string }>;
}) {
  const [{ material }, materials, settings] = await Promise.all([
    searchParams,
    getActiveMaterials(),
    getPricingSettings(),
  ]);
  const initial = materials.find((m) => m.slug === material) ?? materials[0];

  if (!initial) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
          No materials yet
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Add one in the admin panel and this page starts working.
        </p>
      </main>
    );
  }

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className={LOGO}>Mulchachos</a>
        <a href="/" className="text-sm text-[var(--muted)]">Back to home</a>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-6 sm:pt-12">
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.0] tracking-tight sm:text-6xl">
          Price your beds.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Four questions. The number updates as you answer them, and it is the
          number we honor when the truck shows up.
        </p>
      </div>

      <Estimator materials={materials} settings={settings} initial={initial} />
    </main>
  );
}
