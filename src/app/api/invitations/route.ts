import { NextResponse } from "next/server";
import { parsePagination, paginatedResponse, requireAuth } from "@/lib/api-helpers";
import { defaultCustomSettings, RESERVED_SLUGS } from "@/lib/invitation";
import { invitationCreateSchema } from "@/lib/schemas";
import { isTemplateId } from "@/components/invitation/template-registry";

function sanitizeSearch(input: string): string {
  return input.replace(/[%_,]/g, (char) => `\\${char}`);
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = parsePagination(searchParams);
  const search = sanitizeSearch(searchParams.get("search")?.trim() || "");

  let query = auth.supabase
    .from("invitations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("updated_at", { ascending: false });

  if (search) {
    query = query.or(
      `slug.ilike.%${search}%,event_title.ilike.%${search}%,bride_name.ilike.%${search}%,groom_name.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return paginatedResponse(data, count, page, limit);
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = invitationCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { slug, event_title, event_type, template_id, bride_name, groom_name } = parsed.data;

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({ error: "Slug ini tidak dapat digunakan" }, { status: 400 });
  }

  if (!isTemplateId(template_id)) {
    return NextResponse.json({ error: "Template tidak valid" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("invitations")
    .insert({
      user_id: auth.user!.id,
      slug,
      event_title,
      event_type,
      template_id,
      bride_name: bride_name || null,
      groom_name: groom_name || null,
      custom_settings: defaultCustomSettings(),
      gallery_images: [],
      gift_accounts: [],
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
