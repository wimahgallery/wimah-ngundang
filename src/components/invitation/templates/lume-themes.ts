import type { LumeTheme } from "./lume-theme";

/**
 * Varian Lume — satu arsitektur komponen, sembilan dunia visual.
 * Setiap tema membawa DNA lengkap: tekstur, radius, border, treatment foto,
 * bahasa kicker, dan motion. Implementasi CSS-nya di invitation-dna.css.
 * Latar tema terang sengaja dibereng sedikit (×0.95) supaya putihnya tidak
 * menyilaukan — nilai bg/surface/glass/pageGradient ikut menyesuaikan.
 */

export const chocolateDream: LumeTheme = {
  id: "chocolate-dream",
  css: {
    "--background": "#EEEAE3",
    "--text-primary": "#3E2C21",
    "--text-secondary": "#6E5A4A",
    "--surface": "#E5DBCF",
    "--surface-secondary": "#DBCDBD",
    "--accent": "#8A5A3B",
    "--accent-light": "#A4714F",
    "--accent-dark": "#6B4429",
    "--gold": "#C08A4E",
    "--border": "rgba(62, 44, 33, 0.14)",
    "--hero": "#3B2A20",
    "--hero-ink": "#F8F1E7",
    "--glass": "rgba(238, 234, 227, 0.85)",
    "--glass-border": "rgba(62, 44, 33, 0.10)",
    "--stage-panel": "#3B2A20",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #4E3728 0%, #3B2A20 55%, #2A1E16 100%)",
    "--stage-ring": "rgba(192, 138, 78, 0.32)",
  },
  pageGradient:
    "linear-gradient(135deg, #EEEAE3 0%, #E5DBCF 50%, #EEEAE3 100%)",
  layout: {
    openingPhoto: "left",
    tones: {
      couple: "plain",
      story: "soft",
      countdown: "soft",
      gallery: "plain",
      gift: "soft",
    },
  },
  dna: {
    cssClass: "dna-chocolate",
    radius: "round",
    borders: "framed",
    density: "normal",
    imageTreatment: "cinematic",
    kickerStyle: "letterspaced",
    motion: "liquid",
  },
};

export const truePotential: LumeTheme = {
  id: "true-potential",
  css: {
    "--background": "#EAECEA",
    "--text-primary": "#16211B",
    "--text-secondary": "#4C5851",
    "--surface": "#DBE1DC",
    "--surface-secondary": "#CCD7CF",
    "--accent": "#2F6B4F",
    "--accent-light": "#3F8564",
    "--accent-dark": "#235341",
    "--gold": "#B08D3F",
    "--border": "rgba(22, 33, 27, 0.12)",
    "--hero": "#12211A",
    "--hero-ink": "#F1F6F2",
    "--glass": "rgba(234, 236, 234, 0.85)",
    "--glass-border": "rgba(22, 33, 27, 0.10)",
    "--stage-panel": "#12211A",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #1C3128 0%, #12211A 55%, #0B1611 100%)",
    "--stage-ring": "rgba(176, 141, 63, 0.30)",
  },
  pageGradient: "linear-gradient(180deg, #EAECEA 0%, #DBE1DC 100%)",
  layout: {
    heroPhoto: "left",
    agendaHeader: "right",
    storyFirstPhoto: "right",
    galleryWide: true,
    tones: {
      couple: "soft",
      story: "plain",
      countdown: "plain",
      gallery: "soft",
      gift: "soft",
    },
  },
  dna: {
    cssClass: "dna-editorial",
    radius: "sharp",
    borders: "offset",
    density: "compact",
    imageTreatment: "editorial",
    kickerStyle: "numbered",
    motion: "typographic",
  },
};

export const ivoryDream: LumeTheme = {
  id: "ivory-dream",
  css: {
    "--background": "#EFEEE8",
    "--text-primary": "#4A4238",
    "--text-secondary": "#7C7263",
    "--surface": "#E8E3D8",
    "--surface-secondary": "#DFD9C9",
    "--accent": "#9C7F55",
    "--accent-light": "#B29A72",
    "--accent-dark": "#7E6544",
    "--gold": "#C6AE85",
    "--border": "rgba(74, 66, 56, 0.13)",
    "--hero": "#2F2A23",
    "--hero-ink": "#F9F5EC",
    "--glass": "rgba(239, 238, 232, 0.85)",
    "--glass-border": "rgba(74, 66, 56, 0.10)",
    "--heading-font": "var(--font-cormorant)",
    "--stage-panel": "#2F2A23",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #453E33 0%, #2F2A23 55%, #1F1B16 100%)",
    "--stage-ring": "rgba(198, 174, 133, 0.32)",
  },
  pageGradient:
    "linear-gradient(150deg, #EFEEE8 0%, #E8E3D8 55%, #EFEEE8 100%)",
  layout: {
    openingPhoto: "left",
    coupleStagger: "first",
    thankPhoto: "right",
    tones: {
      couple: "soft",
      story: "soft",
      countdown: "plain",
      gallery: "soft",
      gift: "plain",
    },
  },
  dna: {
    cssClass: "dna-ivory",
    radius: "slightly",
    borders: "double",
    density: "normal",
    imageTreatment: "fineart",
    kickerStyle: "plain",
    motion: "paper",
  },
};

