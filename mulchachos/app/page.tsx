import DumpReel from "@/components/DumpReel";
import VideoWall from "@/components/VideoWall";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPricingSettings } from "@/lib/materials";

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
  const settings = await getPricingSettings();

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-14">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          Fresh beds
          <br />
          <span className="text-[var(--clay)]">by the weekend.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-[var(--ink-soft)]">
          Bulk mulch, granite, and rock, delivered and spread
          across North Dallas. A real price in about a minute,
          not a callback in three days.
        </p>

        <a href="/estimate" className={CTA + " mt-9"}>
          Price my beds
        </a>
      </section>

      <DumpReel />

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
        <VideoWall />
      </section>

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
