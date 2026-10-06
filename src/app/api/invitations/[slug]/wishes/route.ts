import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ slug: string }> };

const ATTENDANCE_VALUES = ["hadir", "tidak", "ragu"] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MISSING_FEATURE_ERROR =
  "Fitur ucapan & RSVP belum aktif. Jalankan (lagi) file supabase/invitations.sql di Supabase SQL Editor.";

function isMissingFeature(error: { code?: string | null } | null | undefined): boolean {
  const code = error?.code ?? "";
  return code === "42P01" || code === "42703" || code === "PGRST202" || code === "PGRST205";
}

function readDeviceId(request: Request): string | null {
  const value = request.headers.get("x-device-id");
  return value && UUID_RE.test(value) ? value : null;
}

async function getPublishedSlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return { supabase, published: Boolean(data) };
}

type ParsedPayload =
  | {
      ok: true;
      value: { name: string; message: string | null; attendance: string | null; guestCount: number | null };
    }
  | { ok: false; error: string };

function parsePayload(body: unknown, options: { requireChoice: boolean }): ParsedPayload {
  if (!body || typeof body !== "object") return { ok: false, error: "Permintaan tidak valid" };

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name || name.length > 80) return { ok: false, error: "Nama wajib diisi (maks. 80 karakter)" };

  const message =
    typeof record.message === "string" && record.message.trim()
      ? record.message.trim().slice(0, 1000)
      : null;

  let attendance: string | null = null;
  if (typeof record.attendance === "string" && record.attendance) {
    if (!(ATTENDANCE_VALUES as readonly string[]).includes(record.attendance)) {
      return { ok: false, error: "Pilihan kehadiran tidak valid" };
    }
    attendance = record.attendance;
  }

  let guestCount: number | null = null;
  if (attendance === "hadir") {
    guestCount = Number.parseInt(String(record.guest_count ?? 1), 10);
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) {
      return { ok: false, error: "Jumlah tamu harus 1–20" };
    }
  }

  if (options.requireChoice && !message && !attendance) {
    return { ok: false, error: "Isi ucapan atau konfirmasi kehadiran" };
  }

  return { ok: true, value: { name, message, attendance, guestCount } };
}

function rpcError(error: { code?: string | null; message?: string } | null | undefined) {
  if (isMissingFeature(error)) {
    return NextResponse.json({ error: MISSING_FEATURE_ERROR }, { status: 503 });
  }
  if (error?.code === "P0001") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: error?.message || "Terjadi kesalahan" }, { status: 500 });
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  // Read-only tapi tetap dibatasi: endpoint ini memanggil RPC yang memicu query
  // ke Postgres — tanpa batas, satu IP bisa membebani instance.
  if (!rateLimit(`wish:get:${clientIp(request)}`, 120, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Muat ulang halaman sebentar lagi." },
      { status: 429 },
    );
  }
  const { supabase, published } = await getPublishedSlug(slug);
  if (!published) return NextResponse.json({ data: [] });

  const deviceId = readDeviceId(request);
  const { data, error } = await supabase.rpc("list_guest_wishes", {
    p_slug: slug,
    p_device_id: deviceId,
  });

  if (error) {
    if (isMissingFeature(error)) {
      return NextResponse.json({ error: MISSING_FEATURE_ERROR }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!rateLimit(`wish:${clientIp(request)}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }
  const deviceId = readDeviceId(request);
  if (!deviceId) {
    return NextResponse.json(
      { error: "Perangkat tidak dikenal. Muat ulang halaman lalu coba lagi." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = parsePayload(body, { requireChoice: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { supabase, published } = await getPublishedSlug(slug);
  if (!published) return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  const { data, error } = await supabase.rpc("submit_guest_wish", {
    p_slug: slug,
    p_device_id: deviceId,
    p_name: parsed.value.name,
    p_message: parsed.value.message,
    p_attendance: parsed.value.attendance,
    p_guest_count: parsed.value.guestCount,
  });

  if (error) return rpcError(error);

  const result = data as { status?: string; row?: Record<string, unknown> };
  if (result?.status === "exists") {
    return NextResponse.json(
      {
        error: "Kamu sudah mengirim ucapan/konfirmasi dari perangkat ini. Silakan ubah yang sudah ada.",
        data: result.row,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: result?.row }, { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!rateLimit(`wish:${clientIp(request)}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }
  const deviceId = readDeviceId(request);
  if (!deviceId) {
    return NextResponse.json(
      { error: "Perangkat tidak dikenal. Muat ulang halaman lalu coba lagi." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = parsePayload(body, { requireChoice: false });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { supabase, published } = await getPublishedSlug(slug);
  if (!published) return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  const { data, error } = await supabase.rpc("update_guest_wish", {
    p_slug: slug,
    p_device_id: deviceId,
    p_name: parsed.value.name,
    p_message: parsed.value.message,
    p_attendance: parsed.value.attendance,
    p_guest_count: parsed.value.guestCount,
  });

  if (error) return rpcError(error);

  const result = data as { status?: string; row?: Record<string, unknown> };
  if (result?.status === "not_found") {
    return NextResponse.json(
      { error: "Tidak ada ucapan milikmu di undangan ini. Kirim ucapan baru dulu." },
      { status: 403 },
    );
  }

  return NextResponse.json({ data: result?.row });
}
