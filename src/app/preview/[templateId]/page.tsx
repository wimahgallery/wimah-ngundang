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
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  if (!isTemplateId(templateId)) notFound();
  const Template = await loadTemplate(templateId);
  return <Template invitation={{ ...dummyInvitation, template_id: templateId }} />;
}
