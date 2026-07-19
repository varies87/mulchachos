"use client";

import { useEffect, useRef } from "react";

/**
 * Looping montage of three deliveries. Decorative, silent, and it holds still
 * for anyone who has asked their system to reduce motion.
 */
export default function DumpReel() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) {
      v.pause();
      v.removeAttribute("autoplay");
    } else {
      v.play().catch(() => {
        // Autoplay blocked. The poster frame still tells the story.
      });
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-[var(--paper-deep)]">
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/dump-wide.jpg"
        aria-label="Rock and mulch being unloaded from the trailer"
        className="h-[300px] w-full object-cover sm:h-[420px]"
      >
        <source
          src="/video/dump-tall.mp4"
          type="video/mp4"
          media="(max-width: 640px)"
        />
        <source src="/video/dump-wide.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
