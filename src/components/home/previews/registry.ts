import type { ComponentType } from "react";
import type { TemplateId } from "@/components/invitation/template-registry";
import type { PreviewMotionProps } from "./shared";
import LumePreview from "./lume";

export type PreviewMockup = ComponentType<PreviewMotionProps>;

export const previewMockups: Partial<Record<TemplateId, PreviewMockup>> = {
  "lume": LumePreview,
};
