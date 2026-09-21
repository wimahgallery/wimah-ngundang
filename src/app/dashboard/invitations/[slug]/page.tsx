import InvitationEditor from "@/components/features/invitations/InvitationEditor";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <InvitationEditor slug={slug} />;
}
