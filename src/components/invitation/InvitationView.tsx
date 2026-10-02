import { Suspense } from "react";
import type { Invitation } from "@/lib/invitation";
import {
  isTemplateId,
  loadTemplate,
  type TemplateId,
} from "./template-registry";
import { MusicDock } from "./shared";

const LEGACY_TEMPLATE_ALIASES: Record<string, TemplateId> = {
  "elegant-classic": "lume",
};

async function TemplateLoader({
  invitation,
  embed,
  frameSrc,
}: {
  invitation: Invitation;
  embed?: boolean;
  frameSrc?: string;
}) {
  const resolved =
    LEGACY_TEMPLATE_ALIASES[invitation.template_id] ?? invitation.template_id;
  const templateId = isTemplateId(resolved) ? resolved : "lume";
  const Template = await loadTemplate(templateId);
  return <Template invitation={invitation} embed={embed} frameSrc={frameSrc} />;
}

export async function InvitationView({
  invitation,
  embed,
  frameSrc,
}: {
  invitation: Invitation;
  embed?: boolean;
  frameSrc?: string;
}) {
  const showMusic =
    Boolean(invitation.music_url) && invitation.custom_settings.music.visible;

  return (
    <div
      style={
        showMusic
          ? { paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }
          : undefined
      }
    >
      <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
        <TemplateLoader
          invitation={invitation}
          embed={embed}
          frameSrc={frameSrc}
        />
      </Suspense>
      {showMusic && invitation.music_url ? (
        <MusicDock url={invitation.music_url} />
      ) : null}
    </div>
  );
}
