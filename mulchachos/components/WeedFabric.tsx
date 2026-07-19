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

/**
 * Fabric is the highest margin item we sell and it can only be added at
 * install time, so it gets a full band rather than a checkbox.
 */
export default function WeedFabric() {
  const ref = useRef<HTMLVideoElement>(null);

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

  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[420px_1fr] lg:gap-16">
        <video ref={ref} data-src="/video/weed-fabric.mp4" poster="/video/weed-fabric.jpg" muted loop playsInline preload="none" aria-label="Heavy duty weed fabric being laid before rock goes down" className="mx-auto w-full max-w-[380px] rounded-xl bg-[var(--paper-deep)] shadow-sm lg:max-w-none" />

        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--clay)]">
            Do it once
          </p>

          <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
            Heavy duty weed fabric, under every rock job.
          </h2>

          <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
            If you are putting stone down, put fabric under it. It is the
            cheapest part of the job and the part you will be glad about
            three summers from now.
          </p>

          <dl className="mt-10 space-y-6">
            {POINTS.map((p) => (
              <div key={p.title} className="border-l-2 border-[var(--line-strong)] pl-5">
                <dt className="font-semibold">{p.title}</dt>
                <dd className="mt-1 text-[var(--ink-soft)]">{p.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a href="/estimate" className={CTA}>
              Add it to your estimate
            </a>
            <span className="text-sm text-[var(--muted)]">
              From $0.50 per sq ft on larger beds
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
