import { getAllJobPhotos } from "@/lib/content";
import JobPhotoEditor from "@/components/admin/JobPhotoEditor";
import AddJobPhoto from "@/components/admin/AddJobPhoto";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const photos = await getAllJobPhotos();
  const live = photos.filter((p) => p.active).length;
  const hidden = photos.length - live;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
          Job photos
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {live} live{hidden > 0 ? `, ${hidden} hidden` : ""}
        </p>
      </div>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Real finished deliveries. As soon as one is live, the home page leads
        with photos instead of the stock delivery clips.
      </p>

      <AddJobPhoto />

      <div className="mt-6 space-y-4">
        {photos.map((p) => (
          <div key={p.id} className={p.active ? "" : "opacity-55"}>
            <JobPhotoEditor photo={p} />
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="mt-6 rounded-sm border border-dashed border-[var(--line)] p-10 text-center text-[var(--muted)]">
          No job photos yet. Until you add one, the home page falls back to the
          delivery videos.
        </p>
      )}
    </main>
  );
}
