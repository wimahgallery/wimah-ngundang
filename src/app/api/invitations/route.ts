import { NextResponse } from "next/server";
import { parsePagination, paginatedResponse, parseSort, requireAuth } from "@/lib/api-helpers";
import { defaultCustomSettings, RESERVED_SLUGS } from "@/lib/invitation";
import { invitationCreateSchema } from "@/lib/schemas";
import { isTemplateId } from "@/components/invitation/template-registry";
import { defaultPreset } from "@/lib/font-library";

/**
 * Kolom yang boleh diurutkan dari dashboard (TanStack Table) → nama kolom
 * database. Id kolom di header tabel harus sama dengan kunci di sini.
 */
const SORTABLE: Record<string, string> = {
  event_title: "event_title",
  slug: "slug",
  event_date: "event_date",
  event_type: "event_type",
  template_id: "template_id",
  is_published: "is_published",
  created_at: "created_at",
  updated_at: "updated_at",
};

/**
 * Escape nilai untuk filter `.or(...)` PostgREST.
 *
 * Selain `%`/`_` (wildcard `ilike`), karakter ter-reserved PostgREST —
 * `(`, `)`, `,` pemisah filter, `:` pemisah `field.op.value`, plus
 * `. @ ~ | * # \` — harus di-escape kalau ingin dicari harfiah. Tanpa ini,
 * mencari "Rina (Pradipta)" membuat query `.or()` gagal dan membalas 500.
 */
function sanitizeSearch(input: string): string {
  return input.replace(/[\\%_(),:.@~|*#]/g, (char) => `\\${char}`);
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = parsePagination(searchParams);
  const rawSearch = searchParams.get("search")?.trim() || "";
  const sort = parseSort(searchParams, SORTABLE, { key: "updated_at", ascending: false });

  const run = async (search: string) => {
    let query = auth.supabase
      .from("invitations")
      .select("*", { count: "exact" })
      .eq("user_id", auth.user!.id)
      .order(sort.column, { ascending: sort.ascending })
      // Pemecah seri supaya baris dengan nilai sama tidak berpindah halaman
      // antar request (urutan database tanpa tiebreaker bisa berubah).
      .order("id", { ascending: true });

    if (search) {
      query = query.or(
        `slug.ilike.%${search}%,event_title.ilike.%${search}%,bride_name.ilike.%${search}%,groom_name.ilike.%${search}%`,
      );
    }
    return query.range(from, to);
  };

  let result = await run(rawSearch ? sanitizeSearch(rawSearch) : "");

  // Jaring pengaman: kalau istilah yang di-escape tetap ditolak PostgREST,
  // ulangi dengan istilah yang sudah disaring hanya huruf/angka supaya
  // pencarian tidak pernah membalas 500 ke pengguna.
  if (result.error && rawSearch) {
    const fallback = rawSearch.replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
    if (fallback) result = await run(sanitizeSearch(fallback));
  }

  const { data, error, count } = result;

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
      custom_settings: {
        ...defaultCustomSettings(),
        // Undangan baru lahir dengan DNA tipografi template-nya.
        font: { ...defaultPreset(template_id) },
      },
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
