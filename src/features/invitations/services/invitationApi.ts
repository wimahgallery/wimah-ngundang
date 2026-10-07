import { invitationCreateSchema, type InvitationCreateInput } from "@/lib/schemas";
import { getDeviceId } from "@/lib/device-id";
import { normalizeInvitation, type Invitation } from "@/lib/invitation";

const BASE = "/api/invitations";

export type InvitationRow = {
  id: string;
  slug: string;
  event_title: string;
  event_type: string;
  bride_name: string;
  groom_name: string;
  template_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  bride_nickname?: string | null;
  groom_nickname?: string | null;
  bride_photo?: string | null;
  groom_photo?: string | null;
  cover_image?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  google_maps_url?: string | null;
  story_title?: string | null;
  story_content?: string | null;
  music_url?: string | null;
  gallery_images?: unknown[];
  gift_accounts?: unknown[];
  custom_settings?: Record<string, unknown>;
  groom_image_position_x?: number;
  groom_image_position_y?: number;
  groom_image_zoom?: number;
  groom_image_rotate?: number;
  greeting_text?: string | null;
  recipient_name?: string | null;
  groom_parents?: string | null;
  bride_parents?: string | null;
  groom_social?: Record<string, string | null> | null;
  bride_social?: Record<string, string | null> | null;
  story_milestones?: unknown[] | null;
  events?: unknown[] | null;
  video_url?: string | null;
  video_poster?: string | null;
  rsvp_enabled?: boolean | null;
  fun_facts?: unknown[] | null;
  closing_message?: string | null;
  closing_image?: string | null;
  qris_image?: string | null;
};

export type InvitationListPage = {
  items: InvitationRow[];
  total: number;
  totalPages: number;
  page: number;
};

export async function fetchInvitations(
  { page = 1, limit = 20, search = "" }: { page?: number; limit?: number; search?: string } = {},
): Promise<InvitationListPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const term = search.trim();
  if (term) params.set("search", term);
  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Gagal memuat data undangan");
  const json = await res.json();
  return {
    items: Array.isArray(json.data) ? json.data : [],
    total: Number(json.total) || 0,
    totalPages: Math.max(1, Number(json.totalPages) || 1),
    page: Number(json.page) || page,
  };
}

export async function fetchInvitation(slug: string): Promise<Invitation> {
  const res = await fetch(`${BASE}/${slug}`);
  if (!res.ok) throw new Error("Undangan tidak ditemukan");
  const json = await res.json();
  // Normalisasi di sini juga (bukan hanya di server) supaya `custom_settings`
  // yang tidak lengkap tidak membuat editor melempar saat membaca section.
  return normalizeInvitation(json.data as Record<string, unknown>);
}

/**
 * Simpan terakhir saat tab ditutup — `keepalive` membuat browser tetap
 * mengirim request walaupun halaman sudah pergi.
 */
export function flushInvitation(slug: string, data: Record<string, unknown>) {
  try {
    void fetch(`${BASE}/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch {
    /* best-effort */
  }
}

export type WishRow = {
  id: string;
  name: string;
  message: string | null;
  attendance: string | null;
  guest_count: number | null;
  created_at: string;
  mine?: boolean;
};

export type WishPayload = {
  name: string;
  message?: string | null;
  attendance?: string | null;
  guest_count?: number | null;
};

function deviceHeaders(): Record<string, string> {
  const id = getDeviceId();
  return id ? { "x-device-id": id } : {};
}

export async function fetchWishes(slug: string): Promise<WishRow[]> {
  // Sengaja melempar error: membalas `[]` untuk gagal memuat membuat section
  // ucapan menampilkan "Belum ada ucapan" yang menyesatkan. Yang kosong hanya
  // terjadi kalau server benar-benar menjawab `data: []`.
  let res: Response;
  try {
    res = await fetch(`/api/invitations/${slug}/wishes`, { headers: deviceHeaders() });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error || "Gagal memuat ucapan. Coba lagi sebentar lagi.");
  }
  return Array.isArray(json?.data) ? (json.data as WishRow[]) : [];
}

export async function submitGuestWish(
  slug: string,
  payload: WishPayload,
): Promise<{ status: "created" | "exists"; row: WishRow }> {
  const res = await fetch(`/api/invitations/${slug}/wishes`, {
    method: "POST",
    headers: { ...deviceHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (res.status === 409 && json?.data) return { status: "exists", row: json.data as WishRow };
  if (!res.ok) throw new Error(json?.error || "Gagal mengirim. Coba lagi nanti.");
  return { status: "created", row: json.data as WishRow };
}

export async function updateGuestWish(
  slug: string,
  payload: WishPayload,
): Promise<{ status: "updated" | "not_found"; row?: WishRow }> {
  const res = await fetch(`/api/invitations/${slug}/wishes`, {
    method: "PATCH",
    headers: { ...deviceHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (res.status === 403) return { status: "not_found" };
  if (!res.ok) throw new Error(json?.error || "Gagal menyimpan. Coba lagi nanti.");
  return { status: "updated", row: json.data as WishRow };
}

export async function saveInvitation(slug: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Gagal menyimpan");
  }
  const json = await res.json();
  return json.data as InvitationRow;
}

export async function createInvitation(data: InvitationCreateInput) {
  const parsed = invitationCreateSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid payload");
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Gagal membuat undangan");
  }
  const json = await res.json();
  return json.data as InvitationRow;
}

export async function deleteInvitation(slug: string) {
  const res = await fetch(`${BASE}/${slug}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus undangan");
  return res.json();
}

export type GuestStats = {
  /** Jumlah ucapan/konfirmasi yang masuk. */
  wishes: number;
  /** Jumlah tamu yang memilih "hadir". */
  attending: number;
  /** Total orang dari yang konfirmasi hadir. */
  guests: number;
};

/**
 * Statistik tamu untuk daftar slug sekaligus.
 *
 * Bersifat pelengkap: kalau endpoint-nya gagal (mis. RPC ucapan belum
 * dibuat), daftar undangan tetap tampil dan kolom tamu dikosongkan.
 */
export async function fetchInvitationStats(slugs: string[]): Promise<Record<string, GuestStats>> {
  if (slugs.length === 0) return {};
  const params = new URLSearchParams({ slugs: slugs.join(",") });
  let res: Response;
  try {
    res = await fetch(`${BASE}/stats?${params.toString()}`);
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Gagal memuat statistik tamu");
  return (json?.data ?? {}) as Record<string, GuestStats>;
}
