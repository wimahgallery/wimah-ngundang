import type { ComponentType } from "react";
import type { Invitation } from "@/lib/invitation";
import { FallbackTemplate } from "./fallback-template";
import {
  aka,
  chocolateDream,
  elegantBlack,
  ivoryDream,
  milkyWhite,
  sora,
  simpleBlack,
  truePotential,
} from "./templates/lume-themes";

export const TEMPLATE_IDS = [
  "lume",
  "chocolate-dream",
  "true-potential",
  "ivory-dream",
  "milky-white",
  "simple-black",
  "elegant-black",
  "sora",
  "aka",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateColors = {
  background: string;
  hero: string;
  accent: string;
  gold: string;
};

const colorsOf = (css: Record<string, string>): TemplateColors => ({
  background: css["--background"] ?? "#FFFFFF",
  hero: css["--hero"] ?? "#141512",
  accent: css["--accent"] ?? "#7C8472",
  gold: css["--gold"] ?? "#D4A853",
});

/** Palet bawaan Lume — token :root di globals.css. */
const lumeColors: TemplateColors = {
  background: "#F5F3EE",
  hero: "#141512",
  accent: "#7C8472",
  gold: "#D4A853",
};

export const templateMeta: {
  id: TemplateId;
  name: string;
  description: string;
  colors: TemplateColors;
}[] = [
  { id: "lume", name: "Lume", description: "Cahaya lilin di atas ivory — glow lembut, grain kertas hangat, serif romantis", colors: lumeColors },
  { id: "chocolate-dream", name: "Chocolate Dream", description: "Velvet kakao berlapis dengan kilau glossy, kartu rasa kemasan cokelat premium", colors: colorsOf(chocolateDream.css) },
  { id: "true-potential", name: "True Potential", description: "Editorial print berani — sudut tajam, nomor raksasa, tipografi jadi dekorasi", colors: colorsOf(truePotential.css) },
  { id: "ivory-dream", name: "Ivory Dream", description: "Kertas handmade berserat dengan bingkai tinta ganda dan nuansa fine-art", colors: colorsOf(ivoryDream.css) },
  { id: "milky-white", name: "Milky White", description: "Susu dan awan — sudut bulat lembut, bayangan tersebar, mengambang tenang", colors: colorsOf(milkyWhite.css) },
  { id: "simple-black", name: "Simple Black", description: "Art book minimalis — nol ornamen, hanya tipografi, spasi, dan rule tipis", colors: colorsOf(simpleBlack.css) },
  { id: "elegant-black", name: "Elegant Black", description: "Satin hitam sinematik dengan bingkai metalik emas dan sorot spotlight", colors: colorsOf(elegantBlack.css) },
  { id: "sora", name: "Sora", description: "Langit dan horizon — awan berarak pelan, kartu kaca tenang, hening", colors: colorsOf(sora.css) },
  { id: "aka", name: "Aka", description: "Washi dan tinta vermilion — sudut tajam, stempel merah, goresan kuas", colors: colorsOf(aka.css) },
];

export const templateMetaById = Object.fromEntries(
  templateMeta.map((t) => [t.id, t]),
) as Record<TemplateId, (typeof templateMeta)[number]>;

export function isTemplateId(id: string): id is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(id);
}

export type TemplateProps = {
  invitation: Invitation;
  /** true saat halaman dibuka di dalam kolom mobile desktop (?embed=1) */
  embed?: boolean;
  /** URL undangan untuk iframe kolom mobile (hanya di halaman induk) */
  frameSrc?: string;
};

export async function loadTemplate(id: TemplateId): Promise<ComponentType<TemplateProps>> {
  try {
    switch (id) {
      case "lume":
        return (await import("./templates/lume")).default;
      case "chocolate-dream":
        return (await import("./templates/chocolate-dream")).default;
      case "true-potential":
        return (await import("./templates/true-potential")).default;
      case "ivory-dream":
        return (await import("./templates/ivory-dream")).default;
      case "milky-white":
        return (await import("./templates/milky-white")).default;
      case "simple-black":
        return (await import("./templates/simple-black")).default;
      case "elegant-black":
        return (await import("./templates/elegant-black")).default;
      case "sora":
        return (await import("./templates/sora")).default;
      case "aka":
        return (await import("./templates/aka")).default;
      default:
        return FallbackTemplate;
    }
  } catch {
    return FallbackTemplate;
  }
}
