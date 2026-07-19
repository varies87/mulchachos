"use client";

import { useMemo, useState } from "react";
import { Material, PricingSettings } from "@/lib/materials";
import { buildQuote, money } from "@/lib/pricing";

const MONO = "font-[family-name:var(--font-mono)]";

const DEPTHS = [
  { in: 2, label: "Topping up", hint: "Still has mulch" },
  { in: 3, label: "Standard", hint: "Most jobs" },
  { in: 4, label: "Bare soil", hint: "Starting over" },
];

const CARD = "rounded-lg border px-4 py-3 text-left";
const ON = " border-[var(--clay)] bg-[var(--paper-warm)]";
const OFF = " border-[var(--line)] hover:border-[var(--line-strong)]";

const FIELD =
  "w-full rounded-lg border border-[var(--line)] " +
  "px-3 py-2.5 focus:border-[var(--clay)] focus:outline-none " +
  MONO;

const LABEL = "mb-1.5 block text-sm text-[var(--muted)]";
const LINK = "text-sm font-medium text-[var(--clay)]";

const PILL =
  "block rounded-full bg-[var(--clay)] px-5 py-3.5 " +
  "text-center font-medium text-white hover:bg-[var(--clay-deep)]";

const BAR =
  "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] " +
  "bg-white/95 px-5 py-3 backdrop-blur lg:hidden";

const PANEL =
  "rounded-xl border border-[var(--line)] " +
  "bg-[var(--paper-warm)] p-6";

const TOTALROW =
  "flex items-baseline justify-between " +
  "border-t border-[var(--line)] pt-5";

const ITEMS =
  "space-y-3 border-t border-[var(--line)] py-5 text-sm";

const NOTE =
  "mt-4 rounded-lg bg-[var(--paper-deep)] p-4 text-xs " +
  "leading-relaxed text-[var(--ink-soft)]";

