"use client";

import { useState, useTransition } from "react";
import { addManualOrder } from "@/app/admin/actions";

const input =
  "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--clay)] focus:outline-none";
const label = "mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]";

export default function AddOrder() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-sm border border-dashed border-[var(--line-strong)] px-5 py-4 text-sm text-[var(--muted)] transition-colors hover:border-[var(--clay)] hover:text-[var(--ink)]">
        Log an order (text, phone, in person)
      </button>
    );
  }

  function submit(formData: FormData) {
    start(async () => {
      const res = await addManualOrder(formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        setOpen(false);
      }
    });
  }

  return (
    <form action={submit} className="rounded-sm border border-[var(--line)] bg-[var(--paper-warm)] p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Name</label>
          <input name="name" required className={input} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input name="phone" type="tel" className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input name="email" type="email" className={input} placeholder="ties repeat customers together" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Material</label>
          <input name="material_name" className={input} placeholder="Cedar mulch" />
        </div>
        <div>
          <label className={label}>Job total ($)</label>
          <input name="final_total" type="number" step="0.01" min="0" className={input} placeholder="0" />
        </div>
        <div>
          <label className={label}>Came in by</label>
          <select name="source" defaultValue="text" className={input}>
            <option value="text">Text</option>
            <option value="phone">Phone</option>
            <option value="in person">In person</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>Notes</label>
        <input name="notes" className={input} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button disabled={pending} className="rounded-sm bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {pending ? "Saving…" : "Save order"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">
          Cancel
        </button>
        {error && <span className="text-sm text-[var(--danger)]">{error}</span>}
      </div>
    </form>
  );
}
