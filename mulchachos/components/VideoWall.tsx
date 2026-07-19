"use client";

import { useEffect, useRef } from "react";

const CLIPS = [1, 2, 3, 4, 5, 6];

/**
 * Deliveries gallery.
 *
 * Nothing here costs bandwidth until you scroll to it. Each tile ships only a
 * small poster image; the video file is attached and played the moment the
 * tile enters the viewport, and paused the moment it leaves. That keeps the
 * initial page weight near zero and stops six videos decoding at once on a
 * phone, which is what actually makes video-heavy pages feel slow.
 */
export default function VideoWall() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) return; // Poster frames only.

    const videos = Array.from(el.querySelectorAll("video"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const src = v.dataset.src;
            if (src && !v.src) v.src = src;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { rootMargin: "200px", threshold: 0.25 }
    );

    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CLIPS.map((n) => (
        <video key={n} data-src={`/video/clip${n}.mp4`} poster={`/video/clip${n}.jpg`} muted loop playsInline preload="none" aria-label="Material being unloaded on a Dallas job" className="aspect-[9/16] w-full rounded-lg bg-[var(--paper-deep)] object-cover" />
      ))}
    </div>
  );
}
