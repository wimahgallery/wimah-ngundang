import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { uploadFile } from "@/lib/imagekit";
import { v4 as uuid } from "uuid";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4", "audio/aac", "audio/ogg"]);

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "gif"],
  audio: ["mp3", "wav", "aac", "ogg", "m4a"],
};

function validateFileType(file: File): "image" | "audio" | null {
  if (IMAGE_TYPES.has(file.type)) return "image";

  if (AUDIO_TYPES.has(file.type)) return "audio";

  return null;
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const fileType = validateFileType(file);
  if (!fileType) {
    return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
  }

  const maxSize = fileType === "audio" ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File terlalu besar" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext && !ALLOWED_EXTENSIONS[fileType].includes(ext)) {
    return NextResponse.json({ error: "Ekstensi file tidak didukung" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const finalExt = ext || (fileType === "audio" ? "mp3" : "jpg");
  const fileName = `${fileType}-${uuid()}.${finalExt}`;

  try {
    const uploaded = await uploadFile(buffer, fileName, file.type || "application/octet-stream", "invitations");
    return NextResponse.json({ data: uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
