"use client";

import { useTransition } from "react";
import { setRequestStatus } from "@/app/admin/actions";

const STATUSES = ["new", "scheduled", "quoted", "closed"];

export default function RequestStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-[var(--muted)]">Status</span>
      <select
        disabled={pending}
        value={status}
        onChange={(e) => {
          const next = e.target.value;
          start(() => setRequestStatus(id, next));
        }}
        className="rounded-md border border-[var(--line)] px-2 py-1 disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </label>
  );
}
