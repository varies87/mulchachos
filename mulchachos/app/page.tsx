import DumpReel from "@/components/DumpReel";
import JobGallery from "@/components/JobGallery";
import TrustStrip from "@/components/TrustStrip";
import Testimonials from "@/components/Testimonials";
import ServiceArea from "@/components/ServiceArea";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPricingSettings } from "@/lib/materials";
import { getJobPhotos, getTestimonials } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const MONO = "font-[family-name:var(--font-mono)]";

const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-7 py-4 " +
  "text-lg font-medium text-white hover:bg-[var(--clay-deep)]";

const STEPS = [
  {
    n: "01",
    title: "Measure your beds",
    body:
      "Length times width, in feet. Rough is fine. We confirm " +
      "the real number on site.",
  },
  {
    n: "02",
    title: "We haul it in",
    body:
      "Delivery lands the morning of the job. Nothing sits in " +
      "your driveway overnight.",
  },
  {
    n: "03",
    title: "We spread and edge",
    body:
      "Even depth, clean bed lines, walks blown off. You come " +
      "home and it is done.",
  },
];

export default async function Home() {
  const [settings, photos, testimonials] = await Promise.all([
    getPricingSettings(),
    getJobPhotos(),
    getTestimonials(),
  ]);

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pt-14">
        <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
          Dallas–Fort Worth · mulch &amp; rock delivery
        </p>

        <h1 className="mt-4 max-w-3xl text-[2.6rem] font-extrabold leading-[1.02] sm:text-7xl sm:leading-[0.95]">
          Fresh beds
          <br />
          <span className="text-[var(--clay)]">by the weekend.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-[var(--ink-soft)]">
          Bulk mulch, rock, and decomposed granite — delivered{" "}
          <em>and</em> spread, anywhere in DFW. Price your beds online in
          about a minute. No account, nothing to pay now.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <a href="/estimate" className={CTA + " w-full text-center sm:w-auto"}>
            Price my beds
          </a>
          <a href="tel:214-708-7503" className="text-center text-base font-medium text-[var(--clay)] sm:text-left">
            or call 214-708-7503
          </a>
        </div>
      </section>

      <DumpReel />

      <TrustStrip />

      <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className={MONO + " text-xs text-[var(--clay)]"}>
                {s.n}
              </span>
              <h2 className="mt-3 text-xl font-semibold">
                {s.title}
              </h2>
              <p className="mt-2 text-[var(--ink-soft)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-extrabold">
          Deliveries this season
        </h2>
        <p className="mb-8 mt-3 max-w-xl text-[var(--ink-soft)]">
          Every load goes down the same way. Dumped where you
          want it, spread the same day, driveway swept before
          we leave.
        </p>
        <JobGallery photos={photos} />
      </section>

      <Testimonials items={testimonials} />

      <ServiceArea />

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
