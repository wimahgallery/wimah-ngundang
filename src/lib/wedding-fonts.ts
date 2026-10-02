import { findFont, fontsForRole, type FontMeta, type FontRole } from "@/lib/font-library";

/**
 * Jembatan antara font library terpusat (metadata) dan pemakaian di UI/CSS:
 * memuat font Google Fonts on-demand + memetakan pilihan user ke CSS vars.
 */

export type FontOption = {
  id: string;
  name: string;
  family: string;
  weights: number[];
  fallback: "serif" | "sans-serif" | "cursive" | "monospace";
};

export type FontSettingsLike = {
  heading?: string | null;
  body?: string | null;
  accent?: string | null;
} | null | undefined;

function toOption(font: FontMeta): FontOption {
  return {
    id: font.id,
    name: font.name,
    family: font.family,
    weights: font.weights,
    fallback: font.fallback,
  };
}

/** Semua pilihan font untuk suatu peran (dipakai picker). */
export function roleOptions(role: FontRole): FontOption[] {
  return fontsForRole(role).map(toOption);
}

export function findOption(id: string | null | undefined): FontOption | null {
  const font = findFont(id);
  return font ? toOption(font) : null;
}

/** Font bawaan template (Marcellus = font identitas platform, self-hosted). */
export const DEFAULT_HEADING: FontOption = {
  id: "",
  name: "Bawaan template (Marcellus)",
  family: "Marcellus",
  weights: [400],
  fallback: "serif",
};

export const DEFAULT_BODY: FontOption = {
  id: "",
  name: "Bawaan template (Inter)",
  family: "Inter",
  weights: [400, 500, 600],
  fallback: "sans-serif",
};

/** Aksen tanpa pilihan khusus mengikuti heading (perilaku lama yang aman). */
export const DEFAULT_ACCENT: FontOption = {
  id: "",
  name: "Mengikuti font judul",
  family: "",
  weights: [400],
  fallback: "serif",
};

export function findHeadingFont(id: string | null | undefined): FontOption | null {
  return findOption(id);
}

export function findBodyFont(id: string | null | undefined): FontOption | null {
  return findOption(id);
}

export function findAccentFont(id: string | null | undefined): FontOption | null {
  return findOption(id);
}

export function fontStack(option: FontOption | null, kind: "heading" | "body" | "accent"): string {
  if (kind === "accent" && option && option.family === "") {
    return fontStack(null, "heading"); // aksen mengikuti heading bawaan
  }
  const resolved = option ?? (kind === "body" ? DEFAULT_BODY : DEFAULT_HEADING);
  return `"${resolved.family}", ${resolved.fallback}`;
}

function hrefFor(families: FontOption[]): string {
  const params = families
    .map((f) => `family=${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** URL Google Fonts untuk kombinasi heading+body yang dipilih user (null kalau masih bawaan). */
export function invitationFontsHref(font: FontSettingsLike): string | null {
  const heading = findOption(font?.heading);
  const body = findOption(font?.body);
  const accent = findOption(font?.accent);
  const families: FontOption[] = [];
  if (heading) families.push(heading);
  if (body && body.family !== heading?.family) families.push(body);
  if (accent && accent.family && accent.family !== heading?.family && accent.family !== body?.family) {
    families.push(accent);
  }
  return families.length ? hrefFor(families) : null;
}

/** Custom property yang di-merge ke root template (mengalahkan :root & tema). */
export function resolveFontVars(font: FontSettingsLike): Record<string, string> {
  const heading = findOption(font?.heading);
  const body = findOption(font?.body);
  const accent = findOption(font?.accent);
  const vars: Record<string, string> = {};
  if (heading) {
    vars["--heading-font"] = fontStack(heading, "heading");
    vars["--elegant-font"] = fontStack(heading, "heading");
  }
  if (body) vars["--body-font"] = fontStack(body, "body");
  if (accent && accent.family) {
    vars["--accent-font"] = fontStack(accent, "accent");
  }
  return vars;
}

/* ── Pemuatan specimen on-demand (picker TIDAK boleh memuat semua font) ── */

const loadedSpecimens = new Set<string>(["Marcellus", "Cormorant Garamond", "Inter", "Playfair Display", "Sora"]);

function injectStylesheet(id: string, href: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Muat font spesifik untuk preview di picker (dipanggil saat font masuk viewport).
 * Font sudah termuat → no-op. Deduplikasi pakai Set supaya tidak dobel request.
 */
export function loadFontSpecimen(id: string | null | undefined) {
  if (typeof document === "undefined") return;
  const option = findOption(id);
  if (!option || loadedSpecimens.has(option.family)) return;
  loadedSpecimens.add(option.family);
  injectStylesheet(`font-specimen-${option.family.replace(/\s+/g, "-").toLowerCase()}`, hrefFor([option]));
}

/** Muat banyak specimen sekaligus (mis. pairing preset yang tampil di atas). */
export function loadFontSpecimens(ids: Array<string | null | undefined>) {
  ids.forEach(loadFontSpecimen);
}

/**
 * Muat font final undangan saat editor dibuka / preview dirender —
 * jauh lebih murah daripada memuat seluruh library di awal.
 */
export function ensureInvitationFontsLoaded(font: FontSettingsLike) {
  loadFontSpecimens([font?.heading, font?.body, font?.accent]);
}
