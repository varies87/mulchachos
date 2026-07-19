import MaterialSwatch from "@/components/MaterialSwatch";
import DumpReel from "@/components/DumpReel";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

// Rendered per request so the build never touches the database.
export const dynamic = "force-dynamic";

const PHONE = "214-708-7503";

const NAVLINK = "text-[var(--ink-soft)] hover:text-[var(--clay)]";
const CTA =
  "rounded-full bg-[var(--clay)] px-5 py-2.5 font-medium text-white " +
  "transition-colors hover:bg-[var(--clay-deep)]";

const STEPS = [
  {
    n: "01",
    title: "Measure your beds",
    body:
      "Length times width, in feet. Rough is fine. The estimator rounds " +
      "to the quarter yard and we confirm on site.",
  },
  {
    n: "02",
    title: "We haul it in",
    body:
      "Delivery lands the morning of the job. Nothing sits in your " +
      "driveway overnight.",
  },
  {
    n: "03",
    title: "We spread and edge",
    body:
      "Even three-inch depth, clean bed lines, walks blown off. You come " +
      "home and it is done.",
  },
];

const RECENT = [
  { area: "Preston Hollow", detail: "14 yd³ black hardwood, front and side beds" },
  { area: "University Park", detail: "6 yd³ cedar, raised vegetable boxes" },
  { area: "Bluffview", detail: "9 yd³ decomposed granite, side yard path" },
];

export default async function Home() {
  const [materials, settings] = await Promise.all([
    getActiveMaterials(),
    getPricingSettings(),
  ]);

  return (
    <main>
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <a href="/" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Preston Hollow Mulchachos"
              className="h-14 w-auto"
            />
          </a>
          <nav className="ml-auto flex items-center gap-6 text-sm">
            <a href="#work" className={"hidden sm:block " + NAVLINK}>
              Recent work
            </a>
            <a href="#about" className={"hidden sm:block " + NAVLINK}>
              About
            </a>
            <a
              href={"tel:" + PHONE}
              className={"hidden font-medium md:block " + NAVLINK}
            >
              {PHONE}
            </a>
            <a href="/estimate" className={CTA}>
              Get a price
            </a>
          </nav>
        </div>
      </header>

      {/* The material itself is the thesis, so the swatches are the hero. */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-14 sm:pt-20">
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          Fresh beds
          <br />
          <span className="text-[var(--clay)]">by the weekend.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
          Bulk mulch, granite, and rock, delivered and spread across North
          Dallas. Pick a material and you will have a real price in about a
          minute, not a callback in three days.
        </p>

      </section>

      <DumpReel />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div>
          <p className="mb-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]">
            Start with a material
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {materials.map((m) => (
              <MaterialSwatch
                key={m.id}
                material={m}
                href={"/estimate?material=" + m.slug}
                showPrice
              />
            ))}
          </div>
        </div>
      </section>

      {/* Numbered because the order genuinely matters to the customer. */}
      <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--clay)]">
                {s.n}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
                {s.title}
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--ink-soft)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
          Recent work
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {RECENT.map((j) => (
            <article key={j.area}>
              {/* Replace with a real photo of the finished job. */}
              <div
                className="h-48 rounded-lg bg-[var(--paper-deep)]"
                aria-hidden="true"
              />
              <p className="mt-4 font-[family-name:var(--font-display)] font-semibold">
                {j.area}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                {j.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="border-y border-[var(--line)] bg-[var(--paper-warm)]"
      >
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
            Who shows up
          </h2>
          <p className="mt-6 leading-relaxed text-[var(--ink-soft)]">
            I started Mulchachos in high school hauling mulch for neighbors and
            it turned into a real crew. We are local, and the person who quotes
            your job is the person who runs it. If something is not right when
            we leave, you call me directly and we come back.
          </p>
          <p className="mt-6 font-[family-name:var(--font-display)] font-semibold">
            Harrison, owner
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <a
              href={"tel:" + PHONE}
              className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[var(--clay)]"
            >
              {PHONE}
            </a>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Preston Hollow Mulchachos LLC, Dallas, Texas
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]">
              Service area
            </p>
            <p className="tnum mt-3 max-w-sm font-[family-name:var(--font-mono)] text-sm leading-relaxed">
              {settings.service_zips.join("  ·  ")}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
