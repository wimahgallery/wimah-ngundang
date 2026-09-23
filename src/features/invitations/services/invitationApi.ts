import { invitationCreateSchema, type InvitationCreateInput } from "@/lib/schemas";

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
  video_url?: string | null;
  video_poster?: string | null;
  rsvp_enabled?: boolean | null;
  fun_facts?: unknown[] | null;
  closing_message?: string | null;
  closing_image?: string | null;
  qris_image?: string | null;
};

export async function fetchInvitations(limit = 20) {
  const res = await fetch(`${BASE}?limit=${limit}`);
  if (!res.ok) throw new Error("Gagal memuat data undangan");
  const json = await res.json();
  return json.data;
}

export async function fetchInvitation(slug: string) {
  const res = await fetch(`${BASE}/${slug}`);
  if (!res.ok) throw new Error("Undangan tidak ditemukan");
  const json = await res.json();
  return json.data;
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
