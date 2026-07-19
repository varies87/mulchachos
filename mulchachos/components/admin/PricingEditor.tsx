"use client";

import { useState, useTransition } from "react";
import { PricingSettings } from "@/lib/materials";
import { savePricing } from "@/app/admin/actions";

const input =
  "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm focus:border-[var(--clay)] focus:outline-none";

const FIELDS: { name: keyof PricingSettings; label: string; note: string; step?: string }[] = [
  { name: "labor_per_yard", label: "Spreading labor", note: "Per cubic yard" },
  { name: "delivery_fee", label: "Delivery", note: "Per trip" },
  { name: "yards_per_trip", label: "Yards per trip", note: "Above this, delivery charges again" },
  { name: "minimum_job", label: "Job minimum", note: "No job prices below this" },
  { name: "limited_access_surcharge", label: "Limited access", note: "Per yard, wheelbarrow haul" },
  { name: "edging_per_foot", label: "Edging", note: "Per linear foot", step: "0.01" },
  { name: "instant_book_yard_cap", label: "Instant book cap", note: "Bigger jobs get reviewed by hand" },
  { name: "deposit_rate", label: "Deposit rate", note: "0.5 means half up front", step: "0.05" },
];

export default function PricingEditor({ settings }: { settings: PricingSettings }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function submit(formData: FormData) {
    start(async () => {
      const res = await savePricing(formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form
      action={submit}
      className="rounded-sm border border-[var(--line)] bg-[var(--paper-warm)] p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]">
              {f.label}
            </label>
            <input
              name={f.name}
              type="number"
              step={f.step ?? "1"}
              min="0"
              defaultValue={String(settings[f.name])}
              className={input}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">{f.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]">
          Service ZIP codes
        </label>
        <input
          name="service_zips"
          defaultValue={settings.service_zips.join(", ")}
          className={input}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Comma separated. Anything outside these routes to a written estimate
          instead of instant booking.
        </p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-sm bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save pricing"}
        </button>
        {saved && <span className="text-sm text-[var(--success)]">Saved and live.</span>}
        {error && <span className="text-sm text-[var(--danger)]">{error}</span>}
      </div>
    </form>
  );
}
