import { Suspense } from "react";
import type { Invitation } from "@/lib/invitation";
import { isTemplateId, loadTemplate } from "./template-registry";
import { MusicDock } from "./shared";

async function TemplateLoader({ invitation }: { invitation: Invitation }) {
  const templateId = isTemplateId(invitation.template_id)
    ? invitation.template_id
    : "elegant-classic";
  const Template = await loadTemplate(templateId);
  return <Template invitation={invitation} />;
}

export async function InvitationView({ invitation }: { invitation: Invitation }) {
  const showMusic = Boolean(invitation.music_url) && invitation.custom_settings.music.visible;

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <TemplateLoader invitation={invitation} />
      </Suspense>
      {showMusic && invitation.music_url ? <MusicDock url={invitation.music_url} /> : null}
    </>
  );
}
