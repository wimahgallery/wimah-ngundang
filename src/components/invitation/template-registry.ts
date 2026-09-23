import type { ComponentType } from "react";
import type { Invitation } from "@/lib/invitation";
import { FallbackTemplate } from "./fallback-template";

export const TEMPLATE_IDS = [
  "elegant-classic",
  "neo-brutalism",
  "modern-minimal",
  "dark-premium",
  "garden-party",
  "timeline-journey",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const templateMeta: { id: TemplateId; name: string; description: string }[] = [
  { id: "elegant-classic", name: "Elegant Classic", description: "Klasik mewah dengan noise texture lembut, aksen emas" },
  { id: "neo-brutalism", name: "Neo Brutalism", description: "Editorial berani, border tebal, bayangan keras & tekstur kertas" },
  { id: "modern-minimal", name: "Modern Minimal", description: "Bersih dan kontemporer, desain putih bersih" },
  { id: "dark-premium", name: "Dark Premium", description: "Gelap mewah dengan tekstur halus, aksen emas royal" },
  { id: "garden-party", name: "Garden Party", description: "Cerah lembut dengan tekstur natural, warna pastel hijau" },
  { id: "timeline-journey", name: "Timeline Journey", description: "Naratif dengan timeline personal, hangat" },
];

export function isTemplateId(id: string): id is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(id);
}

export async function loadTemplate(id: TemplateId): Promise<ComponentType<{ invitation: Invitation }>> {
  try {
    switch (id) {
      case "elegant-classic":
        return (await import("./templates/elegant-classic")).default;
      case "neo-brutalism":
        return (await import("./templates/neo-brutalism")).default;
      case "modern-minimal":
        return (await import("./templates/modern-minimal")).default;
      case "dark-premium":
        return (await import("./templates/dark-premium")).default;
      case "garden-party":
        return (await import("./templates/garden-party")).default;
      case "timeline-journey":
        return (await import("./templates/timeline-journey")).default;
      default:
        return FallbackTemplate;
    }
  } catch {
    return FallbackTemplate;
  }
}
