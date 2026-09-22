"use client";

import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";
import { Check } from "lucide-react";

interface TemplatePlan {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  palette: { bg: string; accent: string; text: string };
  popular?: boolean;
  available?: boolean;
  slug?: string;
}

const plans: TemplatePlan[] = [
  {
    name: "Elegant Classic",
    tagline: "Tipografi klasik, tenang & simetris",
    price: "Gratis",
    priceNote: "Sekarang",
    features: ["14 section", "Gallery & musik", "RSVP & countdown", "Angpao digital", "Custom domain"],
    palette: { bg: "#F5F3EE", accent: "#7C8472", text: "#54524D" },
    popular: true,
    available: true,
    slug: "elegant-classic",
  },
  {
    name: "Film Strip",
    tagline: "Gaya sinematik horizontal scroll",
    price: "Rp 99rb",
    priceNote: "Sekali bayar",
    features: ["12 section", "Horizontal scroll", "Cinematic motion", "Gallery film", "Custom domain"],
    palette: { bg: "#1A1A1A", accent: "#C9A96E", text: "#F5F0E8" },
    available: false,
  },
  {
    name: "Modern Minimal",
    tagline: "Bersih, luas, fokus pada foto",
    price: "Rp 99rb",
    priceNote: "Sekali bayar",
    features: ["10 section", "Full-bleed photos", "Minimal motion", "Clean typography", "Custom domain"],
    palette: { bg: "#FFFFFF", accent: "#2D2D2D", text: "#1A1A1A" },
    available: false,
  },
  {
    name: "Dark Premium",
    tagline: "Gelap mewah dengan aksen emas",
    price: "Rp 129rb",
    priceNote: "Sekali bayar",
    features: ["14 section", "Gold accents", "Parallax deep", "Animated reveal", "Custom domain"],
    palette: { bg: "#0F0F0F", accent: "#D4A853", text: "#F5F3EE" },
    available: false,
  },
  {
    name: "Garden Party",
    tagline: "Cerah, lembut, penuh warna",
    price: "Rp 99rb",
    priceNote: "Sekali bayar",
    features: ["12 section", "Floral motifs", "Soft palette", "Playful motion", "Custom domain"],
    palette: { bg: "#FDF8F0", accent: "#A8C5A0", text: "#4A5D4A" },
    available: false,
  },
  {
    name: "Timeline Journey",
    tagline: "Cerita perjalanan cinta interaktif",
    price: "Rp 129rb",
    priceNote: "Sekali bayar",
    features: ["16 section", "Timeline scroll", "Story chapters", "Photo journey", "Custom domain"],
    palette: { bg: "#F0EDE6", accent: "#8B6F5E", text: "#3D3228" },
    available: false,
  },
];

export function HomePricing() {
  return (
    <section
      id="pilihan"
      className="scroll-mt-24 bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          tone="light"
          kicker="Pilihan Template"
          title="Satu harga, akses semua gaya"
          description="Mulai dari gratis dengan Elegant Classic. Template lainnya segera hadir — beli sekali, pakai selamanya."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 80} distance={20}>
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
                    Tersedia
                  </div>
                )}
                {!plan.available && (
                  <div className="absolute right-3 top-3 rounded-full bg-black/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-black/40">
                    Segera Hadir
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
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className="font-heading text-3xl sm:text-4xl"
                      style={{ color: plan.palette.accent }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: `${plan.palette.text}66` }}
                    >
                      {plan.priceNote}
                    </span>
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
                  <button
                    className={`mt-6 w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                      plan.available
                        ? "hover:opacity-90"
                        : "cursor-not-allowed opacity-40"
                    }`}
                    style={
                      plan.available
                        ? {
                            background: plan.palette.accent,
                            color: plan.palette.bg,
                          }
                        : {
                            background: `${plan.palette.text}10`,
                            color: `${plan.palette.text}50`,
                          }
                    }
                    disabled={!plan.available}
                  >
                    {plan.available ? "Pilih Sekarang" : "Coming Soon"}
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