export const milkyWhite: LumeTheme = {
  id: "milky-white",
  css: {
    "--background": "#F2F2F2",
    "--text-primary": "#2B2B29",
    "--text-secondary": "#70706C",
    "--surface": "#E8E8E6",
    "--surface-secondary": "#E0E0DD",
    "--accent": "#6E7C86",
    "--accent-light": "#8A97A0",
    "--accent-dark": "#56636C",
    "--gold": "#B9AFA2",
    "--border": "rgba(43, 43, 41, 0.10)",
    "--hero": "#1D1D1C",
    "--hero-ink": "#FAFAF9",
    "--glass": "rgba(242, 242, 242, 0.85)",
    "--glass-border": "rgba(43, 43, 41, 0.08)",
    "--stage-panel": "#1D1D1C",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #2C2C2A 0%, #1D1D1C 55%, #101010 100%)",
    "--stage-ring": "rgba(185, 175, 162, 0.35)",
  },
  pageGradient: "linear-gradient(180deg, #F2F2F2 0%, #E8E8E6 100%)",
  layout: {
    coupleStagger: "first",
    galleryWide: true,
    tones: {
      couple: "plain",
      story: "plain",
      countdown: "soft",
      gallery: "plain",
      gift: "plain",
    },
  },
  dna: {
    cssClass: "dna-milky",
    radius: "pill",
    borders: "none",
    density: "airy",
    imageTreatment: "airy",
    kickerStyle: "plain",
    motion: "float",
  },
};

export const simpleBlack: LumeTheme = {
  id: "simple-black",
  css: {
    "--background": "#F2F2F2",
    "--text-primary": "#111111",
    "--text-secondary": "#5C5C5C",
    "--surface": "#E9E9E9",
    "--surface-secondary": "#DFDFDF",
    "--accent": "#111111",
    "--accent-light": "#333333",
    "--accent-dark": "#000000",
    "--gold": "#EDEDED",
    "--border": "rgba(17, 17, 17, 0.12)",
    "--hero": "#0B0B0B",
    "--hero-ink": "#FAFAFA",
    "--glass": "rgba(242, 242, 242, 0.85)",
    "--glass-border": "rgba(17, 17, 17, 0.10)",
    "--heading-font": "var(--font-inter)",
    "--stage-panel": "#0B0B0B",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #171717 0%, #0B0B0B 55%, #000000 100%)",
    "--stage-ring": "rgba(255, 255, 255, 0.22)",
  },
  pageGradient: "linear-gradient(180deg, #F2F2F2 0%, #E9E9E9 100%)",
  layout: {
    heroPhoto: "left",
    agendaHeader: "right",
    storyFirstPhoto: "right",
    thankPhoto: "right",
    tones: {
      couple: "plain",
      story: "plain",
      countdown: "plain",
      gallery: "plain",
      gift: "plain",
    },
  },
  dna: {
    cssClass: "dna-simple",
    radius: "sharp",
    borders: "hairline",
    density: "airy",
    imageTreatment: "raw",
    kickerStyle: "vertical",
    motion: "precise",
  },
};

export const elegantBlack: LumeTheme = {
  id: "elegant-black",
  css: {
    "--background": "#0C0C0B",
    "--text-primary": "#F2EFE8",
    "--text-secondary": "#A9A49A",
    "--surface": "#161614",
    "--surface-secondary": "#1E1E1B",
    "--accent": "#C9A227",
    "--accent-light": "#DDB948",
    "--accent-dark": "#E0C05A",
    "--gold": "#D4A853",
    "--border": "rgba(242, 239, 232, 0.14)",
    "--hero": "#080807",
    "--hero-ink": "#F6F2E7",
    "--glass": "rgba(12, 12, 11, 0.85)",
    "--glass-border": "rgba(242, 239, 232, 0.10)",
    "--stage-panel": "#080807",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #1A160D 0%, #0B0A08 55%, #050505 100%)",
    "--stage-ring": "rgba(212, 168, 83, 0.35)",
  },
  pageGradient:
    "linear-gradient(160deg, #0C0C0B 0%, #161614 50%, #0A0A09 100%)",
  layout: {
    openingPhoto: "left",
    tones: {
      couple: "soft",
      story: "soft",
      countdown: "soft",
      gallery: "soft",
      gift: "soft",
    },
  },
  dna: {
    cssClass: "dna-elegant",
    radius: "slightly",
    borders: "metallic",
    density: "normal",
    imageTreatment: "dramatic",
    kickerStyle: "metallic",
    motion: "cinematic",
  },
};

