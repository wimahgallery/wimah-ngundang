import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { getInvitationBySlug } from "@/lib/invitations-query";
import { coupleLabel } from "@/lib/invitation";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug, { publishedOnly: true });
  if (!invitation) return { title: "Undangan tidak ditemukan" };

  const title = `Undangan ${coupleLabel(invitation)}`;
  const description = `Undangan Digital ${invitation.event_title || coupleLabel(invitation)}`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${invitation.slug}`;
  const image = invitation.cover_image || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/wimah.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "id_ID",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicInvitationPage({ params }: Props) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug, { publishedOnly: true });
  if (!invitation) notFound();
  return <InvitationView invitation={invitation} />;
}
