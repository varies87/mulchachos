"use server";

import { supabaseServer } from "@/lib/supabase-server";

/**
 * Anyone can send an inquiry. RLS allows the insert and nothing else, so a
 * visitor can write one and never read anybody's.
 */
export async function sendInquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const quoteNote = String(formData.get("quote_note") ?? "").trim();

  if (!name) return { error: "Please add your name." };
  if (!contact) return { error: "Add a phone number or email so we can reply." };
  if (message.length < 5) return { error: "Tell us a little more." };
  if (message.length > 2000) return { error: "That message is too long." };

  const sb = await supabaseServer();
  const { error } = await sb.from("inquiries").insert({
    name,
    contact,
    message,
    quote_note: quoteNote || null,
  });

  if (error) return { error: "Something went wrong. Please call instead." };
  return { ok: true };
}
