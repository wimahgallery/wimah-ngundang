export { cn } from "cn"

/**
 * Parse tanggal tanpa jebakan timezone.
 *
 * `new Date("2026-10-09")` (date-only, tanpa jam) di-parse sebagai **tengah
 * malam UTC**, bukan tanggal lokal — di zona negatif hasilnya maju/mundur satu
 * hari, dan antara server (UTC) dengan klien (WISA/WITA) bisa tidak sama.
 */
function parseDateInput(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = parseDateInput(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Hanya izinkan URL http(s) — tolak javascript:, data:, dan skema berbahaya lain. */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return value;
  } catch {
    // bukan URL absolut — tolak
  }
  return null;
}
