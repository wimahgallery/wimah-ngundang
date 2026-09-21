import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { defaultCustomSettings, RESERVED_SLUGS } from "@/lib/invitation";
import { isTemplateId } from "@/components/invitation/template-registry";

type RouteContext = { params: Promise<{ slug: string }> };

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
  ] as const;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  if (typeof patch.slug === "string") {
    if (RESERVED_SLUGS.includes(patch.slug)) {
      return NextResponse.json({ error: "Slug ini tidak dapat digunakan" }, { status: 400 });
    }
  }

  if (typeof patch.template_id === "string" && !isTemplateId(patch.template_id)) {
    return NextResponse.json({ error: "Template tidak valid" }, { status: 400 });
  }

  if (patch.event_date === "") patch.event_date = null;

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
