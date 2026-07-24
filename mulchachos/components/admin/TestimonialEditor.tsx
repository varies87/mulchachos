"use client";

import { useState, useTransition } from "react";
import { Testimonial } from "@/lib/content";
import { saveTestimonial, deleteTestimonial } from "@/app/admin/actions";

const blank: Partial<Testimonial> = {
  author: "",
  neighborhood: "",
  quote: "",
  rating: 5,
  sort_order: 0,
  active: true,
};

const input =
  "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--clay)] focus:outline-none";
const label = "mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]";

export default function TestimonialEditor({
  testimonial,
  isNew = false,
  onDone,
}: {
  testimonial?: Testimonial;
  isNew?: boolean;
  onDone?: () => void;
}) {
  const t = testimonial ?? (blank as Testimonial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    start(async () => {
      const res = await saveTestimonial(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setError("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onDone?.();
      }
    });
  }

  return (
    <form action={submit} className="rounded-sm border border-[var(--line)] bg-[var(--paper-warm)] p-5">
      <input type="hidden" name="id" value={isNew ? "" : t.id} />

      <div className="space-y-4">
        <div>
          <label className={label}>What they said</label>
          <textarea name="quote" defaultValue={t.quote} required rows={3} className={input} placeholder="Beds looked brand new by the weekend. Crew swept the whole driveway on the way out." />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Name</label>
            <input name="author" defaultValue={t.author} required className={input} placeholder="First name, last initial" />
          </div>
          <div>
            <label className={label}>Neighborhood</label>
            <input name="neighborhood" defaultValue={t.neighborhood ?? ""} className={input} placeholder="Preston Hollow" />
          </div>
          <div>
            <label className={label}>Stars</label>
            <select name="rating" defaultValue={String(t.rating)} className={input}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="w-28">
            <label className={label}>Display order</label>
            <input name="sort_order" type="number" defaultValue={t.sort_order} className={input} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={t.active} className="h-4 w-4 accent-[var(--clay)]" />
            Show on the site
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button disabled={pending} className="rounded-sm bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "Saving…" : isNew ? "Add testimonial" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-[var(--success)]">Saved and live.</span>}
          {error && <span className="text-sm text-[var(--danger)]">{error}</span>}

          {!isNew && (
            <button type="button" onClick={() => { if (confirm(`Delete this quote from ${t.author}?`)) start(() => deleteTestimonial(t.id).then(() => {})); }} className="ml-auto text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--danger)]">
              Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
