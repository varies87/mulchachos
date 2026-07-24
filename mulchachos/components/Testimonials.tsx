import type { Testimonial } from "@/lib/content";

const MONO = "font-[family-name:var(--font-mono)]";

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5`} className="text-[var(--clay)]">
      {"★".repeat(n)}
      <span className="text-[var(--line-strong)]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

/**
 * Real customer quotes. Renders nothing until the owner adds some in the admin
 * panel — an empty testimonials rail is worse than none, and invented ones
 * would be dishonest.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className={MONO + " text-xs uppercase tracking-widest text-[var(--muted)]"}>
          From the neighborhood
        </h2>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6">
              <Stars n={t.rating} />
              <blockquote className="mt-3 text-[var(--ink)]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--ink-soft)]">{t.author}</span>
                {t.neighborhood ? ` · ${t.neighborhood}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
