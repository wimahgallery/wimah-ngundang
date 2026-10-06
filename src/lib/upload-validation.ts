/** Tipe media yang diterima server untuk upload. */
export type MediaKind = "image" | "audio";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/x-m4a",
]);

const ALLOWED_EXTENSIONS: Record<MediaKind, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "gif"],
  audio: ["mp3", "wav", "aac", "ogg", "m4a"],
};

export type MediaValidation =
  | { kind: MediaKind; extension: string }
  | { error: string };

/**
 * Validasi berkas upload (tipe, ukuran, ekstensi) dipakai bersama oleh
 * `/api/upload` dan `/api/music` supaya aturannya tidak pernah berbeda.
 */
export function validateMediaFile(file: File): MediaValidation {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  const kindFromType: MediaKind | null = IMAGE_TYPES.has(file.type)
    ? "image"
    : AUDIO_TYPES.has(file.type)
      ? "audio"
      : null;

  // Beberapa sistem/klien mengirim `type` kosong — jatuhkan ke ekstensi.
  const kind: MediaKind | null =
    kindFromType ??
    (file.type
      ? null
      : ALLOWED_EXTENSIONS.image.includes(ext)
        ? "image"
        : ALLOWED_EXTENSIONS.audio.includes(ext)
          ? "audio"
          : null);

  if (!kind) return { error: "Tipe file tidak didukung" };

  const maxSize = kind === "audio" ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxSize) return { error: "File terlalu besar" };

  if (ext && !ALLOWED_EXTENSIONS[kind].includes(ext)) {
    return { error: "Ekstensi file tidak didukung" };
  }

  return { kind, extension: ext || (kind === "audio" ? "mp3" : "jpg") };
}
