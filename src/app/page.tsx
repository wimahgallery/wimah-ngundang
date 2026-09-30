import type { Metadata } from "next";
import { showcaseFaqs } from "@/lib/homepage-content";
import { siteConfig } from "@/lib/site-config";
import { OpeningAnimation } from "@/components/home/opening-animation";
import { OurBestCreation } from "@/components/home/our-best-creation";
import { TemplateShowcase } from "@/components/home/template-showcase";
import { HomeFeatures } from "@/components/home/home-features";
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
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.steps?.length
          ? `${faq.answer} ${faq.steps.map((step, i) => `${i + 1}. ${step}`).join(" ")}`
          : faq.answer,
      },
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
      <OpeningAnimation />
      <main id="main">
        <h1 className="sr-only">
          {siteConfig.name} — undangan digital premium untuk pernikahan &amp; acara spesial
        </h1>
        <OurBestCreation />
        <TemplateShowcase />
        <HomeFeatures />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

