"use client";

import { useMemo, useState } from "react";
import MaterialSwatch from "@/components/MaterialSwatch";
import { Material, PricingSettings } from "@/lib/materials";
import { buildQuote, money } from "@/lib/pricing";

const DEPTHS = [
  { in: 2, label: "Refresh", note: "Beds already have a base" },
  { in: 3, label: "Standard", note: "What most jobs use" },
  { in: 4, label: "New beds", note: "Bare soil, full coverage" },
];

export default function Estimator({
  materials,
  settings,
  initial,
}: {
  materials: Material[];
  settings: PricingSettings;
  initial: Material;
}) {
  const [material, setMaterial] = useState<Material>(initial);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState(3);
  const [zip, setZip] = useState("");
  const [limitedAccess, setLimitedAccess] = useState(false);
  const [edging, setEdging] = useState(false);

  const squareFeet = (Number(length) || 0) * (Number(width) || 0);
  const edgingFeet = edging ? 2 * ((Number(length) || 0) + (Number(width) || 0)) : 0;

  const quote = useMemo(
    () =>
      buildQuote({
        material,
        settings,
        squareFeet,
        depthInches: depth,
        zip,
        limitedAccess,
        edgingFeet,
      }),
    [material, settings, squareFeet, depth, zip, limitedAccess, edgingFeet]
  );

  const hasInput = squareFeet > 0;

  const field =
    "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-[family-name:var(--font-mono)] text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--clay)] focus:outline-none";
  const legend =
    "mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--muted)]";

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      {/* ------------------------------- inputs ------------------------------- */}
      <div>
        <fieldset className="border-t border-[var(--line)] pt-8">
          <legend className={legend}>Material</legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {materials.map((m) => (
              <MaterialSwatch
                key={m.id}
                material={m}
                selected={m.id === material.id}
                onSelect={setMaterial}
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{material.blurb}</p>
        </fieldset>

        <fieldset className="mt-12 border-t border-[var(--line)] pt-8">
          <legend className={legend}>Bed size</legend>
          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">Length (ft)</span>
              <input
                className={field}
                inputMode="decimal"
                value={length}
                onChange={(e) => setLength(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="40"
              />
            </label>
            <span className="pb-3 text-[var(--muted)]">×</span>
            <label className="flex-1">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">Width (ft)</span>
              <input
                className={field}
                inputMode="decimal"
                value={width}
                onChange={(e) => setWidth(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="6"
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Several beds? Add up the areas and enter the total as one rectangle.
            We confirm the real number on site.
          </p>
        </fieldset>

        <fieldset className="mt-12 border-t border-[var(--line)] pt-8">
          <legend className={legend}>Depth</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {DEPTHS.map((d) => (
              <button
                key={d.in}
                type="button"
                onClick={() => setDepth(d.in)}
                aria-pressed={depth === d.in}
                className={`rounded-sm border px-4 py-3 text-left transition-colors ${
                  depth === d.in
                    ? "border-[var(--clay)] bg-[var(--paper-warm)]"
                    : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                <span className="tnum font-[family-name:var(--font-mono)] text-sm text-[var(--clay)]">
                  {d.in}&quot;
                </span>
                <span className="mt-1 block font-medium">{d.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">{d.note}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-12 border-t border-[var(--line)] pt-8">
          <legend className={legend}>Site details</legend>
          <label className="mb-6 block max-w-[200px]">
            <span className="mb-1.5 block text-sm text-[var(--muted)]">ZIP code</span>
            <input
              className={field}
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              placeholder="75225"
            />
          </label>

          <Check
            checked={limitedAccess}
            onChange={setLimitedAccess}
            label="No truck access to the beds"
            note={`Gate is narrow or beds are behind the house. Adds $${settings.limited_access_surcharge}/yd³.`}
          />
          <Check
            checked={edging}
            onChange={setEdging}
            label="Edge and pull weeds first"
            note={`Clean bed lines before mulch goes down. $${settings.edging_per_foot}/ft.`}
          />
        </fieldset>
      </div>

      {/* ------------------------------- quote -------------------------------- */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-sm border border-[var(--line)] bg-[var(--paper-warm)] p-6">
          <p className={legend}>Your estimate</p>

          {!hasInput ? (
            <p className="text-[var(--muted)]">
              Enter your bed length and width and the price builds here as you type.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 border-b border-[var(--line)] pb-5">
                <span className="tnum font-[family-name:var(--font-display)] text-5xl font-extrabold">
                  {quote.yards.toFixed(2)}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
                  yd³ of {material.name.toLowerCase()}
                </span>
              </div>

              <dl className="space-y-3 py-5 text-sm">
                {quote.lineItems.map((li) => (
                  <div key={li.label} className="flex justify-between gap-4">
                    <dt>
                      {li.label}
                      {li.detail && (
                        <span className="mt-0.5 block text-xs text-[var(--muted)]">
                          {li.detail}
                        </span>
                      )}
                    </dt>
                    <dd className="tnum font-[family-name:var(--font-mono)] whitespace-nowrap">
                      {money(li.amount)}
                    </dd>
                  </div>
                ))}
              </dl>

              {quote.minimumApplied && (
                <p className="mb-4 rounded-sm bg-[var(--paper-deep)] p-3 text-xs leading-relaxed text-[var(--muted)]">
                  Job minimum of {money(settings.minimum_job)} applies. Adding beds
                  or edging gets you more for the same trip.
                </p>
              )}

              <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-5">
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  Total
                </span>
                <span className="tnum font-[family-name:var(--font-mono)] text-2xl">
                  {money(quote.total)}
                </span>
              </div>

              {/* The branch. Deterministic jobs book themselves; the rest come to you. */}
              {quote.instantBookable ? (
                <div className="mt-6">
                  <a
                    href="/book"
                    className="block rounded-sm bg-[var(--clay)] px-5 py-3.5 text-center font-medium text-white transition-colors hover:bg-[var(--clay-deep)]"
                  >
                    Book this job
                  </a>
                  <p className="mt-3 text-center text-xs leading-relaxed text-[var(--muted)]">
                    {money(quote.deposit)} deposit now, balance when the job is
                    done. Price is held unless the beds measure more than
                    entered — we call before proceeding.
                  </p>
                  <a
                    href="/request-estimate"
                    className="mt-4 block text-center text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]"
                  >
                    Have us look at it first
                  </a>
                </div>
              ) : (
                <div className="mt-6">
                  <a
                    href="/request-estimate"
                    className="block rounded-sm border border-[var(--clay)] px-5 py-3.5 text-center font-medium text-[var(--clay)] transition-colors hover:bg-[var(--clay)] hover:text-white"
                  >
                    Request a written estimate
                  </a>
                  <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    {quote.reviewReasons.map((r) => (
                      <li key={r}>— {r}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                    Send photos and we return an itemized quote by email, usually
                    same day.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
  note,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  note: string;
}) {
  return (
    <label className="mb-4 flex cursor-pointer gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--clay)]"
      />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-[var(--muted)]">{note}</span>
      </span>
    </label>
  );
}
