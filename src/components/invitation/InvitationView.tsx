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
  gated,
}: {
  invitation: Invitation;
  embed?: boolean;
  frameSrc?: string;
  gated?: boolean;
}) {
  const resolved =
    LEGACY_TEMPLATE_ALIASES[invitation.template_id] ?? invitation.template_id;
  const templateId = isTemplateId(resolved) ? resolved : "lume";
  const Template = await loadTemplate(templateId);
  return (
    <Template
      invitation={invitation}
      embed={embed}
      frameSrc={frameSrc}
      gated={gated}
    />
  );
}

export async function InvitationView({
  invitation,
  embed,
  frameSrc,
  gated = true,
}: {
  invitation: Invitation;
  embed?: boolean;
  frameSrc?: string;
  gated?: boolean;
}) {
  const showMusic =
    Boolean(invitation.music_url) && invitation.custom_settings.music.visible;

  return (
    <div
      className={showMusic ? "invitation-shell invitation-shell--music" : "invitation-shell"}
    >
      {gated ? (
        <script
          dangerouslySetInnerHTML={{
            // Selalu kunci sebelum hydration — tanpa syarat hash, supaya setiap
            // kunjungan (termasuk tautan lama dengan #greeting) tetap menampilkan
            // sampul dan tamu wajib menekan "Buka Undangan".
            __html: 'document.documentElement.setAttribute("data-invitation-locked","")',
          }}
        />
      ) : null}
      <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
        <TemplateLoader
          invitation={invitation}
          embed={embed}
          frameSrc={frameSrc}
          gated={gated}
        />
      </Suspense>
      {showMusic && invitation.music_url ? (
        <MusicDock url={invitation.music_url} />
      ) : null}
    </div>
  );
}
