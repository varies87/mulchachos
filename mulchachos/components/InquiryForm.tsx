"use client";

import { useState, useTransition } from "react";
import { sendInquiry } from "@/app/estimate/actions";

const FIELD =
  "w-full rounded-lg border border-[var(--line)] px-3 py-2.5 " +
  "focus:border-[var(--clay)] focus:outline-none";

const LABEL = "mb-1.5 block text-sm text-[var(--muted)]";

const BTN =
  "rounded-full bg-[var(--clay)] px-6 py-3 font-medium " +
  "text-white hover:bg-[var(--clay-deep)] disabled:opacity-50";

/**
 * quoteNote carries whatever the estimator currently shows, so a question
 * arrives with the numbers attached and needs no back and forth.
 */
export default function InquiryForm({ quoteNote }: { quoteNote: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    start(async () => {
      const res = await sendInquiry(formData);
      if (res?.error) setError(res.error);
      else {
        setError("");
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-warm)] p-6">
        <h2 className="text-xl font-semibold">Got it.</h2>
        <p className="mt-2 text-[var(--ink-soft)]">
          We will get back to you today or first thing tomorrow. If it is
          urgent, call 214-708-7503.
        </p>
      </div>
    );
  }

  return (
    <form action={submit} className="rounded-xl border border-[var(--line)] p-6">
      <h2 className="text-xl font-semibold">Have a question?</h2>
      <p className="mt-2 text-[var(--ink-soft)]">
        Not sure which material, or how much you need? Ask and we will
        answer. Your numbers above come with the message.
      </p>

      <input type="hidden" name="quote_note" value={quoteNote} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="iq-name">Name</label>
          <input id="iq-name" name="name" required className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="iq-contact">Phone or email</label>
          <input id="iq-contact" name="contact" required className={FIELD} />
        </div>
      </div>

      <div className="mt-4">
        <label className={LABEL} htmlFor="iq-message">Your question</label>
        <textarea id="iq-message" name="message" rows={4} required className={FIELD} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button disabled={pending} className={BTN}>
          {pending ? "Sending…" : "Send question"}
        </button>
        <a href="tel:214-708-7503" className="text-sm font-medium text-[var(--clay)]">
          or call 214-708-7503
        </a>
        {error && <span className="text-sm text-[var(--danger)]">{error}</span>}
      </div>
    </form>
  );
}
