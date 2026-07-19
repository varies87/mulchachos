"use client";

import { useState } from "react";
import MaterialEditor from "./MaterialEditor";

export default function AddMaterial() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-sm border border-dashed border-white/25 px-5 py-4 text-sm text-[var(--muted)] transition-colors hover:border-[var(--granite)] hover:text-[var(--paper)]"
      >
        Add a material
      </button>
    );
  }

  return (
    <div>
      <MaterialEditor isNew onDone={() => setOpen(false)} />
      <button
        onClick={() => setOpen(false)}
        className="mt-2 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--paper)]"
      >
        Cancel
      </button>
    </div>
  );
}
