import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationView } from "@/components/invitation/InvitationView";
import { getInvitationBySlug } from "@/lib/invitations-query";

export default async function InvitationPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { slug } = await params;
  const sp = await searchParams;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  const gated = sp.gate !== "0";
  const frameParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "embed" || key === "gate" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => frameParams.append(key, entry));
    else frameParams.append(key, value);
  }
  const frameQuery = frameParams.toString();

  return (
    <main id="main">
      <InvitationView
        invitation={invitation}
        embed={sp.embed === "1"}
        frameSrc={`/preview/invitation/${slug}?embed=1${gated ? "" : "&gate=0"}${frameQuery ? `&${frameQuery}` : ""}`}
        gated={gated}
      />
    </main>
  );
}
