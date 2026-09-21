import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationView } from "@/components/invitation/InvitationView";
import { getInvitationBySlug } from "@/lib/invitations-query";

export default async function InvitationPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  return <InvitationView invitation={invitation} />;
}
