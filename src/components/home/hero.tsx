"use client";

import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { ArrowRight, MessageCircle, Play } from "lucide-react";
import { heroTrustItems, waMessages, whatsappLink } from "@/lib/site-config";
import { scrollToHash } from "@/lib/scroll";
import { Reveal, TextReveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { durationEase } from "@/components/motion/springs";
import { HeroMockup } from "./hero-mockup";

export function HomeHero() {
  const reducedMotion = usePrefersReducedMotion();

  const badge = useSpring({
    from: { opacity: 0, scale: 0.94 },
    to: { opacity: 1, scale: 1 },
    immediate: reducedMotion,
    config: durationEase(700),
  });

  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pt-32 md:pt-36 lg:pb-24 lg:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-background to-background" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="texture-noise absolute inset-0" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 md:gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <animated.span
            style={badge}
            className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-background/70 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-accent backdrop-blur"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
            Undangan Digital Premium
          </animated.span>

          <h1 className="mt-6 max-w-2xl font-heading text-[30px] leading-[1.08] text-text-primary sm:text-[38px] md:text-[44px] lg:text-[54px]">
            <TextReveal
              text="Undangan digital yang membuat setiap tamu merasa istimewa"
              stagger={55}
            />
          </h1>

          <Reveal delay={260} distance={20} className="w-full">
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Wimah Ngundang merangkai undangan pernikahan digital dengan animasi halus, galeri foto,
              musik, peta lokasi, dan angpao digital — siap dibagikan lewat satu link dalam hitungan
              menit.
            </p>
          </Reveal>

          <Reveal delay={360} distance={20} className="w-full">
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#template"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHash("#template");
                }}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-background shadow-[0_14px_34px_rgba(124,132,114,0.28)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <Play className="h-4 w-4" />
                Lihat 10 Template
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href={whatsappLink(waMessages.hero)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3.5 text-sm text-text-primary backdrop-blur transition-colors duration-300 hover:border-accent/40 hover:text-accent"
              >
                <MessageCircle className="h-4 w-4" />
                Konsultasi Gratis
              </a>
            </div>
          </Reveal>

          <Reveal delay={460} distance={16} className="w-full">
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {heroTrustItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
                >
                  <span className="block h-1 w-1 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <Parallax strength={26} className="w-full">
            <div className="flex justify-center lg:justify-end">
              <HeroMockup />
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
