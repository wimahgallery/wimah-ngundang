import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { getInvitationBySlug } from "@/lib/invitations-query";
import { coupleLabel } from "@/lib/invitation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const invitation = await getInvitationBySlug(slug, { publishedOnly: true });
  if (!invitation) notFound();

  // Teruskan query asli (mis. ?to=Nama+Tamu) ke dalam frame HP supaya nama tamu
  // ikut tampil di desktop — `useGuestName` membaca `location.search` di iframe.
  const frameParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "embed" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => frameParams.append(key, entry));
    else frameParams.append(key, value);
  }
  const frameQuery = frameParams.toString();

  return (
    <main id="main">
      <InvitationView
        invitation={invitation}
        embed={sp.embed === "1"}
        frameSrc={`/${slug}?embed=1${frameQuery ? `&${frameQuery}` : ""}`}
      />
    </main>
  );
}
