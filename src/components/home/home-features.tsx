"use client";

import { showcaseFeatures } from "@/lib/homepage-content";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";

export function HomeFeatures() {
  return (
    <section
      id="fitur"
      className="scroll-mt-24 bg-[#141512] px-5 py-20 text-[#F5F3EE] sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          tone="dark"
          kicker="Fitur Unggulan"
          title="Semua yang tamu butuhkan dalam satu link"
          description="Bukan sekadar halaman cantik. Undangan Wimah Ngundang dibangun untuk dibagikan, dibuka cepat, dan dipakai tamu dengan nyaman."
        />

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-4">
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
                <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-white/[0.06] sm:p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold transition-transform duration-500 group-hover:scale-[1.04]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg leading-snug">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#F5F3EE]/60">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={160} className="mt-10">
          <p className="text-center text-xs text-[#F5F3EE]/50">
            Butuh fitur khusus seperti RSVP atau buku tamu digital? Sampaikan saat konsultasi — kami
            bantu carikan solusinya.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
