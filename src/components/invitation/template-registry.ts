import type { ComponentType } from "react";
import type { Invitation } from "@/lib/invitation";
import { FallbackTemplate } from "./fallback-template";

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

export const templateMeta: { id: TemplateId; name: string; description: string }[] = [
  { id: "lume", name: "Lume", description: "Klasik hangat dengan loading nama pasangan, agenda lengkap, aksen emas" },
  { id: "chocolate-dream", name: "Chocolate Dream", description: "Cokelat hangat dan krem lembut, romantis seperti cokelat leleh" },
  { id: "true-potential", name: "True Potential", description: "Hijau pekat dan putih bersih, modern dan penuh harapan" },
  { id: "ivory-dream", name: "Ivory Dream", description: "Gading lembut dengan serif romantis dan aksen emas pudar" },
  { id: "milky-white", name: "Milky White", description: "Putih susu super terang, lapang dan minim distraksi" },
  { id: "simple-black", name: "Simple Black", description: "Hitam putih monokrom, bersih tanpa ornamen berlebih" },
  { id: "elegant-black", name: "Elegant Black", description: "Halaman gelap mewah dengan aksen emas menyala" },
  { id: "sora", name: "Sora", description: "Tipografi geometris modern dengan aksen indigo berani" },
  { id: "aka", name: "Aka", description: "Merah bata, hitam, dan putih dengan sentuhan oriental elegan" },
];

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
