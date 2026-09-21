import type { ComponentType } from "react";
import type { Invitation } from "@/lib/invitation";
import { FallbackTemplate } from "./fallback-template";

export const TEMPLATE_IDS = [
  "elegant-classic",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const templateMeta: { id: TemplateId; name: string; description: string }[] = [
  { id: "elegant-classic", name: "Elegant Classic", description: "Hero fullscreen, simetris, premium" },
];

export function isTemplateId(id: string): id is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(id);
}

export async function loadTemplate(id: TemplateId): Promise<ComponentType<{ invitation: Invitation }>> {
  try {
    switch (id) {
      case "elegant-classic":
        return (await import("./templates/elegant-classic")).default;
      default:
        return FallbackTemplate;
    }
  } catch {
    return FallbackTemplate;
  }
}
