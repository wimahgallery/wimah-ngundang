import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const MUTATING_METHODS = ["POST", "PATCH", "PUT", "DELETE"];

export async function proxy(request: NextRequest) {
  const { method } = request;
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Preview undangan (admin): butuh refresh cookie sesi di sini — Server Component
  // tidak bisa mem-persist rotasi refresh token sendiri, jadi tanpa match ini
  // /preview/invitation/* akan mantah ke /admin/login begitu access token kedaluwarsa.

  // Ucapan/RSVP tamu adalah fitur publik (tanpa login) — divalidasi & RLS di route-nya.
  const isGuestWishes = /^\/api\/invitations\/[^/]+\/wishes$/.test(pathname);

  const isProtectedApi =
    (pathname.startsWith("/api/invitations") && !isGuestWishes) || pathname.startsWith("/api/upload");

  if (isProtectedApi && MUTATING_METHODS.includes(method) && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/api/auth/me") && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/preview/:path*",
    "/api/invitations/:path*",
    "/api/upload/:path*",
    "/api/auth/me",
  ],
};
