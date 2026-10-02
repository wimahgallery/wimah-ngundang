"use client";

import { createContext, useContext } from "react";

export type BandTone = "plain" | "soft" | "dark";

/**
 * VISUAL DNA — satu objek = satu dunia visual template.
 * Palet (css) hanya bagian kecil; identitas datang dari tekstur, radius,
 * border, treatment foto, dan bahasa gerak. Tipografi DNA (personality,
 * default, pairing) hidup di @/lib/font-library → TEMPLATE_TYPOGRAPHY.
 */
export interface VisualDna {
  /**
   * Kelas DNA dari invitation-dna.css — wajib disetel via data-template
   * pada elemen root template. Semua tekstur/dekorasi/motion terikat di situ.
   */
  cssClass: string;
  /** Gaya sudut komponen kartu/gambar. */
  radius: "sharp" | "slightly" | "soft" | "round" | "pill";
  /** Bahasa border: hairline / framed / double / offset / metallic / inked / none. */
  borders: "none" | "hairline" | "framed" | "double" | "offset" | "metallic" | "inked";
  /** Kepadatan visual: compact (editorial) → airy (minimal). */
  density: "compact" | "normal" | "airy";
  /** Treatment foto (filter CSS di invitation-dna.css). */
  imageTreatment: "luminous" | "cinematic" | "editorial" | "fineart" | "airy" | "raw" | "dramatic" | "serene" | "inked";
  /** Kicker (label kecil section): cara template berbisik. */
  kickerStyle: "letterspaced" | "numbered" | "brushed" | "plain" | "vertical" | "metallic";
  /** Bahasa gerak. Kelas animasi di invitation-dna.css, hormat prefers-reduced-motion. */
  motion: "breathe" | "liquid" | "typographic" | "ink" | "paper" | "float" | "precise" | "cinematic" | "drift";
}

/** Penempatan & ritme section — tiap varian boleh menggeser posisi seperti tema-nya. */
export interface LumeLayout {
  heroPhoto: "right" | "left";
  openingPhoto: "right" | "left";
  openingStagger: "first" | "second";
  coupleStagger: "first" | "second";
  storyFirstPhoto: "left" | "right";
  agendaHeader: "left" | "right";
  thankPhoto: "left" | "right";
  galleryWide: boolean;
  tones: {
    couple: BandTone;
    story: BandTone;
    countdown: BandTone;
    gallery: BandTone;
    gift: BandTone;
  };
}

export interface LumeTheme {
  id: string;
  /** Override custom property mentah (:root) — di-apply inline di root template. */
  css: Record<string, string>;
  /** Latar root template. Tanpa ini → kelas .bg-blob-1 (kompromi Lume asli). */
  pageGradient?: string;
  layout?: Partial<LumeLayout>;
  /** DNA visual template — lihat invitation-dna.css untuk implementasinya. */
  dna?: Partial<VisualDna>;
}

export interface LumeThemeValue {
  id: string;
  css: Record<string, string>;
  pageGradient?: string;
  layout: LumeLayout;
  dna: VisualDna;
}

export const defaultLumeLayout: LumeLayout = {
  heroPhoto: "right",
  openingPhoto: "right",
  openingStagger: "second",
  coupleStagger: "second",
  storyFirstPhoto: "left",
  agendaHeader: "left",
  thankPhoto: "left",
  galleryWide: false,
  tones: { couple: "soft", story: "plain", countdown: "soft", gallery: "soft", gift: "soft" },
};

/** DNA default (Lume) — varian lain mengoverride bagian yang berbeda. */
export const defaultDna: VisualDna = {
  cssClass: "dna-lume",
  radius: "soft",
  borders: "hairline",
  density: "normal",
  imageTreatment: "luminous",
  kickerStyle: "letterspaced",
  motion: "breathe",
};

export function resolveLumeTheme(theme: LumeTheme): LumeThemeValue {
  return {
    id: theme.id,
    css: theme.css,
    pageGradient: theme.pageGradient,
    layout: {
      ...defaultLumeLayout,
      ...theme.layout,
      tones: { ...defaultLumeLayout.tones, ...theme.layout?.tones },
    },
    dna: { ...defaultDna, ...theme.dna },
  };
}

const LumeThemeContext = createContext<LumeThemeValue>({
  id: "lume",
  css: {},
  layout: defaultLumeLayout,
  dna: defaultDna,
});

export const LumeThemeProvider = LumeThemeContext.Provider;

export function useLumeTheme(): LumeThemeValue {
  return useContext(LumeThemeContext);
}
