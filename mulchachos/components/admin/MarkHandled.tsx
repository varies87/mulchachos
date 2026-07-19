"use client";

import { useTransition } from "react";
import { setHandled } from "@/app/admin/actions";

export default function MarkHandled({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button type="button" disabled={pending} onClick={() => start(() => setHandled(id, !handled))} className="text-sm font-medium text-[var(--clay)] disabled:opacity-50">
      {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}
