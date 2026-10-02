import type { TemplateId } from "@/components/invitation/template-registry";

/* ────────────────────────────────────────────────────────────────────────────
 * FONT LIBRARY — metadata terpusat untuk seluruh font di platform.
 *
 * Satu-satunya sumber kebenaran untuk:
 *  - kategori & kepribadian tiap font
 *  - peran yang aman (heading / body / accent)
 *  - kompatibilitas font ↔ template (Recommended / Compatible / All)
 *  - pairing & default typography per template
 *
 * Komponen UI TIDAK boleh hardcode daftar font — semuanya lewat engine di sini.
 *                                                                         */

export type FontCategory = "serif" | "sans" | "display" | "script" | "handwriting" | "mono";

export type FontRole = "heading" | "body" | "accent" | "ui";

export type FontMeta = {
  /** Google Fonts id (dipakai di FontSettings). */
  id: string;
  name: string;
  family: string;
  weights: number[];
  /** Fallback generik jika font gagal dimuat. */
  fallback: "serif" | "sans-serif" | "cursive" | "monospace";
  category: FontCategory;
  /** Kepribadian visual — dicocokkan dengan typography personality tiap template. */
  personality: string[];
  /** Peran yang aman untuk font ini. */
  roles: FontRole[];
  /** Skala besar default untuk display/heading (kalau font tahan ukuran besar). */
  displayScale?: number;
};

/** Kepribadian visual yang dikenali engine (subset untuk tampilan label Indonesia). */
export const PERSONALITY_LABELS: Record<string, string> = {
  romantic: "Romantis",
  elegant: "Elegan",
  editorial: "Editorial",
  warm: "Hangat",
  luxury: "Luxury",
  classic: "Klasik",
  modern: "Modern",
  bold: "Berani",
  minimal: "Minimal",
  clean: "Bersih",
  calm: "Tenang",
  natural: "Natural",
  serene: "Serenity",
  artistic: "Artistik",
  contemporary: "Kontemporer",
  strong: "Kuat",
  dramatic: "Dramatis",
  sophisticated: "Sophisticated",
  experimental: "Eksperimental",
  soft: "Lembut",
  playful: "Playful",
  traditional: "Tradisional",
  geometric: "Geometris",
  poetic: "Poetis",
};

const serif = (extra: Partial<FontMeta> = {}): Pick<FontMeta, "category" | "fallback"> => ({
  category: "serif",
  fallback: "serif",
  ...extra,
});

/* ── Katalog font ─────────────────────────────────────────────────────────── */

