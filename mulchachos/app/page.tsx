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
    title: "Measure online",
    body:
      "Length times width for each bed. Mulch is priced on the spot. " +
      "For rock, you see how much you need and we text you a price.",
  },
  {
    n: "02",
    title: "We text to confirm",
    body:
      "We go over the material and the amount, and pick a morning " +
      "that works for you.",
  },
  {
    n: "03",
    title: "Delivered and spread in one visit",
    body:
      "We dump it where it is easiest to work from and spread it the " +
      "same morning. Nothing sits in your driveway.",
  },
]

export default async function Home() {
  const [photos, testimonials] = await Promise.all([getJobPhotos(), getTestimonials()]);

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pt-14">
        <p className={MONO + " text-xs uppercase tracking-widest text-[var(--clay)]"}>
          Preston Hollow · Dallas
        </p>

        <h1 className="mt-4 max-w-3xl text-[2.6rem] font-extrabold leading-[1.02] sm:text-7xl sm:leading-[0.95]">
          Mulch and rock,
          <br />
          <span className="text-[var(--clay)]">delivered and spread.</span>
        </h1>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <a href="/estimate" className={CTA + " w-full text-center sm:w-auto"}>
            Get my estimate
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
          Recent jobs
        </h2>
        <p className="mb-8 mt-3 max-w-xl text-[var(--ink-soft)]">
          A few loads from around Dallas this season.
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
              Who shows up
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">
              Started with a wagon.
            </h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)]">
              Harrison started Mulchachos his freshman year of high school,
              inspired by the Boy Scouts&apos; mulch sales. Four years and
              hundreds of jobs later, there is a regular crew and our own
              truck. If something is not right when we leave, call and we
              come back.
            </p>
            <a href="/about" className="mt-6 inline-block font-medium text-[var(--clay)] underline underline-offset-4">
              Our story &rarr;
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
            <p className="mt-2 text-white/85">Measure your beds and see what you need.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <a href="/estimate" className="inline-block rounded-full bg-white px-7 py-4 text-center text-lg font-medium text-[var(--clay)] hover:bg-white/90">
              Get my estimate
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
