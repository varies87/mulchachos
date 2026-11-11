import { getAllTestimonials } from "@/lib/content";
import TestimonialEditor from "@/components/admin/TestimonialEditor";
import AddTestimonial from "@/components/admin/AddTestimonial";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();
  const live = testimonials.filter((t) => t.active).length;
  const hidden = testimonials.length - live;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
          Testimonials
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {live} live{hidden > 0 ? `, ${hidden} hidden` : ""}
        </p>
      </div>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Real quotes from customers. They show on the home page as soon as they
        are live. Add only ones you actually received.
      </p>

      <AddTestimonial />

      <div className="mt-6 space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className={t.active ? "" : "opacity-55"}>
            <TestimonialEditor testimonial={t} />
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <p className="mt-6 rounded-sm border border-dashed border-[var(--line)] p-10 text-center text-[var(--muted)]">
          No testimonials yet. The section stays hidden on the home page until
          you add a real one.
        </p>
      )}
    </main>
  );
}
