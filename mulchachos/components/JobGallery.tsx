import Image from "next/image";
import type { JobPhoto } from "@/lib/content";
import VideoWall from "./VideoWall";

/**
 * The home page proof section. Real delivery photos convert harder than any
 * copy on the site, so the moment there are photos we lead with them. Until
 * then it falls back to the looping delivery clips, so the section is never
 * empty and there is nothing to remember to switch on.
 */
export default function JobGallery({ photos }: { photos: JobPhoto[] }) {
  if (photos.length === 0) return <VideoWall />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((p) => (
        <figure key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--paper-deep)]">
          <Image
            src={p.image_url}
            alt={p.caption ?? "A finished Mulchachos delivery"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {(p.caption || p.neighborhood) && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white">
              {p.caption}
              {p.neighborhood ? (
                <span className="opacity-80">{p.caption ? " · " : ""}{p.neighborhood}</span>
              ) : null}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
