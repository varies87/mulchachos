"use client";

import { useState, useTransition } from "react";
import { setRequestTotal } from "@/app/admin/actions";

export default function RequestTotal({
  id,
  value,
}: {
  id: string;
  value: number | null;
}) {
  const [amount, setAmount] = useState(value != null ? String(value) : "");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    const n = amount.trim() === "" ? null : Number(amount);
    start(async () => {
      await setRequestTotal(id, n);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--muted)]">Final job total</label>
      <div className="flex items-center rounded-md border border-[var(--line)] bg-[var(--paper)] px-2">
        <span className="text-sm text-[var(--muted)]">$</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="—"
          className="w-24 bg-transparent px-1 py-1 text-sm focus:outline-none font-[family-name:var(--font-mono)]"
        />
      </div>
      <button type="button" onClick={save} disabled={pending} className="text-sm font-medium text-[var(--clay)] disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-sm text-[var(--success)]">Saved.</span>}
    </div>
  );
}
