import { getGoogleReviews, type GoogleReview } from "@/lib/google-reviews";
import Testimonials from "./Testimonials";
import type { Testimonial } from "@/lib/content";

const MONO = "font-[family-name:var(--font-mono)]";

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5 stars`} className="text-[var(--clay)]">
      {"★".repeat(n)}
      <span className="text-[var(--line-strong)]">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function ReviewCard({ r }: { r: GoogleReview }) {
  const name = r.authorUri ? (
    <a href={r.authorUri} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {r.author}
    </a>
  ) : (
    r.author
  );

  return (
    <figure className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6">
      <figcaption className="flex items-center gap-3">
        {r.photoUri && (
          // Google-hosted avatar. Plain <img>: no need to proxy it through next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photoUri} alt="" width={36} height={36} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
        )}
        <span className="text-sm">
          <span className="block font-medium text-[var(--ink)]">{name}</span>
          <span className="text-[var(--muted)]">{r.when}</span>
        </span>
      </figcaption>
      <div className="mt-3">
        <Stars n={r.rating} />
      </div>
      <blockquote className="mt-2 line-clamp-6 text-[var(--ink)]">{r.text}</blockquote>
      {r.reviewUri && (
        <a href={r.reviewUri} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 text-sm text-[var(--clay)] hover:underline">
          Read on Google
        </a>
      )}
    </figure>
  );
}

/**
 * Live Google reviews when they're configured and Google answers; otherwise the
 * testimonials entered in the admin panel (which hide themselves when empty).
 * Wrap in <Suspense> so a slow Google call never holds up the rest of the page.
 */
export default async function Reviews({ fallback }: { fallback: Testimonial[] }) {
  const google = await getGoogleReviews();
  if (!google) return <Testimonials items={fallback} />;

  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper-warm)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className={MONO + " text-xs uppercase tracking-widest text-[var(--muted)]"}>
          From the neighborhood
        </h2>

        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-extrabold">{google.rating.toFixed(1)}</span>
          <Stars n={Math.round(google.rating)} />
          {google.mapsUri ? (
            <a href={google.mapsUri} target="_blank" rel="noopener noreferrer" className="text-[var(--ink-soft)] hover:underline">
              {google.count} reviews on Google
            </a>
          ) : (
            <span className="text-[var(--ink-soft)]">{google.count} reviews on Google</span>
          )}
        </p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {google.reviews.map((r, i) => (
            <ReviewCard key={i} r={r} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="text-[var(--muted)]">Most relevant reviews, as selected by Google.</span>
          {/* Attribution Google's terms require when its content is shown off a Google map. */}
          <span style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400, fontSize: "1rem", color: "#5e5e5e", whiteSpace: "nowrap" }}>
            Google Maps
          </span>
        </div>
      </div>
    </section>
  );
}
