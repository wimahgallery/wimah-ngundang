import type { ComponentType } from "react";
import type { TemplateId } from "@/components/invitation/template-registry";
import type { PreviewMotionProps } from "./shared";
import ElegantClassicPreview from "./elegant-classic";
import NeoBrutalismPreview from "./neo-brutalism";
import ModernMinimalPreview from "./modern-minimal";
import DarkPremiumPreview from "./dark-premium";
import GardenPartyPreview from "./garden-party";
import TimelineJourneyPreview from "./timeline-journey";

export type PreviewMockup = ComponentType<PreviewMotionProps>;

export const previewMockups: Record<TemplateId, PreviewMockup> = {
  "elegant-classic": ElegantClassicPreview,
  "neo-brutalism": NeoBrutalismPreview,
  "modern-minimal": ModernMinimalPreview,
  "dark-premium": DarkPremiumPreview,
  "garden-party": GardenPartyPreview,
  "timeline-journey": TimelineJourneyPreview,
};
