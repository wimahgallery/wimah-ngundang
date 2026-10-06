import { validateMediaFile, type MediaKind } from "@/lib/upload-validation";

const DIRECT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const SERVER_UPLOAD_URL = "/api/upload";

export type UploadedMedia = {
  url: string;
  /** Kosong bila file dikirim lewat server (server yang menyimpannya). */
  fileId: string;
  via: "direct" | "server";
};

type SignData = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folder: string;
};

type ValidatedFile = { kind: MediaKind; extension: string };

/** Validasi file sebelum unggahan — pesan errornya yang ditampilkan ke pengguna. */
export function assertValidUpload(file: File, kind?: MediaKind): ValidatedFile {
  const validated = validateMediaFile(file);
  if ("error" in validated) throw new Error(validated.error);
  if (kind && validated.kind !== kind) {
    throw new Error(
      kind === "audio"
        ? "File harus berupa musik (mp3, wav, aac, ogg, m4a)"
        : "File harus berupa gambar",
    );
  }
  return validated;
}

function uploadFileName(file: File, kind: MediaKind): string {
  const name = file.name.trim();
  if (name && name.includes(".")) return name;
  return `${name || kind}-upload-${Date.now()}.${kind === "audio" ? "mp3" : "jpg"}`;
}

/**
 * Unggah langsung ke ImageKit dengan tanda tangan dari server.
 *
 * Dipakai karena Vercel menolak body request di atas ±4,5 MB — foto HP dan
 * MP3 lebih besar dari itu, jadi file tidak boleh lewat server.
 */
export async function uploadDirect(file: File, folder?: string): Promise<UploadedMedia> {
  const sign = await signUpload(folder);
  const fileName = uploadFileName(file, file.type.startsWith("audio/") ? "audio" : "image");
  const form = new FormData();
  form.append("file", file, fileName);
  form.append("fileName", fileName);
  form.append("folder", sign.folder);
  form.append("useUniqueFileName", "true");
  form.append("publicKey", sign.publicKey);
  form.append("token", sign.token);
  form.append("expire", String(sign.expire));
  form.append("signature", sign.signature);

  const res = await fetch(DIRECT_UPLOAD_URL, { method: "POST", body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.url) throw new Error(json?.message || "Upload gagal");
  return { url: json.url as string, fileId: (json.fileId as string) || "", via: "direct" };
}

async function signUpload(folder?: string): Promise<SignData> {
  const res = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Gagal menyiapkan unggahan");
  return json.data as SignData;
}

/** Unggah lewat server — cadangan bila unggahan langsung tidak tersedia. */
async function uploadViaServer(file: File, folder?: string): Promise<UploadedMedia> {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);

  const res = await fetch(SERVER_UPLOAD_URL, { method: "POST", body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Upload gagal");
  return {
    url: (json.data?.url ?? json.url) as string,
    fileId: (json.data?.fileId as string) || "",
    via: "server",
  };
}

/**
 * Unggah media (gambar/musik): utama langsung ke ImageKit, cadangan lewat
 * `/api/upload` (berlaku untuk file kecil karena kena batas body Vercel).
 */
export async function uploadMedia(
  file: File,
  folder?: string,
  kind?: MediaKind,
): Promise<UploadedMedia> {
  assertValidUpload(file, kind);
  try {
    return await uploadDirect(file, folder);
  } catch {
    return uploadViaServer(file, folder);
  }
}
