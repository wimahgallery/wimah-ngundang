"use client";

import { ArrowUpRight, Camera, MessageCircle, Sparkles, Users } from "lucide-react";
import { waMessages, whatsappLink } from "@/lib/site-config";
import { Reveal, TextReveal } from "@/components/motion/reveal";

const PHOTOBLOTH_URL = "https://wimahphotobooth.id/";

const services = [
  {
    icon: Camera,
    title: "Photobooth",
    description:
      "Cetak instan di lokasi, lengkap dengan galeri digital, GIF, dan boomerang. Desain template bisa request mengikuti tema acara.",
    chips: ["Cetak instan", "Galeri digital", "GIF & boomerang", "Operator & backup"],
  },
  {
    icon: Users,
    title: "Mingle Booth",
    description:
      "Sesi candid yang lebih santai — tamu bebas bergaya tanpa antre cetak, semua file dikirim dalam format digital.",
    chips: ["Candid bebas", "File only", "Setup ringkas"],
  },
] as const;

/**
 * Section khusus untuk memperkenalkan layanan saudara, Wimah Photobooth
 * (photobooth & mingle booth). Tampil sebagai band full-bleed gelap (tanpa
 * whitespace kiri-kanan) di antara FAQ dan CTA penutup, dengan padding
 * atas-bawah ramping supaya terasa istimewa tanpa memakan tinggi halaman.
 */
export function HomePhotobooth() {
  return (
    <section id="photobooth" className="scroll-mt-8">
      {/* Band full-bleed: menyentuh kedua tepi layar tanpa whitespace, padding
         atas-bawah sengaja ramping supaya tidak memakan tinggi halaman. */}
      <div className="relative w-full min-w-0 overflow-hidden border-y border-white/10 bg-[#141512] text-[#F5F3EE]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -right-14 bottom-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="texture-noise absolute inset-0" />
        </div>

        <div className="relative mx-auto max-w-6xl px-[clamp(1.25rem,5vw,3rem)] py-9 sm:py-11 lg:py-12">
          <Reveal distance={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
              <Sparkles className="h-3 w-3" />
              Khusus dari Wimah
            </span>
          </Reveal>

          <h2 className="mt-5 max-w-3xl font-heading text-[clamp(1.75rem,1.1rem+2.6vw,3.125rem)] leading-[1.08] text-balance">
            <TextReveal
              text="Lengkapi hari bahagianya dengan Photobooth & Mingle Booth"
              stagger={55}
            />
          </h2>

          <Reveal delay={160} distance={20}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#F5F3EE]/70 sm:text-base">
              Satu keluarga besar Wimah. Kalau undangannya sudah digital, momen
              di lokasinya kami bantu abadikan lewat{" "}
              <a
                href={PHOTOBLOTH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-[#F5F3EE]"
              >
                wimahphotobooth.id
              </a>{" "}
              — cocok untuk wedding, birthday, corporate, hingga gathering.
            </p>
          </Reveal>

          <div className="mt-7 grid gap-4 sm:gap-5 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Reveal key={service.title} delay={120 + index * 110} distance={22} className="min-w-0">
                  <article className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-500 hover:border-gold/30 hover:bg-white/[0.06] sm:p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold transition-transform duration-500 group-hover:scale-[1.04] sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg leading-snug sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#F5F3EE]/70">
                      {service.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {service.chips.map((chip) => (
                        <li
                          key={chip}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] leading-relaxed text-[#F5F3EE]/75"
                        >
                          {chip}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={340} distance={18}>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href={PHOTOBLOTH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-[#141512] shadow-[0_16px_40px_rgba(212,175,98,0.2)] transition-transform duration-300 hover:scale-[1.02]"
              >
                Kunjungi wimahphotobooth.id
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={whatsappLink(waMessages.photobooth)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm text-[#F5F3EE] transition-colors duration-300 hover:border-white/50"
              >
                <MessageCircle className="h-4 w-4" />
                Cek ketersediaan tanggal
              </a>
            </div>
          </Reveal>

          <Reveal delay={420} distance={14}>
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#F5F3EE]/70">
              Wedding · Birthday · Corporate · Gathering · Engagement
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
