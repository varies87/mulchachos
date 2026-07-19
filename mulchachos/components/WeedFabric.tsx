"use client";

import { useEffect, useRef } from "react";

const POINTS = [
  {
    title: "Rock is a one time job",
    body:
      "Gravel does not break down, so whatever comes up through it stays. Fabric underneath is the difference between a bed that looks new in five years and one you are pulling weeds out of by June.",
  },
  {
    title: "Keeps your stone out of the dirt",
    body:
      "Without a barrier, rock works its way down into the soil and you lose depth every season. Fabric holds the layer where you put it.",
  },
  {
    title: "Goes down before the material",
    body:
      "Laid, cut around your plants, and pinned the same day we deliver. It is the one thing that cannot be added later without pulling everything back up.",
  },
];

const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-6 py-3.5 " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

const PICK = "mt-8 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-5 ";

/**
 * Two modes. On /materials it is a pitch that links to the estimator.
 * Inside the estimator, pass selected + onSelect and the closing box becomes
 * a live control, so someone convinced by the video can act right there
 * instead of scrolling back up to the checkbox.
 */
export default function WeedFabric({
  selected,
  onSelect,
  compact = false,
}: {
  selected?: boolean;
  onSelect?: (v: boolean) => void;
  compact?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const interactive = typeof onSelect === "function";

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src && v.dataset.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px", threshold: 0.2 }
    );

    io.observe(v);
    return () => io.disconnect();
  }, []);

  const video = (
    <video ref={ref} data-src="/video/weed-fabric.mp4" poster="/video/weed-fabric.jpg" muted loop playsInline preload="none" aria-label="Heavy duty weed fabric being laid before rock goes down" className="mx-auto w-full max-w-[340px] rounded-xl bg-[var(--paper-deep)] shadow-sm lg:max-w-none" />
  );

  const head = compact
    ? "mt-3 text-2xl font-extrabold"
    : "mt-3 text-4xl font-extrabold leading-tight sm:text-5xl";

  const body = (
    <div>
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--clay)]">
        Do it once
      </p>

      <h2 className={head}>
        Heavy duty weed fabric, under every rock job.
      </h2>

      <p className="mt-4 max-w-xl text-lg text-[var(--ink-soft)]">
        If you are putting stone down, put fabric under it. It is the
        cheapest part of the job and the part you will be glad about
        three summers from now.
      </p>

      <dl className="mt-8 space-y-5">
        {POINTS.map((p) => (
          <div key={p.title} className="border-l-2 border-[var(--line-strong)] pl-5">
            <dt className="font-semibold">{p.title}</dt>
            <dd className="mt-1 text-[var(--ink-soft)]">{p.body}</dd>
          </div>
        ))}
      </dl>

      {interactive && (
        <label className={PICK + (selected ? "border-[var(--clay)] bg-[var(--paper-warm)]" : "border-[var(--line-strong)]")}>
          <input type="checkbox" checked={!!selected} onChange={(e) => onSelect(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--clay)]" />
          <span>
            <span className="block font-semibold">
              {selected ? "Added to your estimate" : "Add weed fabric to my estimate"}
            </span>
            <span className="mt-1 block text-sm text-[var(--ink-soft)]">
              {selected ? "It is priced in above. Untick to remove it." : "Your total updates as soon as you tick this."}
            </span>
          </span>
        </label>
      )}

      {!interactive && (
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <a href="/estimate" className={CTA}>
            Add it to your estimate
          </a>
          <span className="text-sm text-[var(--muted)]">
            From $0.50 per sq ft on larger beds
          </span>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--paper-warm)] p-6">
        <div className="grid gap-8 sm:grid-cols-[240px_1fr] sm:items-start">
          {video}
          {body}
        </div>
      </div>
    );
  }

  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[420px_1fr] lg:gap-16">
        {video}
        {body}
      </div>
    </section>
  );
}
