"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { notifyOwner, esc, looksLikeEmail, row } from "@/lib/notify";

/**
 * Anyone can send an inquiry. RLS allows the insert and nothing else, so a
 * visitor can write one and never read anybody's. On success we email you so
 * the question lands in your inbox.
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

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;">
      <h2 style="margin:0 0 4px;color:#453738;">New question</h2>
      <p style="margin:0 0 16px;color:#8A7878;">From the form on your site.</p>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("Name", name)}
        ${row("Contact", contact)}
        ${row("Their estimate", quoteNote || null)}
      </table>
      <p style="margin:16px 0 0;color:#453738;white-space:pre-wrap;">${esc(message)}</p>
    </div>`;

  await notifyOwner({
    subject: `New question from ${esc(name)}`,
    html,
    replyTo: looksLikeEmail(contact) ? contact : undefined,
  });

  return { ok: true };
}
