export type FontOption = {
  id: string;
  name: string;
  family: string;
  weights: number[];
  fallback: "serif" | "sans-serif" | "cursive";
};

/** Font judul/nama pasangan — romantis & elegan, cocok untuk undangan pernikahan. */
export const HEADING_FONTS: FontOption[] = [
  { id: "cormorant", name: "Cormorant Garamond", family: "Cormorant Garamond", weights: [400, 500, 600], fallback: "serif" },
  { id: "playfair", name: "Playfair Display", family: "Playfair Display", weights: [400, 500, 600, 700], fallback: "serif" },
  { id: "eb-garamond", name: "EB Garamond", family: "EB Garamond", weights: [400, 500, 600], fallback: "serif" },
  { id: "libre-baskerville", name: "Libre Baskerville", family: "Libre Baskerville", weights: [400, 700], fallback: "serif" },
  { id: "lora", name: "Lora", family: "Lora", weights: [400, 500, 600], fallback: "serif" },
  { id: "prata", name: "Prata", family: "Prata", weights: [400], fallback: "serif" },
  { id: "bodoni", name: "Bodoni Moda", family: "Bodoni Moda", weights: [400, 500, 600], fallback: "serif" },
  { id: "cinzel", name: "Cinzel", family: "Cinzel", weights: [400, 500, 600], fallback: "serif" },
  { id: "gilda", name: "Gilda Display", family: "Gilda Display", weights: [400], fallback: "serif" },
  { id: "cardo", name: "Cardo", family: "Cardo", weights: [400, 700], fallback: "serif" },
  { id: "great-vibes", name: "Great Vibes", family: "Great Vibes", weights: [400], fallback: "cursive" },
  { id: "pinyon", name: "Pinyon Script", family: "Pinyon Script", weights: [400], fallback: "cursive" },
  { id: "parisienne", name: "Parisienne", family: "Parisienne", weights: [400], fallback: "cursive" },
  { id: "dancing", name: "Dancing Script", family: "Dancing Script", weights: [400, 500, 600, 700], fallback: "cursive" },
  { id: "allura", name: "Allura", family: "Allura", weights: [400], fallback: "cursive" },
  { id: "alex-brush", name: "Alex Brush", family: "Alex Brush", weights: [400], fallback: "cursive" },
  { id: "italianno", name: "Italianno", family: "Italianno", weights: [400], fallback: "cursive" },
  { id: "tangerine", name: "Tangerine", family: "Tangerine", weights: [400, 500, 700], fallback: "cursive" },
];

/** Font teks/paragraf — terbaca nyaman, tetap terasa hangat. */
export const BODY_FONTS: FontOption[] = [
  { id: "inter", name: "Inter", family: "Inter", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "dm-sans", name: "DM Sans", family: "DM Sans", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "jost", name: "Jost", family: "Jost", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "raleway", name: "Raleway", family: "Raleway", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "work-sans", name: "Work Sans", family: "Work Sans", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "nunito-sans", name: "Nunito Sans", family: "Nunito Sans", weights: [400, 500, 600], fallback: "sans-serif" },
  { id: "lora", name: "Lora", family: "Lora", weights: [400, 500, 600], fallback: "serif" },
  { id: "eb-garamond", name: "EB Garamond", family: "EB Garamond", weights: [400, 500, 600], fallback: "serif" },
  { id: "source-serif", name: "Source Serif 4", family: "Source Serif 4", weights: [400, 500, 600], fallback: "serif" },
];

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

export type FontSettingsLike = { heading?: string | null; body?: string | null } | null | undefined;

export function findHeadingFont(id: string | null | undefined): FontOption | null {
  return id ? HEADING_FONTS.find((f) => f.id === id) ?? null : null;
}

export function findBodyFont(id: string | null | undefined): FontOption | null {
  return id ? BODY_FONTS.find((f) => f.id === id) ?? null : null;
}

export function fontStack(option: FontOption | null, kind: "heading" | "body"): string {
  const resolved = option ?? (kind === "heading" ? DEFAULT_HEADING : DEFAULT_BODY);
  return `"${resolved.family}", ${resolved.fallback}`;
}

function hrefFor(families: FontOption[]): string {
  const params = families
    .map((f) => `family=${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** URL Google Fonts untuk font undangan yang dipilih user (null kalau masih bawaan). */
export function invitationFontsHref(font: FontSettingsLike): string | null {
  const heading = findHeadingFont(font?.heading);
  const body = findBodyFont(font?.body);
  const families: FontOption[] = [];
  if (heading) families.push(heading);
  if (body && body.family !== heading?.family) families.push(body);
  return families.length ? hrefFor(families) : null;
}

/** Custom property yang di-merge ke root template (mengalahkan :root & varian tema). */
export function resolveFontVars(font: FontSettingsLike): Record<string, string> {
  const heading = findHeadingFont(font?.heading);
  const body = findBodyFont(font?.body);
  const vars: Record<string, string> = {};
  if (heading) {
    vars["--heading-font"] = fontStack(heading, "heading");
    vars["--elegant-font"] = fontStack(heading, "heading");
  }
  if (body) vars["--body-font"] = fontStack(body, "body");
  return vars;
}

/** CSS untuk specimen picker di dashboard — di-chunk supaya URL tidak kepanjangan. */
export const SPECIMEN_HREFS: string[] = (() => {
  const byFamily = new Map<string, FontOption>();
  for (const option of [...HEADING_FONTS, ...BODY_FONTS]) {
    if (!byFamily.has(option.family)) byFamily.set(option.family, option);
  }
  const all = [...byFamily.values()];
  const chunks: FontOption[][] = [];
  for (let i = 0; i < all.length; i += 8) chunks.push(all.slice(i, i + 8));
  return chunks.map(hrefFor);
})();
