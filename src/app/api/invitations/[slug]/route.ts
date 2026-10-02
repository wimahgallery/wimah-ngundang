import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { defaultCustomSettings, RESERVED_SLUGS } from "@/lib/invitation";
import { isTemplateId } from "@/components/invitation/template-registry";
import { safeHttpUrl } from "@/lib/utils";

type RouteContext = { params: Promise<{ slug: string }> };

/** Aturan slug sama dengan `invitationCreateSchema` di lib/schemas.ts. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { slug } = await context.params;
  const { data, error } = await auth.supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { slug } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const allowed = [
    "slug",
    "template_id",
    "event_type",
    "event_title",
    "groom_name",
    "bride_name",
    "groom_nickname",
    "bride_nickname",
    "groom_photo",
    "bride_photo",
    "cover_image",
    "hero_title",
    "hero_subtitle",
    "event_date",
    "event_time",
    "venue_name",
    "venue_address",
    "google_maps_url",
    "story_title",
    "story_content",
    "music_url",
    "gallery_images",
    "gift_accounts",
    "custom_settings",
    "is_published",
    "groom_image_position_x",
    "groom_image_position_y",
    "groom_image_zoom",
    "groom_image_rotate",
    "greeting_text",
    "recipient_name",
    "groom_parents",
    "bride_parents",
    "groom_social",
    "bride_social",
    "story_milestones",
    "events",
    "video_url",
    "video_poster",
    "rsvp_enabled",
    "fun_facts",
    "closing_message",
    "closing_image",
    "qris_image",
  ] as const;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  if (typeof patch.slug === "string") {
    const nextSlug = patch.slug.trim();
    if (nextSlug.length < 3 || !SLUG_PATTERN.test(nextSlug)) {
      return NextResponse.json(
        { error: "Slug tidak valid — gunakan huruf kecil, angka, dan tanda hubung (min. 3 karakter)" },
        { status: 400 },
      );
    }
    if (RESERVED_SLUGS.includes(nextSlug)) {
      return NextResponse.json({ error: "Slug ini tidak dapat digunakan" }, { status: 400 });
    }
    patch.slug = nextSlug;
  }

  if (typeof patch.template_id === "string" && !isTemplateId(patch.template_id)) {
    return NextResponse.json({ error: "Template tidak valid" }, { status: 400 });
  }

  const isSafeUrlValue = (value: unknown) =>
    typeof value === "string" && (safeHttpUrl(value) !== null || value.startsWith("/"));

  for (const key of ["google_maps_url", "music_url", "video_url", "cover_image", "groom_photo", "bride_photo", "closing_image", "qris_image", "video_poster"] as const) {
    if (key in patch && patch[key] != null && patch[key] !== "" && !isSafeUrlValue(patch[key])) {
      return NextResponse.json({ error: "URL tidak valid — hanya http/https yang diizinkan" }, { status: 400 });
    }
  }

  if (Array.isArray(patch.events)) {
    patch.events = (patch.events as unknown[]).map((item) => {
      if (!item || typeof item !== "object") return item;
      const event = item as Record<string, unknown>;
      return { ...event, mapsUrl: isSafeUrlValue(event.mapsUrl) ? event.mapsUrl : null };
    });
  }

  if (patch.event_date === "") patch.event_date = null;

  if (typeof patch.rsvp_enabled === "string") {
    patch.rsvp_enabled = patch.rsvp_enabled === "true";
  }

  for (const key of ["story_milestones", "events", "fun_facts"] as const) {
    if (key in patch && !Array.isArray(patch[key])) patch[key] = [];
  }

  for (const key of ["groom_social", "bride_social"] as const) {
    if (key in patch && (typeof patch[key] !== "object" || patch[key] === null)) {
      patch[key] = null;
    }
  }

  if (patch.custom_settings && typeof patch.custom_settings === "object") {
    patch.custom_settings = {
      ...defaultCustomSettings(),
      ...(patch.custom_settings as object),
    };
  }

  const { data, error } = await auth.supabase
    .from("invitations")
    .update(patch)
    .eq("slug", slug)
    .eq("user_id", auth.user!.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { slug } = await context.params;
  const { error } = await auth.supabase
    .from("invitations")
    .delete()
    .eq("slug", slug)
    .eq("user_id", auth.user!.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { success: true } });
}
