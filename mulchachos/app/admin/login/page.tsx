"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function send() {
    if (!email.includes("@")) {
      setState("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
        Admin sign in
      </h1>

      {state === "sent" ? (
        <p className="mt-5 leading-relaxed text-[var(--muted)]">
          Check {email} for a sign-in link. It expires in an hour.
        </p>
      ) : (
        <>
          <p className="mt-3 text-[var(--muted)]">
            We email a one-time link. No password to remember or leak.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="you@prestonhollowmulchachos.com"
            autoComplete="email"
            className="mt-6 w-full rounded-sm border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm focus:border-[var(--clay)] focus:outline-none"
          />
          <button
            onClick={send}
            disabled={state === "sending"}
            className="mt-3 rounded-sm bg-[var(--clay)] px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Email me a link"}
          </button>
          {state === "error" && (
            <p className="mt-3 text-sm text-[var(--danger)]">{message}</p>
          )}
        </>
      )}
    </main>
  );
}