export const FONT_LIBRARY: FontMeta[] = [
  // ── Serif klasik / editorial ──
  {
    ...serif(),
    id: "cormorant",
    name: "Cormorant Garamond",
    family: "Cormorant Garamond",
    weights: [400, 500, 600],
    personality: ["romantic", "elegant", "editorial", "poetic"],
    roles: ["heading", "accent"],
    displayScale: 1.1,
  },
  {
    ...serif(),
    id: "playfair",
    name: "Playfair Display",
    family: "Playfair Display",
    weights: [400, 500, 600, 700],
    personality: ["elegant", "editorial", "dramatic", "luxury"],
    roles: ["heading", "accent"],
    displayScale: 1.05,
  },
  {
    ...serif(),
    id: "eb-garamond",
    name: "EB Garamond",
    family: "EB Garamond",
    weights: [400, 500, 600],
    personality: ["classic", "editorial", "warm", "traditional"],
    roles: ["heading", "body", "accent"],
  },
  {
    ...serif(),
    id: "libre-baskerville",
    name: "Libre Baskerville",
    family: "Libre Baskerville",
    weights: [400, 700],
    personality: ["classic", "editorial", "traditional", "clean"],
    roles: ["heading", "body"],
  },
  {
    ...serif(),
    id: "lora",
    name: "Lora",
    family: "Lora",
    weights: [400, 500, 600],
    personality: ["warm", "elegant", "clean", "poetic"],
    roles: ["heading", "body", "accent"],
  },
  {
    ...serif(),
    id: "prata",
    name: "Prata",
    family: "Prata",
    weights: [400],
    personality: ["elegant", "dramatic", "luxury", "editorial"],
    roles: ["heading", "accent"],
    displayScale: 1.1,
  },
  {
    ...serif(),
    id: "bodoni",
    name: "Bodoni Moda",
    family: "Bodoni Moda",
    weights: [400, 500, 600],
    personality: ["editorial", "dramatic", "luxury", "sophisticated"],
    roles: ["heading", "accent"],
    displayScale: 1.1,
  },
  {
    ...serif(),
    id: "cinzel",
    name: "Cinzel",
    family: "Cinzel",
    weights: [400, 500, 600],
    personality: ["luxury", "dramatic", "sophisticated", "classic"],
    roles: ["heading", "accent"],
  },
  {
    ...serif(),
    id: "gilda",
    name: "Gilda Display",
    family: "Gilda Display",
    weights: [400],
    personality: ["elegant", "romantic", "editorial", "soft"],
    roles: ["heading", "accent"],
  },
  {
    ...serif(),
    id: "cardo",
    name: "Cardo",
    family: "Cardo",
    weights: [400, 700],
    personality: ["classic", "traditional", "editorial", "warm"],
    roles: ["heading", "body", "accent"],
  },
  {
    ...serif(),
    id: "source-serif",
    name: "Source Serif 4",
    family: "Source Serif 4",
    weights: [400, 500, 600],
    personality: ["modern", "clean", "editorial", "calm"],
    roles: ["heading", "body", "accent"],
  },

  // ── Sans modern ──
  {
    category: "sans",
    fallback: "sans-serif",
    id: "inter",
    name: "Inter",
    family: "Inter",
    weights: [400, 500, 600],
    personality: ["modern", "minimal", "clean"],
    roles: ["heading", "body", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "dm-sans",
    name: "DM Sans",
    family: "DM Sans",
    weights: [400, 500, 600],
    personality: ["modern", "clean", "warm", "minimal"],
    roles: ["heading", "body", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "jost",
    name: "Jost",
    family: "Jost",
    weights: [400, 500, 600],
    personality: ["geometric", "modern", "minimal", "calm"],
    roles: ["heading", "body", "accent", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat",
    weights: [400, 500, 600],
    personality: ["modern", "clean", "bold", "geometric"],
    roles: ["heading", "body", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "raleway",
    name: "Raleway",
    family: "Raleway",
    weights: [400, 500, 600],
    personality: ["elegant", "minimal", "sophisticated", "clean"],
    roles: ["heading", "body", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "work-sans",
    name: "Work Sans",
    family: "Work Sans",
    weights: [400, 500, 600],
    personality: ["modern", "clean", "calm", "minimal"],
    roles: ["heading", "body", "ui"],
  },
  {
    category: "sans",
    fallback: "sans-serif",
    id: "nunito-sans",
    name: "Nunito Sans",
    family: "Nunito Sans",
    weights: [400, 500, 600],
    personality: ["soft", "warm", "clean", "calm"],
    roles: ["heading", "body", "ui"],
  },

  // ── Script / kaligrafis ──
  {
    category: "script",
    fallback: "cursive",
    id: "great-vibes",
    name: "Great Vibes",
    family: "Great Vibes",
    weights: [400],
    personality: ["romantic", "elegant", "poetic", "soft"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "pinyon",
    name: "Pinyon Script",
    family: "Pinyon Script",
    weights: [400],
    personality: ["romantic", "elegant", "luxury", "traditional"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "parisienne",
    name: "Parisienne",
    family: "Parisienne",
    weights: [400],
    personality: ["romantic", "soft", "poetic", "warm"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "dancing",
    name: "Dancing Script",
    family: "Dancing Script",
    weights: [400, 500, 600, 700],
    personality: ["playful", "romantic", "warm", "soft"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "allura",
    name: "Allura",
    family: "Allura",
    weights: [400],
    personality: ["romantic", "elegant", "soft", "poetic"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "alex-brush",
    name: "Alex Brush",
    family: "Alex Brush",
    weights: [400],
    personality: ["romantic", "elegant", "poetic", "warm"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "italianno",
    name: "Italianno",
    family: "Italianno",
    weights: [400],
    personality: ["romantic", "elegant", "classic", "poetic"],
    roles: ["accent"],
  },
  {
    category: "script",
    fallback: "cursive",
    id: "tangerine",
    name: "Tangerine",
    family: "Tangerine",
    weights: [400, 500, 700],
    personality: ["romantic", "elegant", "traditional", "soft"],
    roles: ["accent"],
    displayScale: 1.15,
  },
];

const byId = new Map(FONT_LIBRARY.map((f) => [f.id, f]));

export function findFont(id: string | null | undefined): FontMeta | null {
  return id ? byId.get(id) ?? null : null;
}

/** Semua font yang boleh dipakai untuk suatu peran. */
export function fontsForRole(role: FontRole): FontMeta[] {
  return FONT_LIBRARY.filter((f) => f.roles.includes(role));
}

/* ────────────────────────────────────────────────────────────────────────────
 * TEMPLATE TYPOGRAPHY DNA — kepribadian + default + pairing per template.
 *                                                                         */

export type FontPreset = {
  heading: string | null;
  body: string | null;
  accent?: string | null;
};

export type FontPairing = {
  /** Kunci stabil untuk disimpan (kalau user memilih pairing utuh). */
  id: string;
  /** Label Indonesia yang ditampilkan di picker. */
  label: string;
  preset: FontPreset;
};

export type TemplateTypographyDna = {
  /** Kepribadian template — otak dari perangkingan Recommended. */
  personality: string[];
  /** Preset default — dipakai saat template baru / switch template. */
  default: FontPreset;
  /** Kategori font yang boleh jadi heading untuk template ini. */
  headingCategories: FontCategory[];
  /** Pairing kurasi yang tampil paling atas di picker. */
  pairings: FontPairing[];
};

/** Preset default suatu template — dipakai saat undangan baru / switch template. */
export function defaultPreset(templateId: TemplateId): FontPreset {
  return TEMPLATE_TYPOGRAPHY[templateId]?.default ?? { heading: null, body: null, accent: null };
}

export const TEMPLATE_TYPOGRAPHY: Record<TemplateId, TemplateTypographyDna> = {
  lume: {
    personality: ["romantic", "soft", "elegant", "editorial"],
    default: { heading: "cormorant", body: "dm-sans", accent: "cormorant" },
    headingCategories: ["serif", "script"],
    pairings: [
      { id: "lume-romantic", label: "Romantis", preset: { heading: "cormorant", body: "dm-sans", accent: "great-vibes" } },
      { id: "lume-editorial", label: "Editorial", preset: { heading: "playfair", body: "work-sans" } },
      { id: "lume-classic", label: "Klasik", preset: { heading: "libre-baskerville", body: "lora" } },
      { id: "lume-modern", label: "Modern", preset: { heading: "prata", body: "dm-sans" } },
    ],
  },
  "chocolate-dream": {
    personality: ["luxury", "warm", "classic", "editorial"],
    default: { heading: "playfair", body: "lora", accent: "playfair" },
    headingCategories: ["serif", "script"],
    pairings: [
      { id: "cd-rich", label: "Rich & Warm", preset: { heading: "playfair", body: "lora" } },
      { id: "cd-classic", label: "Klasik", preset: { heading: "libre-baskerville", body: "eb-garamond" } },
      { id: "cd-velvet", label: "Velvet", preset: { heading: "prata", body: "lora" } },
      { id: "cd-sweet", label: "Manis", preset: { heading: "cormorant", body: "dm-sans", accent: "parisienne" } },
    ],
  },
  "true-potential": {
    personality: ["modern", "bold", "editorial", "experimental"],
    default: { heading: "montserrat", body: "inter" },
    headingCategories: ["sans", "serif"],
    pairings: [
      { id: "tp-bold", label: "Bold Editorial", preset: { heading: "montserrat", body: "inter" } },
      { id: "tp-statement", label: "Statement", preset: { heading: "bodoni", body: "work-sans" } },
      { id: "tp-modern", label: "Modern Klasik", preset: { heading: "playfair", body: "work-sans" } },
      { id: "tp-geometric", label: "Geometris", preset: { heading: "jost", body: "inter" } },
    ],
  },
  "ivory-dream": {
    personality: ["romantic", "soft", "artistic", "traditional"],
    default: { heading: "cormorant", body: "eb-garamond", accent: "great-vibes" },
    headingCategories: ["serif", "script"],
    pairings: [
      { id: "id-heritage", label: "Heritage", preset: { heading: "cormorant", body: "eb-garamond" } },
      { id: "id-fineart", label: "Fine Art", preset: { heading: "gilda", body: "cardo" } },
      { id: "id-inked", label: "Bercores", preset: { heading: "cormorant", body: "lora", accent: "alex-brush" } },
      { id: "id-soft", label: "Lembut", preset: { heading: "lora", body: "nunito-sans" } },
    ],
  },
  "milky-white": {
    personality: ["minimal", "soft", "clean", "calm"],
    default: { heading: "jost", body: "nunito-sans" },
    headingCategories: ["sans", "serif"],
    pairings: [
      { id: "mw-airy", label: "Airy", preset: { heading: "jost", body: "nunito-sans" } },
      { id: "mw-quiet", label: "Quiet Luxury", preset: { heading: "raleway", body: "work-sans" } },
      { id: "mw-soft-serif", label: "Lembut Berserif", preset: { heading: "cormorant", body: "dm-sans" } },
      { id: "mw-clean", label: "Bersih", preset: { heading: "dm-sans", body: "inter" } },
    ],
  },
  "simple-black": {
    personality: ["minimal", "modern", "clean"],
    default: { heading: "inter", body: "inter" },
    headingCategories: ["sans", "serif"],
    pairings: [
      { id: "sb-swiss", label: "Swiss", preset: { heading: "inter", body: "inter" } },
      { id: "sb-precise", label: "Presisi", preset: { heading: "jost", body: "work-sans" } },
      { id: "sb-gallery", label: "Art Book", preset: { heading: "bodoni", body: "inter" } },
      { id: "sb-warm", label: "Hangat Minimal", preset: { heading: "lora", body: "work-sans" } },
    ],
  },
  "elegant-black": {
    personality: ["luxury", "dramatic", "editorial", "sophisticated"],
    default: { heading: "bodoni", body: "raleway", accent: "cinzel" },
    headingCategories: ["serif", "sans"],
    pairings: [
      { id: "eb-cinematic", label: "Cinematic", preset: { heading: "bodoni", body: "raleway" } },
      { id: "eb-blacktie", label: "Black Tie", preset: { heading: "cinzel", body: "raleway" } },
      { id: "eb-editorial", label: "Editorial Mewah", preset: { heading: "prata", body: "montserrat" } },
      { id: "eb-modern", label: "Modern Glam", preset: { heading: "playfair", body: "jost" } },
    ],
  },
  sora: {
    personality: ["calm", "minimal", "natural", "serene"],
    default: { heading: "jost", body: "work-sans" },
    headingCategories: ["sans", "serif"],
    pairings: [
      { id: "so-horizon", label: "Horizon", preset: { heading: "jost", body: "work-sans" } },
      { id: "so-calm-serif", label: "Tenang Berserif", preset: { heading: "cormorant", body: "nunito-sans" } },
      { id: "so-zen", label: "Zen", preset: { heading: "raleway", body: "work-sans" } },
      { id: "so-airy", label: "Ringan", preset: { heading: "dm-sans", body: "dm-sans" } },
    ],
  },
  aka: {
    personality: ["artistic", "editorial", "contemporary", "strong"],
    default: { heading: "cormorant", body: "inter", accent: "cormorant" },
    headingCategories: ["serif", "sans"],
    pairings: [
      { id: "ak-ink", label: "Tinta", preset: { heading: "cormorant", body: "inter" } },
      { id: "ak-brush", label: "Kuas", preset: { heading: "playfair", body: "work-sans", accent: "great-vibes" } },
      { id: "ak-statement", label: "Statement", preset: { heading: "bodoni", body: "montserrat" } },
      { id: "ak-quiet", label: "Tenang", preset: { heading: "lora", body: "inter" } },
    ],
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * ENGINE — perangkingan font terhadap satu template.
 *                                                                         */

export type FontTier = "recommended" | "compatible" | "rest";

export type RankedFont = {
  font: FontMeta;
  tier: FontTier;
  /** Skor kepribadian (jumlah personality yang cocok dengan template). */
  score: number;
};

/**
 * Kecocokan kepribadian font terhadap template.
 * - 0 → tidak ada irisan, font hanya masuk "rest".
 * - Skor tinggi → muncul lebih dulu di Recommended.
 */
export function personalityScore(font: FontMeta, templateId: TemplateId): number {
  const dna = TEMPLATE_TYPOGRAPHY[templateId];
  if (!dna) return 0;
  return font.personality.filter((p) => dna.personality.includes(p)).length;
}

function isCompatible(font: FontMeta, templateId: TemplateId): boolean {
  const dna = TEMPLATE_TYPOGRAPHY[templateId];
  if (!dna) return false;
  return personalityScore(font, templateId) > 0 || dna.headingCategories.includes(font.category);
}

/** Daftar font terurut untuk picker: Recommended → Compatible → sisanya (alfabet). */
export function rankFontsForTemplate(templateId: TemplateId, role: FontRole): RankedFont[] {
  const tierOrder: Record<FontTier, number> = { recommended: 0, compatible: 1, rest: 2 };
  return fontsForRole(role)
    .map((font) => {
      const score = personalityScore(font, templateId);
      const compatible = isCompatible(font, templateId);
      const tier: FontTier = score >= 2 ? "recommended" : compatible ? "compatible" : "rest";
      return { font, tier, score };
    })
    .sort((a, b) => {
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      if (a.tier === "rest") return a.font.name.localeCompare(b.font.name);
      return b.score - a.score || a.font.name.localeCompare(b.font.name);
    });
}

/** Cek kombinasi heading + body: minimal beda keluarga, dan bukan dua script. */
export function isPairingSane(headingId: string | null, bodyId: string | null): boolean {
  const heading = findFont(headingId);
  const body = findFont(bodyId);
  if (!heading || !body) return true; // default template → selalu oke
  if (heading.family === body.family) return true; // satu keluarga, dua peran → oke
  if (heading.category === "script" && body.category === "script") return false;
  return true;
}

/** Preset aman: kalau kombinasi user tidak sehat, kembalikan null (UI minta ubah). */
export function resolveSafePreset(
  templateId: TemplateId,
  preset: FontPreset | null | undefined,
): FontPreset {
  const fallback = TEMPLATE_TYPOGRAPHY[templateId]?.default ?? { heading: null, body: null };
  if (!preset) return fallback;
  if (!isPairingSane(preset.heading, preset.body)) return fallback;
  return {
    heading: preset.heading ?? fallback.heading,
    body: preset.body ?? fallback.body,
    accent: preset.accent ?? fallback.accent ?? null,
  };
}
