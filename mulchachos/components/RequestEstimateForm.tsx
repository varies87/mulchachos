"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { submitEstimateRequest } from "@/app/request-estimate/actions";
import { money } from "@/lib/pricing";
import { PHONE } from "./SiteHeader";

const FIELD =
  "w-full rounded-lg border border-[var(--line)] px-3 py-2.5 " +
  "focus:border-[var(--clay)] focus:outline-none";
const LABEL = "mb-1.5 block text-sm text-[var(--muted)]";
const MONO = "font-[family-name:var(--font-mono)]";
const BTN =
  "rounded-full bg-[var(--clay)] px-6 py-3 font-medium text-white " +
  "hover:bg-[var(--clay-deep)] disabled:opacity-50";

const MAX_PHOTOS = 8;
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per photo

type Shot = {
  id: string;
  name: string;
  preview: string;
  path?: string;
  state: "uploading" | "done" | "error";
};

interface Summary {
  materialName: string;
  yards: number;
  total: number;
  note: string;
}

interface Record {
  material_slug: string;
  material_name: string;
  square_feet: number;
  depth_inches: number;
  weed_fabric: boolean;
  limited_access: boolean;
  edging: boolean;
  estimated_total: number;
  quote_note: string;
  zip: string;
}

export default function RequestEstimateForm({
  summary,
  record,
}: {
  summary: Summary | null;
  record: Record;
}) {
  const [shots, setShots] = useState<Shot[]>([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const uploading = shots.some((s) => s.state === "uploading");

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const room = MAX_PHOTOS - shots.length;
    const files = Array.from(list).slice(0, Math.max(0, room));
    if (files.length < list.length) {
      setError(`Up to ${MAX_PHOTOS} photos. We used the first ${room}.`);
    }

    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
        setError("Photos only, up to 15 MB each.");
        continue;
      }
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setShots((prev) => [...prev, { id, name: file.name, preview, state: "uploading" }]);

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `requests/${id}.${ext}`;
      const { error: upErr } = await supabaseBrowser()
        .storage.from("estimate-photos")
        .upload(path, file, { contentType: file.type, upsert: false });

      setShots((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, state: upErr ? "error" : "done", path: upErr ? undefined : path }
            : s
        )
      );
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeShot(id: string) {
    setShots((prev) => {
      const gone = prev.find((s) => s.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((s) => s.id !== id);
    });
  }

  function submit(formData: FormData) {
    const paths = shots.filter((s) => s.state === "done" && s.path).map((s) => s.path!);
    formData.set("photo_paths", JSON.stringify(paths));
    start(async () => {
      const res = await submitEstimateRequest(formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-warm)] p-8">
        <h2 className="text-2xl font-extrabold">Request sent.</h2>
        <p className="mt-3 text-[var(--ink-soft)]">
          Thanks — nothing is booked or charged. We will call or text to go over
          the material and pick a delivery morning, usually the same day. Want to
          talk it through now? Reach us at{" "}
          <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
            {PHONE}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-8">
      {/* Carried-forward estimate, shown back to the customer and sent along. */}
      {summary && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-warm)] p-5">
          <p className={MONO + " text-xs uppercase tracking-widest text-[var(--muted)]"}>
            Your estimate
          </p>
          <p className="mt-2 text-lg font-semibold">
            {summary.yards.toFixed(2)} yd³ of {summary.materialName.toLowerCase()}
          </p>
          <p className={"tnum mt-1 text-2xl font-extrabold " + MONO}>
            about {money(summary.total)}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            We bill for the volume actually spread. Change anything?{" "}
            <a href="/estimate" className="font-medium text-[var(--clay)]">
              Edit your estimate
            </a>
            .
          </p>
        </div>
      )}

      <input type="hidden" name="material_slug" value={record.material_slug} />
      <input type="hidden" name="material_name" value={record.material_name} />
      <input type="hidden" name="square_feet" value={record.square_feet || ""} />
      <input type="hidden" name="depth_inches" value={record.depth_inches} />
      <input type="hidden" name="weed_fabric" value={record.weed_fabric ? "1" : "0"} />
      <input type="hidden" name="limited_access" value={record.limited_access ? "1" : "0"} />
      <input type="hidden" name="edging" value={record.edging ? "1" : "0"} />
      <input type="hidden" name="estimated_total" value={record.estimated_total || ""} />
      <input type="hidden" name="quote_note" value={record.quote_note} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="re-name">Name</label>
          <input id="re-name" name="name" required className={FIELD} autoComplete="name" />
        </div>
        <div>
          <label className={LABEL} htmlFor="re-phone">Phone</label>
          <input id="re-phone" name="phone" type="tel" required className={FIELD} autoComplete="tel" placeholder="214-555-0100" />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="re-email">Email</label>
        <input id="re-email" name="email" type="email" required className={FIELD} autoComplete="email" placeholder="you@email.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label className={LABEL} htmlFor="re-address">Job address</label>
          <input id="re-address" name="address" required className={FIELD} autoComplete="street-address" placeholder="Street, Dallas" />
        </div>
        <div>
          <label className={LABEL} htmlFor="re-zip">ZIP</label>
          <input id="re-zip" name="zip" defaultValue={record.zip} inputMode="numeric" maxLength={5} className={FIELD + " " + MONO} placeholder="75225" />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="re-time">When works?</label>
        <select id="re-time" name="preferred_time" className={FIELD} defaultValue="">
          <option value="" disabled>Pick a window</option>
          <option>As soon as you can</option>
          <option>This week</option>
          <option>Next week</option>
          <option>Just planning for now</option>
        </select>
      </div>

      {/* Photos. Uploaded to storage as they are picked, previewed locally. */}
      <div>
        <label className={LABEL}>Photos of the beds</label>
        <p className="-mt-1 mb-3 text-sm text-[var(--ink-soft)]">
          A wide shot of each bed and anything unusual, like a narrow gate or a
          slope, gets you a tighter number faster.
        </p>

        <div className="flex flex-wrap gap-3">
          {shots.map((s) => (
            <div key={s.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-[var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.preview} alt={s.name} className="h-full w-full object-cover" />
              {s.state !== "done" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                  {s.state === "uploading" ? "…" : "failed"}
                </span>
              )}
              <button type="button" onClick={() => removeShot(s.id)} aria-label={`Remove ${s.name}`} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white">
                ×
              </button>
            </div>
          ))}

          {shots.length < MAX_PHOTOS && (
            <button type="button" onClick={() => fileInput.current?.click()} className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line-strong)] text-sm text-[var(--muted)] hover:border-[var(--clay)] hover:text-[var(--clay)]">
              <span className="text-xl leading-none">+</span>
              <span className="mt-1">Add</span>
            </button>
          )}
        </div>

        <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      <div>
        <label className={LABEL} htmlFor="re-notes">Anything else? (optional)</label>
        <textarea id="re-notes" name="notes" rows={3} className={FIELD} placeholder="Gate code, dogs, where to dump, questions…" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending || uploading} className={BTN}>
          {pending ? "Sending…" : uploading ? "Photos uploading…" : "Send my request"}
        </button>
        <a href={"tel:" + PHONE} className="text-sm font-medium text-[var(--clay)]">
          or call {PHONE}
        </a>
        {error && <span className="text-sm text-[var(--danger)]">{error}</span>}
      </div>
    </form>
  );
}
