import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Supabase access tokens are short lived. Without this the admin panel signs
// you out mid-session.
export async function proxy(request: NextRequest) {
  // A sign-in link that Supabase sent to the home page (because the callback
  // URL isn't on its allow list) still carries ?code=. Finish it properly.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && searchParams.has("code")) {
    const to = request.nextUrl.clone();
    to.pathname = "/admin/auth/callback";
    return NextResponse.redirect(to);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
