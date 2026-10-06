export type MusicTrack = {
  id: string;
  name: string;
  url: string;
  file_id?: string | null;
  duration_seconds?: number | null;
  created_at: string;
};

const BASE = "/api/music";

export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  const res = await fetch(BASE);
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || "Gagal memuat daftar musik");
  }
  const json = await res.json();
  return Array.isArray(json.data) ? (json.data as MusicTrack[]) : [];
}

export async function createMusicTrack(input: {
  file: File;
  name: string;
  durationSeconds?: number | null;
}): Promise<MusicTrack> {
  const body = new FormData();
  body.append("file", input.file);
  body.append("name", input.name);
  if (input.durationSeconds) body.append("duration_seconds", String(input.durationSeconds));

  const res = await fetch(BASE, { method: "POST", body });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Gagal menyimpan musik");
  return json.data as MusicTrack;
}

export async function deleteMusicTrack(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || "Gagal menghapus musik");
  }
}

/** Detik → "m:ss" (null/tanpa durasi ditampilkan sebagai "—"). */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
