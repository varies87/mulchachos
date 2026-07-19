import type { Metadata } from "next";
import SiteHeader, { PHONE } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPricingSettings } from "@/lib/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who we are",
  description:
    "Preston Hollow Mulchachos is a local mulch and rock crew " +
    "serving North Dallas.",
};

const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-6 py-3 " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

export default async function AboutPage() {
  const settings = await getPricingSettings();

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pb-16 pt-12">
        <h1 className="text-4xl font-extrabold sm:text-6xl">
          Who we are.
        </h1>

        <div className="mt-8 space-y-5 text-lg text-[var(--ink-soft)]">
          <p>
            Mulchachos started with one trailer and a few
            neighbors who needed mulch and could not get anyone
            to call them back. It turned into a real crew.
          </p>
          <p>
            We do one thing. We are not a full service landscape
            company squeezing your bed refresh in between bigger
            jobs, which is why we can price it in a minute
            instead of scheduling a visit to come look at it.
          </p>
          <p>
            The person who quotes your job is the person who
            runs it. If something is not right when we leave,
            you call me and we come back.
          </p>
          <p className="font-semibold text-[var(--ink)]">
            Harrison, owner
          </p>
        </div>

        <div className="mt-12 border-t border-[var(--line)] pt-10">
          <h2 className="text-xl font-semibold">
            Where we work
          </h2>
          <p className="mt-3 text-[var(--ink-soft)]">
            Preston Hollow, University Park, Highland Park,
            Bluffview, and the surrounding North Dallas
            neighborhoods.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/estimate" className={CTA}>
              Price my beds
            </a>
            
              href={"tel:" + PHONE}
              className="font-medium text-[var(--clay)]"
            >
              or call {PHONE}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
