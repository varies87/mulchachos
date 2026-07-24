"use client";

import { useState } from "react";

export default function MobileMenu({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/20"
          />
          <nav className="absolute inset-x-0 top-full z-50 border-b border-[var(--line)] bg-[var(--paper)] shadow-sm">
            <div className="mx-auto max-w-6xl px-5 py-2">
              <a href="/estimate" onClick={() => setOpen(false)} className="block border-b border-[var(--line)] py-3.5 text-lg font-medium text-[var(--clay)]">
                Price my beds
              </a>
              <a href="/materials" onClick={() => setOpen(false)} className="block border-b border-[var(--line)] py-3.5 text-lg text-[var(--ink)]">
                Materials
              </a>
              <a href="/about" onClick={() => setOpen(false)} className="block border-b border-[var(--line)] py-3.5 text-lg text-[var(--ink)]">
                About
              </a>
              <a href={"tel:" + phone} onClick={() => setOpen(false)} className="block py-3.5 text-lg text-[var(--ink)]">
                Call {phone}
              </a>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
