import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/schemas";
import { checkRateLimit, clientIp, hitRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    // Hanya percobaan GAGAL yang mengurangi kuota — login yang berhasil
    // tidak boleh mengunci pemilik akun sendiri.
    const limitKey = `login:${clientIp(request)}`;
    const LIMIT_ATTEMPTS = 5;
    const WINDOW_MS = 15 * 60 * 1000;
    if (!checkRateLimit(limitKey, LIMIT_ATTEMPTS)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
        { status: 429 },
      );
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      hitRateLimit(limitKey, LIMIT_ATTEMPTS, WINDOW_MS);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    resetRateLimit(limitKey);
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
