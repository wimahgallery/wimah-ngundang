import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dummyInvitation } from "@/lib/dummy-invitation";
import { isTemplateId, loadTemplate, templateMeta } from "@/components/invitation/template-registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const meta = templateMeta.find((t) => t.id === templateId);
  return {
    title: meta ? `Preview ${meta.name}` : "Template preview",
    robots: { index: false, follow: false },
  };
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { templateId } = await params;
  if (!isTemplateId(templateId)) notFound();
  const sp = await searchParams;
  const embed = sp.embed === "1";
  const Template = await loadTemplate(templateId);

  const frameParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "embed" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => frameParams.append(key, entry));
    else frameParams.append(key, value);
  }
  const frameQuery = frameParams.toString();

  return (
    <main id="main">
      <Template
        invitation={{ ...dummyInvitation, template_id: templateId }}
        embed={embed}
        frameSrc={`/preview/${templateId}?embed=1${frameQuery ? `&${frameQuery}` : ""}`}
      />
    </main>
  );
}
