"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Material } from "@/lib/materials";
import { saveMaterial, deleteMaterial } from "@/app/admin/actions";

const blank: Partial<Material> = {
  name: "",
  blurb: "",
  category: "mulch",
  swatch: "#4A3728",
  image_url: null,
  cost_per_yard: 0,
  instant_bookable: true,
  active: true,
  sort_order: 99,
};

const input =
  "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm focus:border-[var(--clay)] focus:outline-none";
const label = "mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]";

export default function MaterialEditor({
  material,
  isNew = false,
  onDone,
}: {
  material?: Material;
  isNew?: boolean;
  onDone?: () => void;
}) {
  const m = material ?? (blank as Material);
  const [imageUrl, setImageUrl] = useState<string | null>(m.image_url ?? null);
  const [swatch, setSwatch] = useState(m.swatch);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) return setError("That file is not an image.");
    if (file.size > 5_000_000) return setError("Images must be under 5 MB.");

    setUploading(true);
    const sb = supabaseBrowser();
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await sb.storage
      .from("material-photos")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setError(upErr.message);
    } else {
      const { data } = sb.storage.from("material-photos").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  }

  function submit(formData: FormData) {
    start(async () => {
      const res = await saveMaterial(formData);
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
      <input type="hidden" name="id" value={isNew ? "" : m.id} />
      <input type="hidden" name="image_url" value={imageUrl ?? ""} />
      <input type="hidden" name="swatch" value={swatch} />

      <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
        {/* Photo, falling back to the flat swatch color */}
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="block h-32 w-full overflow-hidden rounded-sm transition-opacity hover:opacity-80" style={{ backgroundColor: swatch }} aria-label="Upload a photo of this material">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            {uploading ? "Uploading…" : imageUrl ? "Click to replace" : "Click to add a photo"}
          </p>
          {imageUrl && (
            <button type="button" onClick={() => setImageUrl(null)} className="mt-1 w-full text-center text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]">
              Remove photo
            </button>
          )}
          <div className="mt-3">
            <label className={label}>Fallback color</label>
            <input type="color" value={swatch} onChange={(e) => setSwatch(e.target.value)} className="h-8 w-full cursor-pointer rounded-sm border border-[var(--line)] bg-transparent" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Name</label>
              <input name="name" defaultValue={m.name} required className={input} />
            </div>
            <div>
              <label className={label}>Cost per cubic yard</label>
              <input name="cost_per_yard" type="number" step="0.01" min="0" defaultValue={m.cost_per_yard} required className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Description shown to customers</label>
            <input name="blurb" defaultValue={m.blurb} className={input} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Category</label>
              <select name="category" defaultValue={m.category} className={input}>
                <option value="mulch">Mulch</option>
                <option value="rock">Rock</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={label}>URL slug</label>
              <input name="slug" defaultValue={m.slug} placeholder="auto from name" className={input} />
            </div>
            <div>
              <label className={label}>Display order</label>
              <input name="sort_order" type="number" defaultValue={m.sort_order} className={input} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={m.active} className="h-4 w-4 accent-[var(--clay)]" />
              Show on the site
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="instant_bookable" defaultChecked={m.instant_bookable} className="h-4 w-4 accent-[var(--clay)]" />
              Can be booked without a site visit
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button disabled={pending || uploading} className="rounded-sm bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {pending ? "Saving…" : isNew ? "Add material" : "Save changes"}
            </button>

            {saved && <span className="text-sm text-[var(--success)]">Saved and live.</span>}
            {error && <span className="text-sm text-[var(--danger)]">{error}</span>}

            {!isNew && (
              <button type="button" onClick={() => { if (confirm(`Delete ${m.name}? Uncheck "Show on the site" instead if you may use it again.`)) { start(() => deleteMaterial(m.id).then(() => {})); } }} className="ml-auto text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--danger)]">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
