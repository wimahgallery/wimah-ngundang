import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { uploadFile } from "@/lib/imagekit";
import { allowedUploadFolders, defaultUploadFolder } from "@/lib/upload-folders";
import { validateMediaFile } from "@/lib/upload-validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { v4 as uuid } from "uuid";

/** Batas body sebelum diparse — di atas limit file terbesar (audio 15 MiB). */
const MAX_BODY_BYTES = 18 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Rate limit SEBELUM body dibaca.
  if (!rateLimit(`upload:${clientIp(request)}`, 60, 60 * 1000)) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }

  // Cek Content-Length lebih dulu — `request.formData()` men-buffer seluruh
  // body ke memori, jadi request raksasa harus ditolak sebelum sampai ke sana.
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "File terlalu besar" }, { status: 413 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  const rawFolder = formData.get("folder");
  const folder =
    typeof rawFolder === "string" && allowedUploadFolders.includes(rawFolder)
      ? rawFolder
      : defaultUploadFolder;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File wajib dipilih" }, { status: 400 });
  }

  const validated = validateMediaFile(file);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { kind: fileType, extension } = validated;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${fileType}-${uuid()}.${extension}`;

  try {
    const uploaded = await uploadFile(buffer, fileName, file.type || "application/octet-stream", folder);
    return NextResponse.json({ data: uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
