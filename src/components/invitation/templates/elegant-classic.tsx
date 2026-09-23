"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  type Invitation,
} from "@/lib/invitation";
import {
  CoupleNames,
  DecorativeDivider,
  GiftList,
  GuestWishesList,
  InvitationPhoto,
  MapsButton,
  SectionCopy,
  SectionHeading,
  SectionKicker,
  StoryParagraphs,
  CountdownTimer,
  VideoPlayer,
} from "../shared";

/* ─── tiny icons (inline, no extra deps) ─── */
function Icon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, string> = {
    coffee: "☕",
    heart: "❤️",
    ring: "💍",
    calendar: "📅",
    camera: "📸",
    gift: "🎁",
    instagram: "📸",
    twitter: "🐦",
    chevron: "↓",
    check: "✓",
    map: "📍",
    music: "🎵",
    share: "📤",
    star: "⭐",
  };
  return <span className={className}>{map[name] ?? "✦"}</span>;
}

/* ─── 1. Opening Cover ─── */
function HeroCover({ invitation }: { invitation: Invitation }) {
  const hero = invitation.custom_settings.hero;

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden">
      <InvitationPhoto
        src={invitation.cover_image}
        alt={invitation.event_title || "Cover"}
        className="absolute inset-0 h-full w-full"
        positionX={hero.imagePositionX}
        positionY={hero.imagePositionY}
        zoom={hero.zoom}
        rotate={hero.rotate}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-background" />

      {/* floating ornaments */}
      <div aria-hidden="true" className="pointer-events-none absolute left-4 top-8 text-accent/20 sm:left-8 sm:top-12">
        <svg className="h-16 w-16 sm:h-24 sm:w-24" viewBox="0 0 100 100" fill="currentColor" opacity="0.3">
          <path d="M50 0 C60 20 80 30 100 50 C80 70 60 80 50 100 C40 80 20 70 0 50 C20 30 40 20 50 0Z" />
        </svg>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-4 bottom-32 text-accent/15 sm:right-8 sm:bottom-40">
        <svg className="h-20 w-20 sm:h-28 sm:w-28" viewBox="0 0 100 100" fill="currentColor" opacity="0.25">
          <path d="M50 0 C60 20 80 30 100 50 C80 70 60 80 50 100 C40 80 20 70 0 50 C20 30 40 20 50 0Z" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-[clamp(1.5rem,5vw,2rem)] text-center">
        <p className="text-[10px] uppercase tracking-[clamp(0.1em,0.06rem+0.4vw,0.28em)] text-background/75 sm:text-xs">
          {invitation.hero_title || "The Wedding of"}
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.25rem,1.5rem+4vw,4.5rem)] text-balance text-background">
          <CoupleNames invitation={invitation} className="drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]" />
        </h1>
        {invitation.event_date && (
          <p className="mt-4 text-sm tracking-wide text-background/80 sm:text-base">
            {formatDate(invitation.event_date)}
          </p>
        )}
        {invitation.hero_subtitle && (
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-background/75 sm:text-base">
            {invitation.hero_subtitle}
          </p>
        )}

        {/* open invitation button */}
        <button
          type="button"
          onClick={() => {
            document.getElementById("greeting")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-8 py-3.5 text-sm font-medium text-background backdrop-blur-sm transition-all duration-300 hover:border-background/50 hover:bg-background/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          Buka Undangan
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ─── 2. Personalized Greeting ─── */
function GreetingSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.greeting;
  if (!settings.visible) return null;
  return (
    <section id="greeting" className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-2xl text-center">
        <DecorativeDivider className="mb-8" />
        <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">
          {invitation.greeting_text || "Kepada Yth. Bapak/Ibu/Saudara/i"}
        </p>
        {invitation.recipient_name && (
          <p className="mt-4 font-heading text-2xl italic text-text-primary sm:text-3xl">
            {invitation.recipient_name}
          </p>
        )}
        {invitation.hero_subtitle && (
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            {invitation.hero_subtitle}
          </p>
        )}
        <DecorativeDivider className="mt-8" />
      </div>
    </section>
  );
}

/* ─── 3. Couple Introduction ─── */
function CoupleSection({ invitation }: { invitation: Invitation }) {
  const couple = invitation.custom_settings.couple;
  if (!couple.visible) return null;

  const socialIcon = (url?: string | null) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent transition-colors hover:text-accent-dark">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      </a>
    ) : null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-5xl">
        <SectionKicker>Mempelai</SectionKicker>
        <SectionHeading settings={couple} className="mt-3">
          Insan yang Berbahagia
        </SectionHeading>

        <div className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
          {/* bride */}
          <article className="flex flex-col items-center text-center">
            <InvitationPhoto
              src={invitation.bride_photo}
              alt={invitation.bride_name || "Mempelai wanita"}
              className="aspect-[3/4] w-full max-w-[260px] rounded-xl shadow-[0_20px_60px_rgba(84,82,77,0.12)]"
              positionX={couple.imagePositionX}
              positionY={couple.imagePositionY}
              sizes="(max-width: 768px) 100vw, 35vw"
            />
            <h3 className="mt-6 font-heading text-2xl text-text-primary sm:text-3xl">
              {invitation.bride_name}
            </h3>
            {invitation.bride_parents && (
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-text-secondary">
                {invitation.bride_parents}
              </p>
            )}
            {invitation.bride_social && (
              <div className="mt-3 flex gap-3">
                {socialIcon(invitation.bride_social.instagram)}
                {socialIcon(invitation.bride_social.twitter)}
              </div>
            )}
          </article>

          {/* ornament divider */}
          <div className="flex flex-col items-center gap-2 text-accent/40">
            <span className="h-12 w-px bg-accent/20" />
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6.4-4.8-6.4 4.8 2.4-7.4-6-4.6h7.6z" />
            </svg>
            <span className="h-12 w-px bg-accent/20" />
          </div>

          {/* groom */}
          <article className="flex flex-col items-center text-center">
            <InvitationPhoto
              src={invitation.groom_photo}
              alt={invitation.groom_name || "Mempelai pria"}
              className="aspect-[3/4] w-full max-w-[260px] rounded-xl shadow-[0_20px_60px_rgba(84,82,77,0.12)]"
              positionX={invitation.groom_image_position_x}
              positionY={invitation.groom_image_position_y}
              zoom={invitation.groom_image_zoom}
              rotate={invitation.groom_image_rotate}
              sizes="(max-width: 768px) 100vw, 35vw"
            />
            <h3 className="mt-6 font-heading text-2xl text-text-primary sm:text-3xl">
              {invitation.groom_name}
            </h3>
            {invitation.groom_parents && (
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-text-secondary">
                {invitation.groom_parents}
              </p>
            )}
            {invitation.groom_social && (
              <div className="mt-3 flex gap-3">
                {socialIcon(invitation.groom_social.instagram)}
                {socialIcon(invitation.groom_social.twitter)}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Love Story Timeline ─── */
function StoryTimeline({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.story;
  if (!settings.visible) return null;

  const milestones = invitation.story_milestones;
  const hasTimeline = milestones && milestones.length > 0;

  return (
    <section className="bg-surface/40 texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-5xl">
        <SectionKicker>Cerita</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          {invitation.story_title || "Our Story"}
        </SectionHeading>

        {hasTimeline ? (
          <div className="relative mt-14">
            {/* timeline line */}
            <div className="absolute left-4 top-0 h-full w-px bg-accent/20 md:left-1/2 md:-translate-x-px" />

            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex flex-col gap-6 md:flex-row md:items-center",
                    i % 2 === 1 && "md:flex-row-reverse",
                  )}
                >
                  {/* dot */}
                  <div className="absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent bg-background text-xs font-medium text-accent md:left-1/2">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* image */}
                  {m.image && (
                    <div className={cn("md:w-1/2", i % 2 === 0 ? "md:pr-12" : "md:pl-12")}>
                      <InvitationPhoto
                        src={m.image}
                        alt={m.title}
                        className="aspect-[4/3] w-full rounded-lg shadow-[0_12px_40px_rgba(84,82,77,0.08)]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  {/* text */}
                  <div className={cn("pl-12 md:w-1/2 md:pl-0", !m.image && "md:w-full md:pl-0 md:text-center", i % 2 === 1 && "md:pr-12 md:pl-0 md:text-right")}>
                    {m.date && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                        {formatDate(m.date)}
                      </p>
                    )}
                    <h3 className="mt-2 font-heading text-xl text-text-primary sm:text-2xl">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 max-w-2xl">
            <StoryParagraphs content={invitation.story_content} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── 5. Countdown ─── */
function CountdownSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.countdown;
  if (!settings.visible || !invitation.event_date) return null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Hitung Mundur</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Menuju Hari Bahagia
        </SectionHeading>
        <div className="mt-10">
          <CountdownTimer eventDate={invitation.event_date} />
        </div>
      </div>
    </section>
  );
}

/* ─── 6. Event Details ─── */
function ScheduleSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.schedule;
  if (!settings.visible) return null;

  return (
    <section className="bg-surface/40 texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-5xl text-center">
        <SectionKicker>Jadwal</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Save the Date
        </SectionHeading>

        <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-border bg-background/80 p-6 text-center shadow-[0_8px_30px_rgba(84,82,77,0.05)] backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Akad Nikah</p>
            {invitation.event_date && (
              <p className="mt-3 font-heading text-lg text-text-primary">{formatDate(invitation.event_date)}</p>
            )}
            {invitation.event_time && (
              <p className="mt-1 text-sm text-text-secondary">{invitation.event_time}</p>
            )}
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-background/80 p-6 text-center shadow-[0_8px_30px_rgba(84,82,77,0.05)] backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Resepsi</p>
            {invitation.event_date && (
              <p className="mt-3 font-heading text-lg text-text-primary">{formatDate(invitation.event_date)}</p>
            )}
            {invitation.event_time && (
              <p className="mt-1 text-sm text-text-secondary">{invitation.event_time}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 7. Location ─── */
function VenueSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.venue;
  if (!settings.visible) return null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-5xl text-center">
        <SectionKicker>Lokasi</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          {invitation.venue_name || "Tempat Acara"}
        </SectionHeading>
        {invitation.venue_address && (
          <SectionCopy settings={settings} className="mt-4">
            {invitation.venue_address}
          </SectionCopy>
        )}

        {invitation.google_maps_url && (
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-lg border border-border shadow-[0_8px_30px_rgba(84,82,77,0.06)]">
            <iframe
              title="Lokasi Acara"
              src={`https://www.google.com/maps/embed?pb=${encodeURIComponent(
                invitation.google_maps_url.replace("https://maps.google.com/?q=", "").replace(/\s+/g, "+"),
              )}`}
              className="h-[250px] w-full border-0 sm:h-[350px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        <div className="mt-6">
          <MapsButton invitation={invitation} />
        </div>
      </div>
    </section>
  );
}

/* ─── 8. Premium Gallery ─── */
function GallerySection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.gallery;
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (!settings.visible || !invitation.gallery_images.length) return null;

  return (
    <section className="bg-surface/40 texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionKicker>Galeri</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Momen Berharga
          </SectionHeading>
        </div>

        <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4">
          {invitation.gallery_images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightbox(i)}
              className="mb-3 block w-full overflow-hidden rounded-xl sm:mb-4"
            >
              <InvitationPhoto
                src={img.url}
                alt={img.alt || "Galeri"}
                className={cn(
                  "w-full rounded-xl transition-transform duration-500 hover:scale-[1.03]",
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-square",
                )}
                positionX={img.positionX}
                positionY={img.positionY}
                zoom={img.zoom}
                rotate={img.rotate}
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>

        {/* lightbox */}
        {lightbox !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Galeri foto"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center text-white/70 transition-colors hover:text-white"
              aria-label="Tutup"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => (prev === 0 ? invitation.gallery_images.length - 1 : prev! - 1));
              }}
              className="absolute left-2 grid h-12 w-12 place-items-center text-white/70 transition-colors hover:text-white sm:left-4"
              aria-label="Sebelumnya"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => (prev === invitation.gallery_images.length - 1 ? 0 : prev! + 1));
              }}
              className="absolute right-2 grid h-12 w-12 place-items-center text-white/70 transition-colors hover:text-white sm:right-4"
              aria-label="Berikutnya"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div
              className="relative max-h-[80vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={invitation.gallery_images[lightbox].url}
                alt={invitation.gallery_images[lightbox].alt || "Galeri"}
                width={800}
                height={1000}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
                sizes="90vw"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── 9. Video ─── */
function VideoSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.video;
  if (!settings.visible || !invitation.video_url) return null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Video</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Prewedding Video
        </SectionHeading>
        <div className="mt-8">
          <VideoPlayer url={invitation.video_url} poster={invitation.video_poster} />
        </div>
      </div>
    </section>
  );
}

/* ─── 10. Wedding Gift ─── */
function GiftSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.gift;
  if (!settings.visible) return null;

  return (
    <section className="bg-surface/40 texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Tanda Kasih</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Wedding Gift
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-lg text-sm text-text-secondary sm:text-base">
          Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih,
          dapat melalui tautan berikut:
        </p>

        {invitation.qris_image && (
          <div className="mx-auto mt-8 max-w-xs">
            <Image
              src={invitation.qris_image}
              alt="QRIS"
              width={300}
              height={300}
              className="w-full rounded-lg border border-border shadow-[0_8px_30px_rgba(84,82,77,0.06)]"
              loading="lazy"
            />
            <p className="mt-2 text-xs text-text-secondary">Scan QRIS untuk transfer</p>
          </div>
        )}

        <div className="mt-8">
          <GiftList invitation={invitation} />
        </div>
      </div>
    </section>
  );
}

