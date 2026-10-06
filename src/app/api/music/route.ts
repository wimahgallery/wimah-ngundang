import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { uploadFile, deleteFile } from "@/lib/imagekit";
import { uploadFolders } from "@/lib/upload-folders";
import { validateMediaFile } from "@/lib/upload-validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { v4 as uuid } from "uuid";

/** Batas body sebelum diparse — di atas limit file terbesar (audio 15 MiB). */
const MAX_BODY_BYTES = 18 * 1024 * 1024;
const MAX_TRACKS = 500;

const TRACK_COLUMNS = "id,name,url,file_id,duration_seconds,created_at";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("music_tracks")
    .select(TRACK_COLUMNS)
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .limit(MAX_TRACKS);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Rate limit SEBELUM body dibaca.
  if (!rateLimit(`music:${clientIp(request)}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "File terlalu besar" }, { status: 413 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });

  const rawName = formData.get("name");
  const name = (typeof rawName === "string" ? rawName : "")
    .trim()
    .replace(/\s+/g, " ");
  if (!name) return NextResponse.json({ error: "Nama musik wajib diisi" }, { status: 400 });
  if (name.length > 80) {
    return NextResponse.json({ error: "Nama musik maksimal 80 karakter" }, { status: 400 });
  }

  const durationRaw = Number(formData.get("duration_seconds"));
  const durationSeconds =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? Math.min(Math.round(durationRaw), 86400)
      : null;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File musik wajib dipilih" }, { status: 400 });
  }

  const validated = validateMediaFile(file);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  if (validated.kind !== "audio") {
    return NextResponse.json({ error: "File harus berupa musik (mp3, wav, aac, ogg, m4a)" }, { status: 400 });
  }

  // Nama yang sama ditolak SEBELUM berkas diunggah — tidak ada file ImageKit
  // yang melayang hanya untuk kemudian dibuang. Pencocokan case-insensitive
  // mengikuti indeks unik (user_id, lower(name)).
  const namePattern = name.replace(/[\\%_]/g, (char) => `\\${char}`);
  const byName = await auth.supabase
    .from("music_tracks")
    .select("id,name")
    .eq("user_id", auth.user!.id)
    .ilike("name", namePattern)
    .limit(1);
  if (byName.error) {
    return NextResponse.json({ error: byName.error.message }, { status: 500 });
  }
  if (byName.data?.length) {
    return NextResponse.json({ error: `Nama musik sudah dipakai: "${name}"` }, { status: 409 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `audio-${uuid()}.${validated.extension}`;

  let fileId = "";
  let url = "";
  try {
    const uploaded = await uploadFile(
      buffer,
      fileName,
      file.type || "audio/mpeg",
      uploadFolders.music,
    );
    if (!uploaded.fileId || !uploaded.url) {
      throw new Error("Upload musik gagal: respons ImageKit tidak lengkap");
    }
    fileId = uploaded.fileId;
    url = uploaded.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await auth.supabase
    .from("music_tracks")
    .insert({
      user_id: auth.user!.id,
      name,
      url,
      file_id: fileId,
      duration_seconds: durationSeconds,
    })
    .select(TRACK_COLUMNS)
    .single();

  if (error) {
    // Gagal menyimpan baris → berkas baru jadi yatim; buang supaya ImageKit
    // tidak menumpuk file yang tidak dipakai siapa-siapa.
    if (fileId) await deleteFile(fileId).catch(() => {});

    if (error.code === "23505") {
      // Indeks unik: nama (huruf besar/kecil dianggap sama) atau file yang
      // identik sudah terdaftar untuk user ini.
      const dup = await auth.supabase
        .from("music_tracks")
        .select("name")
        .eq("user_id", auth.user!.id)
        .ilike("name", namePattern)
        .limit(1);
      const dupName = dup.data?.[0]?.name;
      return NextResponse.json(
        {
          error: dupName
            ? `Lagu ini sudah ada di daftar sebagai "${dupName}"`
            : "Nama musik sudah dipakai",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