type Bed = { id: number; length: string; width: string };

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
  const [beds, setBeds] = useState<Bed[]>([
    { id: 1, length: "", width: "" },
  ]);
  const [depth, setDepth] = useState(3);
  const [zip, setZip] = useState("");
  const [extras, setExtras] = useState(false);
  const [access, setAccess] = useState(false);
  const [edging, setEdging] = useState(false);

  const squareFeet = beds.reduce(
    (s, b) => s + (Number(b.length) || 0) * (Number(b.width) || 0),
    0
  );

  const edgingFeet = edging
    ? beds.reduce(
        (s, b) =>
          s + 2 * ((Number(b.length) || 0) + (Number(b.width) || 0)),
        0
      )
    : 0;

  const quote = useMemo(
    () =>
      buildQuote({
        material,
        settings,
        squareFeet,
        depthInches: depth,
        zip,
        limitedAccess: access,
        edgingFeet,
      }),
    [material, settings, squareFeet, depth, zip, access, edgingFeet]
  );

  const ready = squareFeet > 0;
  const perYard = material.cost_per_yard + settings.labor_per_yard;

  function edit(id: number, key: "length" | "width", v: string) {
    const clean = v.replace(/[^\d.]/g, "");
    setBeds(beds.map((b) => (b.id === id ? { ...b, [key]: clean } : b)));
  }

  function addBed() {
    setBeds([...beds, { id: Date.now(), length: "", width: "" }]);
  }

  function dropBed(id: number) {
    setBeds(beds.filter((b) => b.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-40 lg:pb-24">
      <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <Step n="1" title="Measure your beds" />
          <p className="-mt-2 mb-5 text-[var(--ink-soft)]">
            Pace them off or eyeball them. Rough numbers are fine,
            because you are billed for the volume actually spread,
            not for this estimate.
          </p>

          <div className="space-y-3">
            {beds.map((b, i) => (
              <BedRow
                key={b.id}
                bed={b}
                index={i}
                canRemove={beds.length > 1}
                onEdit={edit}
                onRemove={dropBed}
              />
            ))}
          </div>

          <button type="button" onClick={addBed} className={"mt-4 " + LINK}>
            Add another bed
          </button>

          {ready && (
            <p className={"mt-4 text-sm text-[var(--muted)] " + MONO}>
              {squareFeet.toLocaleString()} sq ft total
            </p>
          )}

          <Step n="2" title="Which material?" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {materials.map((m) => (
              <Swatch
                key={m.id}
                item={m}
                on={m.id === material.id}
                pick={setMaterial}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            {material.blurb}
          </p>

          <Step n="3" title="How deep?" />
          <div className="grid gap-3 sm:grid-cols-3">
            {DEPTHS.map((d) => (
              <button
                key={d.in}
                type="button"
                aria-pressed={depth === d.in}
                onClick={() => setDepth(d.in)}
                className={CARD + (depth === d.in ? ON : OFF)}>
                <span className={MONO + " text-sm text-[var(--clay)]"}>
                  {d.in}&quot;
                </span>
                <span className="mt-1 block font-medium">{d.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {d.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-[var(--line)] pt-6">
            <button
              type="button"
              onClick={() => setExtras(!extras)}
              className={LINK}>
              {extras ? "Hide extras" : "Anything unusual? Add extras"}
            </button>

            {extras && (
              <div className="mt-5">
                <Check
                  on={access}
                  set={setAccess}
                  label="No truck access to the beds"
                  note="Narrow gate, or beds behind the house."
                />
                <Check
                  on={edging}
                  set={setEdging}
                  label="Edge and pull weeds first"
                  note="Clean bed lines before mulch goes down."
                />
                <label className="mt-4 block max-w-[180px]">
                  <span className={LABEL}>ZIP code</span>
                  <input
                    className={FIELD}
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="75225"
                    value={zip}
                    onChange={(e) =>
                      setZip(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <div className={PANEL}>
            {ready ? (
              <Quote
                quote={quote}
                material={material}
                perYard={perYard}
                settings={settings}
              />
            ) : (
              <p className="text-[var(--ink-soft)]">
                Enter a bed size and your estimate builds here.
              </p>
            )}
          </div>
        </aside>
      </div>

      {ready && <MobileBar quote={quote} perYard={perYard} />}
    </div>
  );
}

function BedRow({
  bed,
  index,
  canRemove,
  onEdit,
  onRemove,
}: {
  bed: Bed;
  index: number;
  canRemove: boolean;
  onEdit: (id: number, k: "length" | "width", v: string) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex items-end gap-3">
      <label className="flex-1">
        <span className={LABEL}>Bed {index + 1} length (ft)</span>
        <input
          className={FIELD}
          inputMode="decimal"
          placeholder="40"
          value={bed.length}
          onChange={(e) => onEdit(bed.id, "length", e.target.value)}
        />
      </label>

      <span className="pb-3 text-[var(--muted)]">×</span>

      <label className="flex-1">
        <span className={LABEL}>Width (ft)</span>
        <input
          className={FIELD}
          inputMode="decimal"
          placeholder="6"
          value={bed.width}
          onChange={(e) => onEdit(bed.id, "width", e.target.value)}
        />
      </label>

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(bed.id)}
          className="pb-3 text-sm text-[var(--muted)]">
          Remove
        </button>
      )}
    </div>
  );
}

function Swatch({
  item,
  on,
  pick,
}: {
  item: Material;
  on: boolean;
  pick: (m: Material) => void;
}) {
  const ring = on
    ? "inset 0 0 0 3px var(--clay)"
    : "inset 0 0 0 1px rgba(69,55,56,0.12)";

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => pick(item)}
      className="text-left">
      <span
        className="block h-20 w-full rounded-lg"
        style={{ backgroundColor: item.swatch, boxShadow: ring }}
      />
      <span className="mt-2 block text-sm font-medium">{item.name}</span>
    </button>
  );
}

function Step({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 mt-12 flex items-baseline gap-3 first:mt-0">
      <span className={MONO + " text-xs text-[var(--clay)]"}>{n}</span>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function Check({
  on,
  set,
  label,
  note,
}: {
  on: boolean;
  set: (v: boolean) => void;
  label: string;
  note: string;
}) {
  return (
    <label className="mb-4 flex cursor-pointer gap-3">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => set(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--clay)]"
      />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-[var(--muted)]">
          {note}
        </span>
      </span>
    </label>
  );
}

function Quote({
  quote,
  material,
  perYard,
  settings,
}: {
  quote: ReturnType<typeof buildQuote>;
  material: Material;
  perYard: number;
  settings: PricingSettings;
}) {
  const cap = " text-xs uppercase tracking-widest text-[var(--muted)]";

  return (
    <>
      <p className={MONO + cap}>Your rate</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="tnum text-4xl font-extrabold">
          {money(perYard)}
        </span>
        <span className="text-sm text-[var(--ink-soft)]">
          per yd³, delivered and spread
        </span>
      </p>

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <p className="text-sm text-[var(--muted)]">
          Estimated for your beds
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="tnum text-2xl font-semibold">
            {quote.yards.toFixed(2)} yd³
          </span>
          <span className="text-sm text-[var(--ink-soft)]">
            of {material.name.toLowerCase()}
          </span>
        </p>
      </div>

      <dl className={ITEMS}>
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
            <dd className={"tnum whitespace-nowrap " + MONO}>
              {money(li.amount)}
            </dd>
          </div>
        ))}
      </dl>

      {quote.minimumApplied && (
        <p className="mb-4 rounded-lg bg-[var(--paper-deep)] p-3 text-xs">
          Job minimum of {money(settings.minimum_job)} applies.
        </p>
      )}

      <div className={TOTALROW}>
        <span className="text-lg font-semibold">Estimated total</span>
        <span className={"tnum text-2xl " + MONO}>
          {money(quote.total)}
        </span>
      </div>

      <p className={NOTE}>
        This is an estimate to help you plan. We bill for the volume
        actually spread, at the same {money(perYard)} per yard. If
        your beds take less than this, you pay less.
      </p>

      <a href="/request-estimate" className={PILL + " mt-6"}>
        Get on the schedule
      </a>
    </>
  );
}

function MobileBar({
  quote,
  perYard,
}: {
  quote: ReturnType<typeof buildQuote>;
  perYard: number;
}) {
  return (
    <div className={BAR}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={"tnum text-2xl font-extrabold " + MONO}>
            about {money(quote.total)}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {quote.yards.toFixed(2)} yd³ at {money(perYard)}/yd³
          </p>
        </div>
        
          href="/request-estimate"
          className={"shrink-0 " + PILL}>
          Schedule
        </a>
      </div>
    </div>
  );
}
