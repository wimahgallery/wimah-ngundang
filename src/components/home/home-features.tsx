"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { showcaseFeatures } from "@/lib/homepage-content";
import { waMessages, whatsappLink } from "@/lib/site-config";
import { scrollToHash } from "@/lib/scroll";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";

export function HomeFeatures() {
  return (
    <section
      id="fitur"
      className="scroll-mt-8 bg-[#141512] px-5 py-20 text-[#F5F3EE] sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          tone="dark"
          kicker="Fitur Unggulan"
          title="Semua yang tamu butuhkan dalam satu link"
          description="Bukan sekadar halaman cantik. Undangan Wimah Ngundang dibangun untuk dibagikan, dibuka cepat, dan dipakai tamu dengan nyaman."
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {showcaseFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.title}
                as="li"
                delay={(index % 4) * 90}
                distance={22}
                className="h-full"
              >
                <article className="group flex h-full min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors duration-500 hover:border-gold/30 hover:bg-white/[0.06] sm:p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold transition-transform duration-500 group-hover:scale-[1.04] sm:h-11 sm:w-11">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading text-[15px] leading-snug text-balance sm:mt-5 sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#F5F3EE]/70 sm:mt-2 sm:text-sm">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={160}>
          <div className="mt-10 flex flex-col items-center gap-5">
            <p className="max-w-xl text-center text-sm leading-relaxed text-[#F5F3EE]/70">
              Butuh fitur khusus seperti RSVP atau buku tamu digital? Sampaikan
              saat konsultasi — kami bantu carikan solusinya.
            </p>

            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
              <a
                href={whatsappLink(waMessages.features)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-[#0B1F12] shadow-[0_16px_40px_rgba(37,211,102,0.22)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                Konsultasi Fitur via WhatsApp
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
