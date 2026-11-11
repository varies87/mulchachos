import Image from "next/image";
import DumpReel from "@/components/DumpReel";
import JobGallery from "@/components/JobGallery";
import Testimonials from "@/components/Testimonials";
import ServiceArea from "@/components/ServiceArea";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getJobPhotos, getTestimonials } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Cached and refreshed every 5 minutes; admin saves refresh it immediately.
export const revalidate = 300;

const MONO = "font-[family-name:var(--font-mono)]";

const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-7 py-4 " +
  "text-lg font-medium text-white hover:bg-[var(--clay-deep)]";

const STEPS = [
  {
    n: "01",
    title: "Price it online",
    body:
      "Measure your beds, length times width. You get an itemized " +
      "price in about a minute. No account, nothing to pay now.",
  },
  {
    n: "02",
    title: "We confirm and schedule",
    body:
      "A real person calls or texts to confirm the material and " +
      "pick a morning. Delivery lands the day of the job.",
  },
  {
    n: "03",
    title: "Spread the same day",
    body:
      "Even depth, clean bed lines, driveway swept before we leave. " +
      "You pay for what actually goes down.",
  },
]

export default async function Home() {
  const [photos, testimonials] = await Promise.all([getJobPhotos(), getTestimonials()]);

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

      <section className="border-b border-[var(--line)] bg-[var(--paper-warm)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-extrabold">How it works</h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className={MONO + " text-xs text-[var(--clay)]"}>{s.n}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-[var(--ink-soft)]">{s.body}</p>
              </div>
            ))}
          </div>
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

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <Image
            src="/crew.jpg"
            alt="The Preston Hollow Mulchachos crew in uniform with rakes, shovels, and a wheelbarrow"
            width={1080}
            height={1350}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full rounded-xl"
          />
          <div>
            <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
              The crew
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">
              Meet the crew.
            </h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)]">
              The person who quotes your job is the person who runs it. If
              something is not right when we leave, you call and we come back.
            </p>
            <a href="/about" className="mt-6 inline-block font-medium text-[var(--clay)] underline underline-offset-4">
              Who we are &rarr;
            </a>
          </div>
        </div>
      </section>

      <Testimonials items={testimonials} />

      <ServiceArea />

      <section className="bg-[var(--clay)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Ready for fresh beds?</h2>
            <p className="mt-2 text-white/85">Get your price in about a minute.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <a href="/estimate" className="inline-block rounded-full bg-white px-7 py-4 text-center text-lg font-medium text-[var(--clay)] hover:bg-white/90">
              Price my beds
            </a>
            <a href="tel:214-708-7503" className="text-center font-medium text-white underline underline-offset-4">
              or call 214-708-7503
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
