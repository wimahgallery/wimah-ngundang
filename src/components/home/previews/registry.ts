import type { ComponentType } from "react";
import type { TemplateId } from "@/components/invitation/template-registry";
import type { PreviewMotionProps } from "./shared";
import ElegantClassicPreview from "./elegant-classic";

export type PreviewMockup = ComponentType<PreviewMotionProps>;

export const previewMockups: Record<TemplateId, PreviewMockup> = {
  "elegant-classic": ElegantClassicPreview,
};
