import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // `@supabase/ssr` default `httpOnly: false`. Tidak ada client-side
              // Supabase di app ini (semua auth lewat Server Components / route
              // handler) — jadi token sesi bisa dan seharusnya tidak dibaca JS.
              cookieStore.set(name, value, { ...options, httpOnly: true }),
            );
          } catch {
            // Ignore — Server Component, can't set cookies
          }
        },
      },
    },
  );
}
