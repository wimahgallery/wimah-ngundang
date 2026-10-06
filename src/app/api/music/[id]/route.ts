import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { deleteFile } from "@/lib/imagekit";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const { data: track, error } = await auth.supabase
    .from("music_tracks")
    .select("id,url,file_id")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!track) return NextResponse.json({ error: "Musik tidak ditemukan" }, { status: 404 });

  // Sebelum dihapus: pastikan tidak ada undangan yang sedang memakai lagu ini,
  // kalau tidak musik di undangan itu akan mati diam-diam.
  const usage = await auth.supabase
    .from("invitations")
    .select("slug")
    .eq("music_url", track.url)
    .limit(1);
  if (usage.error) {
    return NextResponse.json({ error: usage.error.message }, { status: 500 });
  }
  if (usage.data?.length) {
    return NextResponse.json(
      { error: `Masih dipakai oleh undangan /${usage.data[0].slug}` },
      { status: 409 },
    );
  }

  const { error: deleteError } = await auth.supabase
    .from("music_tracks")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Baris sudah hilang dari daftar — file ImageKit dibersihkan belakangan.
  if (track.file_id) await deleteFile(track.file_id).catch(() => {});

  return NextResponse.json({ ok: true });
}
