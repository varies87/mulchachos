import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Where the emailed sign-in link lands. Supabase sends ?code=..., which we
 * trade for a session cookie, then send you into the admin panel. Lives
 * outside the (panel) group so the sign-in check doesn't bounce it.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/admin", url.origin));
    console.error("admin sign-in failed:", error.message);
  }

  const back = new URL("/admin/login", url.origin);
  back.searchParams.set("error", "That sign-in link didn't work. It may have expired or been opened in a different browser. Send a new one.");
  return NextResponse.redirect(back);
}
