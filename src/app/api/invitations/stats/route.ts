import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_SLUGS = 40;
const SLUG_RE = /^[A-Za-z0-9-]{1,80}$/;

const MISSING_FEATURE_ERROR =
  "Fitur ucapan & RSVP belum aktif. Jalankan (lagi) file supabase/invitations.sql di Supabase SQL Editor.";

type GuestStats = {
  /** Jumlah ucapan/konfirmasi yang masuk. */
  wishes: number;
  /** Jumlah tamu yang memilih "hadir". */
  attending: number;
  /** Total orang dari yang konfirmasi hadir (jumlah tamu per ucapan). */
  guests: number;
};

function isMissingFeature(error: { code?: string | null } | null | undefined): boolean {
  const code = error?.code ?? "";
  return code === "42P01" || code === "42703" || code === "PGRST202" || code === "PGRST205";
}

function emptyStats(): GuestStats {
  return { wishes: 0, attending: 0, guests: 0 };
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Tiap slug = satu panggilan RPC ke Postgres, jadi dibatasi ketat.
  if (!rateLimit(`stats:get:${clientIp(request)}`, 30, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Muat ulang halaman sebentar lagi." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug && SLUG_RE.test(slug))
    .slice(0, MAX_SLUGS);

  if (slugs.length === 0) return NextResponse.json({ data: {} });

  // Hanya slug milik sendiri yang diproses — data tamu orang lain tidak boleh
  // bisa dikumpulkan lewat endpoint ini (RLS sudah menjaga, ini lapis kedua).
  const { data: owned, error: ownedError } = await auth.supabase
    .from("invitations")
    .select("slug")
    .eq("user_id", auth.user!.id)
    .in("slug", slugs);

  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 500 });
  }

  const ownedSlugs = new Set((owned ?? []).map((row) => row.slug as string));
  const targets = slugs.filter((slug) => ownedSlugs.has(slug));
  if (targets.length === 0) return NextResponse.json({ data: {} });

  const results = await Promise.all(
    targets.map(async (slug) => {
      const { data, error } = await auth.supabase.rpc("list_guest_wishes", {
        p_slug: slug,
        p_device_id: null,
      });
      return { slug, data, error };
    }),
  );

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    if (isMissingFeature(firstError)) {
      return NextResponse.json({ error: MISSING_FEATURE_ERROR }, { status: 503 });
    }
    return NextResponse.json({ error: firstError.message || "Terjadi kesalahan" }, { status: 500 });
  }

  const data: Record<string, GuestStats> = {};
  for (const result of results) {
    const rows = Array.isArray(result.data) ? result.data : [];
    const stats = emptyStats();
    for (const row of rows as Record<string, unknown>[]) {
      stats.wishes += 1;
      if (row.attendance === "hadir") {
        stats.attending += 1;
        const count = Number(row.guest_count);
        stats.guests += Number.isFinite(count) && count > 0 ? count : 1;
      }
    }
    data[result.slug] = stats;
  }

  return NextResponse.json({ data });
}
