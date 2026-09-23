import { Suspense } from "react";
import type { Invitation } from "@/lib/invitation";
import { isTemplateId, loadTemplate, type TemplateId } from "./template-registry";
import { MusicDock } from "./shared";

const LEGACY_TEMPLATE_ALIASES: Record<string, TemplateId> = {
  "film-strip": "neo-brutalism",
};

async function TemplateLoader({ invitation }: { invitation: Invitation }) {
  const resolved = LEGACY_TEMPLATE_ALIASES[invitation.template_id] ?? invitation.template_id;
  const templateId = isTemplateId(resolved) ? resolved : "elegant-classic";
  const Template = await loadTemplate(templateId);
  return <Template invitation={invitation} />;
}

export async function InvitationView({ invitation }: { invitation: Invitation }) {
  const showMusic = Boolean(invitation.music_url) && invitation.custom_settings.music.visible;

  return (
    <div style={showMusic ? { paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" } : undefined}>
      <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
        <TemplateLoader invitation={invitation} />
      </Suspense>
      {showMusic && invitation.music_url ? <MusicDock url={invitation.music_url} /> : null}
    </div>
  );
}