export const sora: LumeTheme = {
  id: "sora",
  css: {
    "--background": "#EBEBEE",
    "--text-primary": "#1A1A24",
    "--text-secondary": "#5A5A6B",
    "--surface": "#E0E0EA",
    "--surface-secondary": "#D5D5E3",
    "--accent": "#4F46E5",
    "--accent-light": "#6366F1",
    "--accent-dark": "#3730A3",
    "--gold": "#E8A33D",
    "--border": "rgba(26, 26, 36, 0.12)",
    "--hero": "#12122A",
    "--hero-ink": "#F4F4FF",
    "--glass": "rgba(235, 235, 238, 0.85)",
    "--glass-border": "rgba(26, 26, 36, 0.10)",
    "--heading-font": "var(--font-sora)",
    "--elegant-font": "var(--font-sora)",
    "--stage-panel": "#12122A",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #1E1E42 0%, #12122A 55%, #0A0A1A 100%)",
    "--stage-ring": "rgba(232, 163, 61, 0.30)",
  },
  pageGradient: "linear-gradient(180deg, #EBEBEE 0%, #E0E0EA 100%)",
  layout: {
    heroPhoto: "left",
    agendaHeader: "right",
    storyFirstPhoto: "right",
    thankPhoto: "right",
    coupleStagger: "first",
    galleryWide: true,
    tones: {
      couple: "soft",
      story: "plain",
      countdown: "plain",
      gallery: "soft",
      gift: "soft",
    },
  },
  dna: {
    cssClass: "dna-sora",
    radius: "soft",
    borders: "none",
    density: "airy",
    imageTreatment: "serene",
    kickerStyle: "plain",
    motion: "drift",
  },
};

export const aka: LumeTheme = {
  id: "aka",
  css: {
    "--background": "#EEEEEC",
    "--text-primary": "#1A1614",
    "--text-secondary": "#6C635D",
    "--surface": "#E6E1DB",
    "--surface-secondary": "#DBD4CB",
    "--accent": "#B3261E",
    "--accent-light": "#C6392F",
    "--accent-dark": "#8E1D17",
    "--gold": "#D9573A",
    "--border": "rgba(26, 22, 20, 0.14)",
    "--hero": "#17110F",
    "--hero-ink": "#F7F0EA",
    "--glass": "rgba(238, 238, 236, 0.85)",
    "--glass-border": "rgba(26, 22, 20, 0.10)",
    "--heading-font": "var(--font-cormorant)",
    "--stage-panel": "#17110F",
    "--stage-column":
      "radial-gradient(120% 80% at 75% 8%, #2A1A15 0%, #17110F 55%, #0C0806 100%)",
    "--stage-ring": "rgba(217, 87, 58, 0.32)",
  },
  pageGradient:
    "linear-gradient(135deg, #EEEEEC 0%, #E6E1DB 50%, #EEEEEC 100%)",
  layout: {
    openingPhoto: "left",
    storyFirstPhoto: "left",
    tones: {
      couple: "soft",
      story: "plain",
      countdown: "soft",
      gallery: "plain",
      gift: "soft",
    },
  },
  dna: {
    cssClass: "dna-aka",
    radius: "sharp",
    borders: "inked",
    density: "compact",
    imageTreatment: "inked",
    kickerStyle: "brushed",
    motion: "ink",
  },
};

export const lumeVariant: LumeTheme = {
  id: "lume",
  // Latar default (dari :root globals) dibereng ×0.95 di sini saja —
  // :root tidak boleh diubah karena dipakai juga oleh halaman admin/site.
  css: {
    "--background": "#E9E7E2",
    "--surface": "#DCD8CD",
    "--surface-secondary": "#D2CDC2",
    "--glass": "rgba(233, 231, 226, 0.85)",
  },
  pageGradient: "linear-gradient(135deg, #E9E7E2 0%, #DCD8CD 50%, #E9E7E2 100%)",
  layout: {},
};
