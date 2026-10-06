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

/** Ekstensi kanonik per MIME — dipakai saat tipe sudah diketahui. */
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
};

const HINT: Record<MediaKind, string> = {
  image: "Pakai JPG, PNG, WEBP, atau GIF.",
  audio: "Pakai MP3, WAV, AAC, OGG, atau M4A.",
};

/** Ekstensi yang bisa berisi skrip/kode — ditolak walau MIME-nya mengaku gambar. */
const BLOCKED_EXTENSIONS = new Set([
  "svg",
  "svgz",
  "html",
  "htm",
  "xhtml",
  "js",
  "mjs",
  "php",
  "xml",
]);

const MAX_SIZE: Record<MediaKind, number> = {
  image: 8 * 1024 * 1024,
  audio: 15 * 1024 * 1024,
};

export type MediaValidation =
  | { kind: MediaKind; extension: string }
  | { error: string };

function kindFromExtension(ext: string): MediaKind | null {
  if (ALLOWED_EXTENSIONS.image.includes(ext)) return "image";
  if (ALLOWED_EXTENSIONS.audio.includes(ext)) return "audio";
  return null;
}

/**
 * Validasi berkas upload (tipe, ukuran, ekstensi) dipakai bersama oleh
 * `/api/upload` dan `/api/music` supaya aturannya tidak pernah berbeda.
 *
 * MIME jadi acuan utama: berkas valid dengan ekstensi aneh (.jfif, tanpa
 * ekstensi) tetap diterima dan disimpan dengan ekstensi kanoniknya.
 */
export function validateMediaFile(file: File): MediaValidation {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  const kind: MediaKind | null = IMAGE_TYPES.has(file.type)
    ? "image"
    : AUDIO_TYPES.has(file.type)
      ? "audio"
      : file.type
        ? null
        : kindFromExtension(ext);

  if (!kind) {
    // Foto dari iPhone sering HEIC/HEIF — browser tidak bisa menampilkannya.
    if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
      return {
        error: "Format HEIC/HEIF belum didukung. Ubah dulu ke JPG lalu unggah lagi.",
      };
    }
    if (file.type.startsWith("image/")) return { error: `Tipe file tidak didukung. ${HINT.image}` };
    if (file.type.startsWith("audio/")) return { error: `Tipe file tidak didukung. ${HINT.audio}` };
    return { error: "Tipe file tidak didukung" };
  }

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { error: `Ekstensi .${ext} tidak diizinkan. ${HINT[kind]}` };
  }

  if (file.size > MAX_SIZE[kind]) {
    const mb = MAX_SIZE[kind] / (1024 * 1024);
    return { error: `File terlalu besar (maksimal ${mb} MB).` };
  }

  const extension = (file.type ? EXTENSION_BY_TYPE[file.type] : ext) || ext;
  if (!ALLOWED_EXTENSIONS[kind].includes(extension)) {
    return { error: `Ekstensi .${ext} tidak didukung. ${HINT[kind]}` };
  }

  return { kind, extension };
}