/* ─── 11. RSVP ─── */
function RsvpSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.rsvp;
  const [form, setForm] = useState({ name: "", attending: "", guests: "1", message: "" });
  const [submitted, setSubmitted] = useState(false);

  if (!settings.visible || !invitation.rsvp_enabled) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="mt-6 font-heading text-2xl text-text-primary">Terima Kasih!</h3>
          <p className="mt-3 text-sm text-text-secondary">
            Konfirmasi kehadiran Anda telah kami terima. Sampai jumpa di hari bahagia!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-lg text-center">
        <SectionKicker>Konfirmasi</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          RSVP
        </SectionHeading>
        <p className="mt-4 text-sm text-text-secondary">
          Mohon konfirmasi kehadiran Anda agar kami dapat menyiapkan yang terbaik.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div>
            <label htmlFor="rsvp-name" className="mb-1 block text-xs font-medium text-text-primary">
              Nama Lengkap
            </label>
            <input
              id="rsvp-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Masukkan nama"
            />
          </div>

          <div>
            <p className="mb-2 block text-xs font-medium text-text-primary">Kehadiran</p>
            <div role="radiogroup" aria-label="Kehadiran" className="flex gap-3">
              {["Hadir", "Tidak Hadir", "Masih Ragu"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={form.attending === opt}
                  onClick={() => setForm((f) => ({ ...f, attending: opt }))}
                  className={cn(
                    "min-h-11 flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all",
                    form.attending === opt
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-text-secondary hover:border-accent/40",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {form.attending === "Hadir" && (
            <div>
              <label htmlFor="rsvp-guests" className="mb-1 block text-xs font-medium text-text-primary">
                Jumlah Tamu
              </label>
              <select
                id="rsvp-guests"
                value={form.guests}
                onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} orang
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="rsvp-message" className="mb-1 block text-xs font-medium text-text-primary">
              Ucapan & Doa
            </label>
            <textarea
              id="rsvp-message"
              rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Tulis ucapan untuk kedua mempelai..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-accent py-3 text-sm font-medium text-background transition-all hover:bg-accent-dark hover:shadow-md active:scale-[0.98]"
          >
            Kirim Konfirmasi
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─── 12. Guest Wishes ─── */
function WishesSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.wishes;
  if (!settings.visible) return null;

  return (
    <section className="bg-surface/40 texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-2xl text-center">
        <SectionKicker>Ucapan</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Doa & Ucapan
        </SectionHeading>
        <div className="mt-8 text-left">
          <GuestWishesList wishes={[]} />
        </div>
      </div>
    </section>
  );
}

/* ─── 13. Fun Facts ─── */
function FunFactsSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.funfacts;
  if (!settings.visible || !invitation.fun_facts?.length) return null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Fun Facts</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Tentang Kami
        </SectionHeading>
        <div className="mx-auto mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {invitation.fun_facts.map((fact, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-lg border border-border bg-background/80 px-4 py-5 text-center shadow-[0_4px_20px_rgba(84,82,77,0.04)] backdrop-blur-sm"
            >
              <Icon name={fact.icon} className="text-2xl" />
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                {fact.label}
              </p>
              <p className="mt-1 font-heading text-base text-text-primary">{fact.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 14. Closing ─── */
function ClosingSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.closing;
  if (!settings.visible) return null;

  return (
    <section className="texture-noise px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,7vw,7rem)]">
      <div className="mx-auto max-w-2xl text-center">
        <DecorativeDivider className="mb-8" />
        {invitation.closing_image && (
          <InvitationPhoto
            src={invitation.closing_image}
            alt="Terima kasih"
            className="mx-auto aspect-[3/2] w-full max-w-sm rounded-xl shadow-[0_20px_60px_rgba(84,82,77,0.1)]"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        )}
        <h2 className="mt-8 font-heading text-[clamp(1.5rem,1.25rem+1.2vw,2rem)] text-text-primary">
          Terima Kasih
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
          {invitation.closing_message ||
            "Atas kehadiran dan doa restu Anda, kami mengucapkan terima kasih. Semoga kebahagiaan selalu menyertai kita semua."}
        </p>
        <div className="mt-8">
          <CoupleNames invitation={invitation} className="font-heading text-xl text-text-primary sm:text-2xl" />
        </div>
        <DecorativeDivider className="mt-8" />
      </div>
    </section>
  );
}

/* ─── Main Template ─── */
export default function ElegantClassic({ invitation }: { invitation: Invitation }) {
  return (
    <div className="relative bg-blob-1 text-text-primary">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(212,168,83,0.04) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(124,132,114,0.04) 0%, transparent 40%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <HeroCover invitation={invitation} />
      <div className="mx-auto max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <GreetingSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <CoupleSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <StoryTimeline invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <CountdownSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <ScheduleSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <VenueSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <GallerySection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <VideoSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <GiftSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <RsvpSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <WishesSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <FunFactsSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <ClosingSection invitation={invitation} />
        <div className="mt-16 text-center">
          <DecorativeDivider />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-text-secondary">Dengan cinta</p>
        </div>
      </div>
    </div>
  );
}
