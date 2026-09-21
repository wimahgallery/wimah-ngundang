"use client";

import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { waMessages, whatsappDisplay, whatsappLink } from "@/lib/site-config";
import { scrollToHash } from "@/lib/scroll";
import { Reveal, TextReveal } from "@/components/motion/reveal";

export function HomeFinalCta() {
  return (
    <section className="px-5 pb-20 pt-4 sm:px-8 lg:pb-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-[#141512] px-6 py-16 text-center text-[#F5F3EE] sm:px-12 lg:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="texture-noise absolute inset-0" />
        </div>

        <div className="relative">
          <Reveal distance={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-gold">
              <Sparkles className="h-3 w-3" />
              Siap Mulai
            </span>
          </Reveal>

          <h2 className="mx-auto mt-6 max-w-2xl font-heading text-[28px] leading-[1.1] sm:text-[36px] md:text-[42px] lg:text-[48px]">
            <TextReveal text="Ceritakan tanggalnya, kami siapkan undangannya" stagger={55} />
          </h2>

          <Reveal delay={200} distance={18}>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#F5F3EE]/65 sm:text-base">
              Ceritakan kebutuhan acaramu lewat WhatsApp. Kami bantu pilih template, susun alur
              undangan, dan pastikan link siap dibagikan tepat waktu.
            </p>
          </Reveal>

          <Reveal delay={320} distance={18}>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <a
                href={whatsappLink(waMessages.order)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-[#0B1F12] shadow-[0_16px_40px_rgba(37,211,102,0.22)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                Chat WhatsApp Sekarang
              </a>
              <a
                href="#template"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHash("#template");
                }}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm text-[#F5F3EE] transition-colors duration-300 hover:border-white/50"
              >
                Lihat template dulu
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={420} distance={14}>
            <p className="mt-7 text-[11px] uppercase tracking-[0.18em] text-[#F5F3EE]/45">
              WhatsApp {whatsappDisplay} · Balasan cepat setiap hari
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
