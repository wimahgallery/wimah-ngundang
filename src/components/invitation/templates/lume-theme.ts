"use client";

import { createContext, useContext } from "react";

export type BandTone = "plain" | "soft" | "dark";

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
}

export interface LumeThemeValue {
  css: Record<string, string>;
  pageGradient?: string;
  layout: LumeLayout;
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

export function resolveLumeTheme(theme: LumeTheme): LumeThemeValue {
  return {
    css: theme.css,
    pageGradient: theme.pageGradient,
    layout: {
      ...defaultLumeLayout,
      ...theme.layout,
      tones: { ...defaultLumeLayout.tones, ...theme.layout?.tones },
    },
  };
}

const LumeThemeContext = createContext<LumeThemeValue>({
  css: {},
  layout: defaultLumeLayout,
});

export const LumeThemeProvider = LumeThemeContext.Provider;

export function useLumeTheme(): LumeThemeValue {
  return useContext(LumeThemeContext);
}
