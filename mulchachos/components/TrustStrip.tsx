const MONO = "font-[family-name:var(--font-mono)]";

// Every line here is a promise the rest of the site already makes, stated
// plainly. Nothing here claims anything the business has not verified — add
// "Licensed and insured" only once that is true for Mulchachos.
const POINTS: { head: string; body: string }[] = [
  {
    head: "Billed for what we spread",
    body: "The estimate is a plan. You pay for the volume that actually goes down, at the same per-yard rate.",
  },
  {
    head: "Delivered and spread, same day",
    body: "Material lands the morning of the job and goes down that day. Nothing sits in your driveway overnight.",
  },
  {
    head: "A real price in a minute",
    body: "Measure your beds and see an itemized number now, not a callback in three days.",
  },
  {
    head: "Local, all over DFW",
    body: "We run out of Northwest Dallas and deliver across the metroplex — we know the neighborhoods, the gates, and the drop spots.",
  },
];

export default function TrustStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((p, i) => (
          <div key={p.head}>
            <span className={MONO + " text-xs text-[var(--clay)]"}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-semibold">{p.head}</h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
