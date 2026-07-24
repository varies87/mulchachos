import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RequestEstimateForm from "@/components/RequestEstimateForm";
import {
  getActiveMaterials,
  getDiscountTiers,
  getFabricTiers,
  getPricingSettings,
} from "@/lib/materials";
import { buildQuote, money } from "@/lib/pricing";
import { decodeQuote } from "@/lib/quote-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send your request",
  description:
    "Send your beds, a few photos, and the times that work. No payment and " +
    "nothing booked — we call or text to confirm the material and volume first.",
};

const MONO = "font-[family-name:var(--font-mono)]";

export default async function RequestEstimatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, materials, settings, tiers, fabricTiers] = await Promise.all([
    searchParams,
    getActiveMaterials(),
    getPricingSettings(),
    getDiscountTiers(),
    getFabricTiers(),
  ]);

  const state = decodeQuote(params);
  const material =
    materials.find((m) => m.slug === state.material) ?? materials[0] ?? null;

  const squareFeet = state.beds.reduce((sum, b) => sum + b.length * b.width, 0);
  const edgingFeet = state.edging
    ? state.beds.reduce((sum, b) => sum + 2 * (b.length + b.width), 0)
    : 0;

  const quote =
    material && squareFeet > 0
      ? buildQuote({
          material,
          settings,
          tiers,
          fabricTiers,
          weedFabric: state.fabric,
          squareFeet,
          depthInches: state.depth,
          zip: state.zip,
          limitedAccess: state.access,
          edgingFeet,
        })
      : null;

  const hasQuote = !!(material && quote && squareFeet > 0);

  const summary = hasQuote
    ? {
        materialName: material!.name,
        yards: quote!.billedYards,
        total: quote!.total,
        note:
          `${quote!.billedYards.toFixed(2)} yd³ of ${material!.name}` +
          `, about ${money(quote!.total)}` +
          (state.fabric ? ", with weed fabric" : ""),
      }
    : null;

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pb-4 pt-12">
        <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
          No commitment
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold sm:text-5xl">
          Send your request.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
          {hasQuote
            ? "Your estimate is attached below. Send it over with a couple of photos and we'll call or text to confirm the material and volume. Nothing is booked or charged."
            : "Tell us about the beds and add a couple of photos. We'll call or text to confirm the material and volume — nothing is booked or charged until you say go."}
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <RequestEstimateForm
          summary={summary}
          record={{
            material_slug: hasQuote ? material!.slug : "",
            material_name: hasQuote ? material!.name : "",
            square_feet: squareFeet || 0,
            depth_inches: state.depth,
            weed_fabric: state.fabric,
            limited_access: state.access,
            edging: state.edging,
            estimated_total: hasQuote ? quote!.total : 0,
            quote_note: summary?.note ?? "",
            zip: state.zip,
          }}
        />
      </div>

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
