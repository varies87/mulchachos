"use client";

import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { JobPhoto } from "@/lib/content";
import { saveJobPhoto, deleteJobPhoto } from "@/app/admin/actions";

const blank: Partial<JobPhoto> = {
  image_url: "",
  caption: "",
  neighborhood: "",
  material_slug: "",
  sort_order: 0,
  active: true,
};

const input =
  "w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--clay)] focus:outline-none";
const label = "mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)]";

export default function JobPhotoEditor({
  photo,
  isNew = false,
  onDone,
}: {
  photo?: JobPhoto;
  isNew?: boolean;
  onDone?: () => void;
}) {
  const p = photo ?? (blank as JobPhoto);
  const [imageUrl, setImageUrl] = useState<string>(p.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) return setError("That file is not an image.");
    if (file.size > 10_000_000) return setError("Images must be under 10 MB.");

    setUploading(true);
    const sb = supabaseBrowser();
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await sb.storage
      .from("job-photos")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setError(upErr.message);
    } else {
      const { data } = sb.storage.from("job-photos").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  }

  function submit(formData: FormData) {
    start(async () => {
      const res = await saveJobPhoto(formData);
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
      <input type="hidden" name="id" value={isNew ? "" : p.id} />
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--paper-deep)] text-xs text-[var(--muted)] transition-opacity hover:opacity-80" aria-label="Upload a job photo">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>Click to add</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            {uploading ? "Uploading…" : imageUrl ? "Click to replace" : "A wide, well-lit finished shot"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label}>Caption (optional)</label>
            <input name="caption" defaultValue={p.caption ?? ""} className={input} placeholder="Black hardwood, 9 yards, done in a morning" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Neighborhood</label>
              <input name="neighborhood" defaultValue={p.neighborhood ?? ""} className={input} placeholder="Preston Hollow" />
            </div>
            <div>
              <label className={label}>Material slug (optional)</label>
              <input name="material_slug" defaultValue={p.material_slug ?? ""} className={input} placeholder="hardwood-mulch" />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <div className="w-28">
              <label className={label}>Display order</label>
              <input name="sort_order" type="number" defaultValue={p.sort_order} className={input} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-[var(--clay)]" />
              Show on the site
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button disabled={pending || uploading} className="rounded-sm bg-[var(--clay)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {pending ? "Saving…" : isNew ? "Add photo" : "Save changes"}
            </button>
            {saved && <span className="text-sm text-[var(--success)]">Saved and live.</span>}
            {error && <span className="text-sm text-[var(--danger)]">{error}</span>}

            {!isNew && (
              <button type="button" onClick={() => { if (confirm("Delete this photo?")) start(() => deleteJobPhoto(p.id).then(() => {})); }} className="ml-auto text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--danger)]">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
