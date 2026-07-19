import { getAllMaterials, getPricingSettings } from "@/lib/materials";
import MaterialEditor from "@/components/admin/MaterialEditor";
import PricingEditor from "@/components/admin/PricingEditor";
import AddMaterial from "@/components/admin/AddMaterial";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [materials, settings] = await Promise.all([
    getAllMaterials(),
    getPricingSettings(),
  ]);

  const hidden = materials.filter((m) => !m.active).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
          Pricing
        </h1>
        <p className="mb-5 mt-2 text-sm text-[var(--muted)]">
          These feed every quote on the site. Changes go live as soon as you save.
        </p>
        <PricingEditor settings={settings} />
      </section>

      <section className="mt-16">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
            Materials
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {materials.length - hidden} live
            {hidden > 0 && `, ${hidden} hidden`}
          </p>
        </div>

        <AddMaterial />

        <div className="mt-6 space-y-4">
          {materials.map((m) => (
            <div key={m.id} className={m.active ? "" : "opacity-55"}>
              <MaterialEditor material={m} />
            </div>
          ))}
        </div>

        {materials.length === 0 && (
          <p className="rounded-sm border border-dashed border-white/15 p-10 text-center text-[var(--muted)]">
            No materials yet. Add your first one and it appears on the home page
            and the estimator immediately.
          </p>
        )}
      </section>
    </main>
  );
}
