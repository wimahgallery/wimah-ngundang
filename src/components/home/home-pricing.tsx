"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";
import { Check, ExternalLink } from "lucide-react";

interface TemplatePlan {
  name: string;
  tagline: string;
  priceWas: string;
  price: string;
  priceNote: string;
  discount: string;
  features: string[];
  palette: { bg: string; accent: string; text: string };
  popular?: boolean;
  slug: string;
}

const plans: TemplatePlan[] = [
  {
    name: "Elegant Classic",
    tagline: "Tipografi klasik, tenang & simetris",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["14 section", "Gallery & musik", "RSVP & countdown", "Angpao digital"],
    palette: { bg: "#F5F3EE", accent: "#7C8472", text: "#54524D" },
    popular: true,
    slug: "elegant-classic",
  },
  {
    name: "Neo Brutalism",
    tagline: "Editorial berani, border tebal & bayangan keras",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["14 section", "Hard-shadow cards", "Marquee ticker", "Editorial gallery"],
    palette: { bg: "#F4EFE6", accent: "#FF4D2E", text: "#101010" },
    slug: "neo-brutalism",
  },
  {
    name: "Modern Minimal",
    tagline: "Bersih, luas, fokus pada foto",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["10 section", "Full-bleed photos", "Minimal motion", "Clean typography"],
    palette: { bg: "#FFFFFF", accent: "#2D2D2D", text: "#1A1A1A" },
    slug: "modern-minimal",
  },
  {
    name: "Dark Premium",
    tagline: "Gelap mewah dengan aksen emas",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["14 section", "Gold accents", "Parallax deep", "Animated reveal"],
    palette: { bg: "#0F0F0F", accent: "#D4A853", text: "#F5F3EE" },
    slug: "dark-premium",
  },
  {
    name: "Garden Party",
    tagline: "Cerah, lembut, penuh warna",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["12 section", "Floral motifs", "Soft palette", "Playful motion"],
    palette: { bg: "#FDF8F0", accent: "#A8C5A0", text: "#4A5D4A" },
    slug: "garden-party",
  },
  {
    name: "Timeline Journey",
    tagline: "Cerita perjalanan cinta interaktif",
    priceWas: "Rp. 548.000",
    price: "Rp. 274.000",
    priceNote: "Sekali bayar",
    discount: "Disc 50%",
    features: ["16 section", "Timeline scroll", "Story chapters", "Photo journey"],
    palette: { bg: "#F0EDE6", accent: "#8B6F5E", text: "#3D3228" },
    slug: "timeline-journey",
  },
];

export function HomePricing() {
  return (
    <section
      id="pilihan"
      className="scroll-mt-8 bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          tone="light"
          kicker="Pilihan Template"
          title="Satu harga, akses semua gaya"
          description="Semua template tersedia sekarang — beli sekali, pakai selamanya. Preview dulu sebelum memilih."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 80} distance={20} className="min-w-0">
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-accent/30 shadow-md"
                    : "border-border"
                }`}
                style={{ background: plan.palette.bg }}
              >
                {plan.popular && (
                  <div className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Populer
                  </div>
                )}

                {/* Color preview bar */}
                <div className="h-1.5 w-full" style={{ background: plan.palette.accent }} />

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {/* Template name */}
                  <h3
                    className="font-heading text-xl sm:text-2xl"
                    style={{ color: plan.palette.text }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="mt-1 text-xs sm:text-sm"
                    style={{ color: `${plan.palette.text}99` }}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-sm line-through decoration-1"
                        style={{ color: `${plan.palette.text}80` }}
                      >
                        {plan.priceWas}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: plan.palette.text,
                          color: plan.palette.bg,
                        }}
                      >
                        {plan.discount}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span
                        className="font-heading text-[clamp(1.75rem,1.4rem+1.5vw,2.25rem)] font-medium"
                        style={{ color: plan.palette.text }}
                      >
                        {plan.price}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: `${plan.palette.text}80` }}
                      >
                        {plan.priceNote}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="my-5 h-px w-full"
                    style={{ background: `${plan.palette.text}15` }}
                  />

                  {/* Features */}
                  <ul className="flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-xs sm:text-sm"
                        style={{ color: `${plan.palette.text}cc` }}
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0"
                          style={{ color: plan.palette.accent }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href="/dashboard/invitations/new"
                      className="min-h-11 w-full rounded-xl py-3 text-center text-sm font-medium transition-all duration-200 hover:opacity-90"
                      style={{
                        background: plan.palette.accent,
                        color: plan.palette.bg,
                      }}
                    >
                      Pilih Sekarang
                    </Link>
                    <a
                      href={`/preview/${plan.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors duration-200 hover:opacity-80"
                      style={{
                        borderColor: `${plan.palette.text}33`,
                        color: plan.palette.text,
                      }}
                    >
                      Lihat Preview
                      <ExternalLink size={14} className="shrink-0" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
