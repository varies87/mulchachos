import MaterialSwatch from "@/components/MaterialSwatch";
import { getActiveMaterials, getPricingSettings } from "@/lib/materials";

// Revalidate hourly; admin saves call revalidatePath for anything sooner.
export const revalidate = 3600;

const STEPS = [
  {
    n: "01",
    title: "Measure your beds",
    body: "Length times width, in feet. Rough is fine — the estimator rounds to the quarter yard and we confirm on site.",
  },
  {
    n: "02",
    title: "We haul it in",
    body: "Delivery lands the morning of the job. Nothing sits in your driveway overnight.",
  },
  {
    n: "03",
    title: "We spread and edge",
    body: "Even three-inch depth, clean bed lines, walks blown off. You come home and it is done.",
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight"
        >
          Mulchachos
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#work" className="hidden text-[var(--muted)] hover:text-[var(--paper)] sm:block">
            Recent work
          </a>
          <a href="#about" className="hidden text-[var(--muted)] hover:text-[var(--paper)] sm:block">
            About
          </a>
          
            href="/estimate"
            className="rounded-sm bg-[var(--granite)] px-4 py-2 font-medium text-[#231A10] transition-colors hover:bg-[#D4B98F]"
          >
            Get a price
          </a>
        </nav>
      </header>

      {/* Hero. The thesis is the material itself, so the swatches are the hero. */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-10 sm:pt-20">
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          Fresh beds
          <br />
          by the weekend.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Bulk mulch, granite, and rock — delivered and spread across North
          Dallas. Pick a material and you will have a real price in about a
          minute, not a callback in three days.
        </p>

        <div className="mt-14">
          <p className="mb-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]">
            Start with a material
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {materials.map((m) => (
              <MaterialSwatch
                key={m.id}
                material={m}
                href={`/estimate?material=${m.slug}`}
                showPrice
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process. Numbered because the order genuinely matters to the customer. */}
      <section className="border-t border-white/10 bg-[var(--soil-raised)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--granite)]">
                {s.n}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
                {s.title}
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--muted)]">{s.body}</p>
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
            <article
              key={j.area}
              className="rounded-sm border border-white/10 bg-[var(--soil-raised)] p-6"
            >
              {/* Replace with a real photo of the finished job. */}
              <div className="mb-5 h-40 rounded-sm bg-[#2E241B]" aria-hidden="true" />
              <p className="font-[family-name:var(--font-display)] font-semibold">{j.area}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{j.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
            Who shows up
          </h2>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">
            I started Mulchachos in high school hauling mulch for neighbors and
            it turned into a real crew. We are local, we are insured, and the
            person who quotes your job is the person who runs it. If something
            is not right when we leave, you call me directly and we come back.
          </p>
          <p className="mt-6 font-[family-name:var(--font-display)] font-semibold">
            Harrison — owner, Preston Hollow Mulchachos LLC
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[var(--soil-raised)]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]">
            Service area
          </p>
          <p className="tnum mt-3 font-[family-name:var(--font-mono)] text-sm text-[var(--paper)]">
            {settings.service_zips.join("  ·  ")}
          </p>
          <p className="mt-8 text-sm text-[var(--muted)]">
            Preston Hollow Mulchachos LLC · Dallas, Texas
          </p>
        </div>
      </footer>
    </main>
  );
}
