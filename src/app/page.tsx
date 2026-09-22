import type { Metadata } from "next";
import { showcaseFaqs } from "@/lib/homepage-content";
import { siteConfig } from "@/lib/site-config";
import { HomeHeader } from "@/components/home/home-header";
import { GlyphPortalSection } from "@/components/home/glyph-portal-section";
import { TemplateShowcase } from "@/components/home/template-showcase";
import { HomeFeatures } from "@/components/home/home-features";
import { HomePricing } from "@/components/home/home-pricing";
import { HomeGallery } from "@/components/home/home-gallery";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeInvitationPreview } from "@/components/home/home-invitation-preview";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeFinalCta } from "@/components/home/home-final-cta";
import { SiteFooter } from "@/components/home/site-footer";
import { PageBackground } from "@/components/home/page-background";

const title = "Undangan Digital Premium untuk Pernikahan & Acara Spesial";
const ogImageUrl = `${siteConfig.siteUrl}/wimah.png`;

export const metadata: Metadata = {
  title,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.siteUrl },
  keywords: [
    "undangan digital",
    "undangan pernikahan online",
    "undangan digital premium",
    "undangan online custom domain",
    "wimah ngundang",
  ],
  openGraph: {
    type: "website",
    url: siteConfig.siteUrl,
    title,
    description: siteConfig.description,
    locale: "id_ID",
    siteName: siteConfig.name,
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
    images: [ogImageUrl],
  },
};

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: showcaseFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: siteConfig.name,
    serviceType: "Undangan digital",
    description: siteConfig.description,
    areaServed: "ID",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqJsonLd, serviceJsonLd]) }}
      />
      <PageBackground />
      <HomeHeader />
      <main>
        <GlyphPortalSection />
        <TemplateShowcase />
        <HomeFeatures />
        <HomePricing />
        <HomeGallery />
        <HomeHowItWorks />
        <HomeInvitationPreview />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

