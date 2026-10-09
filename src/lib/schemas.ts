import { z } from "zod";
import { RICH_TEXT_FIELDS, TEXT_ALIGNMENTS, TEXT_GAP_MAX, TEXT_GAP_MIN } from "@/lib/invitation";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const invitationCreateSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung"),
  event_title: z.string().min(1, "Judul acara wajib diisi"),
  event_type: z.string().min(1, "Jenis acara wajib diisi"),
  template_id: z.string().min(1, "Pilih template"),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
});

export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>;

/** Objek jsonb bebas — hanya memastikan berbentuk objek, bukan string/array. */
const jsonObject = z.record(z.unknown());
/** Array objek (galeri, hadiah, babak cerita, agenda, fakta) — isinya longgar
 *  karena bentuk per item ditentukan template, bukan skema server. */
const objectArray = z.array(z.record(z.unknown()));
/** Kolom teks: boleh `null` dan boleh string kosong (diubah jadi `null` di route). */
const text = z.string().nullable();
const number = z.number();

/**
 * `custom_settings` divalidasi sebagian: `textAlign` (perataan konten Markdown
 * per field) dan `textGap`/`textGapFields` (jarak antar blok) dipastikan
 * tipenya benar. Seksi-seksi lain diteruskan apa adanya lalu digabung dengan
 * `defaultCustomSettings()` di route PATCH.
 */
const gap = z.number().min(TEXT_GAP_MIN).max(TEXT_GAP_MAX);

const customSettingsSchema = z
  .object({
    textAlign: z.record(z.enum(RICH_TEXT_FIELDS), z.enum(TEXT_ALIGNMENTS)).optional(),
    textGap: gap.optional(),
    textGapFields: z.record(z.enum(RICH_TEXT_FIELDS), gap).optional(),
  })
  .passthrough();

/**
 * Payload `PATCH /api/invitations/[slug]`.
 *
 * Semua field bersifat opsional (partial update) dan key yang tidak dikenal
 * dibuang — daftar field yang boleh ditimpa diambil dari skema ini lewat
 * `invitationPatchSchema.keyof()` sehingga tidak ada dua daftar yang harus
 * dijaga serentak.
 */
export const invitationPatchSchema = z
  .object({
    slug: z.string(),
    template_id: z.string(),
    event_type: text,
    event_title: text,
    groom_name: text,
    bride_name: text,
    groom_nickname: text,
    bride_nickname: text,
    groom_photo: text,
    bride_photo: text,
    cover_image: text,
    hero_title: text,
    hero_subtitle: text,
    event_date: text,
    event_time: text,
    venue_name: text,
    venue_address: text,
    google_maps_url: text,
    story_title: text,
    story_content: text,
    music_url: text,
    gallery_images: objectArray,
    gift_accounts: objectArray,
    custom_settings: customSettingsSchema,
    is_published: z.boolean(),
    groom_image_position_x: number,
    groom_image_position_y: number,
    groom_image_zoom: number,
    groom_image_rotate: number,
    greeting_text: text,
    recipient_name: text,
    groom_parents: text,
    bride_parents: text,
    groom_social: jsonObject.nullable(),
    bride_social: jsonObject.nullable(),
    story_milestones: objectArray,
    events: objectArray,
    video_url: text,
    video_poster: text,
    // Nilai "true"/"false" masih dikirim editor lama — dinormalisasi di route.
    rsvp_enabled: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.null()]),
    fun_facts: objectArray,
    closing_message: text,
    closing_image: text,
    qris_image: text,
  })
  .partial();

/** Field yang boleh ditimpa oleh PATCH — satu-satunya sumber kebenarannya. */
export const INVITATION_PATCH_KEYS = invitationPatchSchema.keyof().options;

export type InvitationPatchInput = z.infer<typeof invitationPatchSchema>;
