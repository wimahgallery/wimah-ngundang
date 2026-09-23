"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { headingClass, type Invitation, type SectionSettings } from "@/lib/invitation";
import { Reveal } from "@/components/motion/reveal";
import {
  CopyButton,
  CoupleNames,
  InvitationPhoto,
  SectionCopy,
  StoryParagraphs,
  VideoPlayer,
} from "../shared";

const btnCls = cn(
  "inline-flex min-h-11 items-center gap-2 border-2 border-[#101010] bg-[#FF4D2E] px-7 py-3",
  "font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#101010]",
  "shadow-[4px_4px_0_#101010] transition-all duration-150 ease-out",
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#101010]",
  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
);

const btnGhostCls = cn(
  "inline-flex min-h-11 items-center gap-2 border-2 border-[#101010] bg-white px-7 py-3",
  "font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#101010]",
  "shadow-[4px_4px_0_#101010] transition-all duration-150 ease-out",
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#101010]",
  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
);

function Stamp({
  children,
  className,
  tone = "blush",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "blush" | "accent" | "cream";
}) {
  const bg = tone === "blush" ? "bg-[#F7C8D4]" : tone === "accent" ? "bg-[#FF4D2E]" : "bg-[#F4EFE6]";
  return (
    <span
      className={cn(
        "inline-block border-2 border-[#101010] px-3 py-1 font-sans text-[10px] font-black uppercase tracking-[0.16em] text-[#101010] shadow-[3px_3px_0_#101010]",
        bg,
        className,
      )}
    >
      {children}
    </span>
  );
}

function Kicker({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit -rotate-[1.5deg] border-2 border-[#101010] px-2.5 py-1",
        "font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#101010]",
        "shadow-[3px_3px_0_#101010]",
        dark ? "bg-[#F7C8D4]" : "bg-[#FF4D2E]",
      )}
    >
      {children}
    </span>
  );
}

function Heading({
  settings,
  className,
  children,
}: {
  settings: SectionSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "mt-4 font-sans font-black uppercase leading-[1.05] tracking-[-0.02em] [overflow-wrap:anywhere]",
        headingClass(settings.headingSize),
        className,
      )}
    >
      {children}
    </h2>
  );
}

function Section({
  settings,
  children,
  className,
  id,
  wide,
}: {
  settings: SectionSettings;
  className?: string;
  id?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  if (!settings.visible) return null;
  return (
    <section
      id={id}
      className={cn(
        "texture-noise relative scroll-mt-20 px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,6vw,6rem)]",
        className,
      )}
    >
      <div className={cn("relative z-[1] mx-auto", wide ? "max-w-5xl" : "max-w-3xl")}>
        {children}
      </div>
    </section>
  );
}

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
  return <span className={className} aria-hidden>{map[name] ?? "✳"}</span>;
}

function Ticker({ items }: { items: string[] }) {
  const row = (
    <span className="flex shrink-0 items-center gap-6 pr-6">
      {items.map((t, i) => (
        <span
          key={i}
          className="flex items-center gap-6 whitespace-nowrap font-sans text-[clamp(0.75rem,0.65rem+0.4vw,0.95rem)] font-black uppercase tracking-[0.22em]"
        >
          {t}
          <span aria-hidden className="text-[#FF4D2E]">✳</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y-2 border-[#101010] bg-[#101010] py-3 text-[#F4EFE6]"
    >
      <div className="marquee-track flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

function NbCountdown({ eventDate }: { eventDate?: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!eventDate) return;
    const target = new Date(eventDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  if (!eventDate) return null;

  const units = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  return (
    <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-3 sm:gap-4">
      {units.map((u, i) => (
        <div
          key={u.label}
          className={cn(
            "min-w-0 border-2 border-[#101010] px-3 py-5 text-center shadow-[4px_4px_0_#101010]",
            i === units.length - 1 ? "bg-[#FF4D2E]" : i % 2 === 0 ? "bg-white" : "bg-[#F4EFE6]",
          )}
        >
          <span className="block font-sans text-[clamp(1.75rem,1.2rem+2.5vw,2.75rem)] font-black leading-none tabular-nums text-[#101010]">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#101010]/70">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Hero({ invitation }: { invitation: Invitation }) {
  const h = invitation.custom_settings.hero;
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  const dateText = invitation.event_date
    ? new Date(invitation.event_date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section
      className={cn(
        "texture-noise relative flex min-h-[80svh] flex-col justify-center",
        "border-b-2 border-[#101010] bg-[#F4EFE6]",
        "px-[clamp(1.5rem,4vw,3rem)] pt-[clamp(2.5rem,6vw,4rem)] pb-[clamp(3rem,7vw,5rem)]",
        "sm:min-h-[100svh]",
      )}
    >
      <div className="relative z-[1] mx-auto w-full max-w-5xl">
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
          {/* giant couple name */}
          <div className="min-w-0">
            <Stamp tone="accent" className="mb-5 -rotate-[2deg]">
              {invitation.hero_title || "Save the date"}
            </Stamp>
            <h1 className="font-sans text-[clamp(2.75rem,1.25rem+9vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] [overflow-wrap:anywhere]">
              <span className="block">{bride}</span>
              <span className="my-[0.04em] block pl-[0.1em] text-[0.45em] leading-none text-[#FF4D2E]" aria-hidden>
                ×
              </span>
              <span className="block pl-[0.05em]">{groom}</span>
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {dateText && (
                <span className="border-2 border-[#101010] bg-white px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-[0.06em] text-[#101010] shadow-[3px_3px_0_#101010]">
                  {dateText}
                </span>
              )}
              {invitation.event_time && (
                <span className="border-2 border-[#101010] bg-white px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-[0.06em] text-[#101010] shadow-[3px_3px_0_#101010]">
                  {invitation.event_time}
                </span>
              )}
            </div>

            {invitation.hero_subtitle && (
              <p className="mt-5 max-w-md font-elegant text-[clamp(1rem,0.95rem+0.4vw,1.2rem)] italic leading-relaxed text-[#55524B]">
                {invitation.hero_subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("greeting")?.scrollIntoView({ behavior: "smooth" })}
                className={btnCls}
              >
                Buka Undangan
              </button>
              <a href="#gallery" className={btnGhostCls}>
                Lihat Galeri
              </a>
            </div>
          </div>

          {/* photo card */}
          <div className="relative mx-auto w-full max-w-sm min-w-0 lg:max-w-none">
            <div className="rotate-[1.75deg] border-2 border-[#101010] bg-white p-2 shadow-[8px_8px_0_#101010]">
              <InvitationPhoto
                src={invitation.cover_image}
                alt={invitation.event_title || "Cover"}
                className="aspect-[4/5] w-full border-2 border-[#101010]"
                positionX={h.imagePositionX}
                positionY={h.imagePositionY}
                zoom={h.zoom}
                rotate={h.rotate}
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
              />
            </div>
            <Stamp className="absolute -right-2 -top-3 rotate-[6deg] sm:-right-4" tone="blush">
              We&apos;re getting married
            </Stamp>
            <Stamp className="absolute -bottom-3 left-3 -rotate-[3deg]" tone="cream">
              EST. LOVE
            </Stamp>
          </div>
        </div>
      </div>
    </section>
  );
}

function GreetingSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.greeting;
  return (
    <Section settings={s} id="greeting" className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Greeting</Kicker>
      <Heading settings={s}>
        {invitation.bride_nickname || invitation.bride_name}
        <span className="text-[#FF4D2E]"> × </span>
        {invitation.groom_nickname || invitation.groom_name}
      </Heading>
      <div className="mt-5 max-w-2xl">
        <SectionCopy settings={s}>
          {invitation.story_content?.split(/\n\n+/)[0] ||
            "Kami mengundang Anda untuk hadir dalam momen bahagia ini."}
        </SectionCopy>
      </div>
      {invitation.greeting_text && (
        <p className="mt-6 border-l-4 border-[#101010] pl-4 font-elegant text-base italic text-[#55524B]">
          {invitation.greeting_text}
          {invitation.recipient_name ? ` — ${invitation.recipient_name}` : ""}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#schedule" className={btnCls}>
          Lihat Jadwal
        </a>
        <a href="#rsvp" className={btnGhostCls}>
          RSVP
        </a>
      </div>
    </Section>
  );
}

function CoupleSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.couple;
  const cards = [
    {
      key: "bride",
      role: "Mempelai Wanita",
      name: invitation.bride_name || "",
      parents: invitation.bride_parents,
      photo: invitation.bride_photo,
      pos: {
        positionX: s.imagePositionX,
        positionY: s.imagePositionY,
        zoom: s.zoom,
        rotate: s.rotate,
      },
      tilt: "-rotate-[0.75deg]",
    },
    {
      key: "groom",
      role: "Mempelai Pria",
      name: invitation.groom_name || "",
      parents: invitation.groom_parents,
      photo: invitation.groom_photo,
      pos: {
        positionX: invitation.groom_image_position_x,
        positionY: invitation.groom_image_position_y,
        zoom: invitation.groom_image_zoom,
        rotate: invitation.groom_image_rotate,
      },
      tilt: "sm:rotate-[0.75deg]",
    },
  ];

  return (
    <Section settings={s} wide className="border-b-2 border-[#101010] bg-white">
      <Kicker>Mempelai</Kicker>
      <Heading settings={s}>Mempertemukan Hati</Heading>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-10">
        {cards.map((c, i) => (
          <Reveal key={c.key} delay={i * 100} distance={20} className="min-w-0">
            <article
              className={cn(
                "h-full border-2 border-[#101010] bg-[#F4EFE6] shadow-[6px_6px_0_#101010]",
                "transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0_#101010]",
                c.tilt,
              )}
            >
              <InvitationPhoto
                src={c.photo}
                alt={c.name || c.role}
                className="aspect-[3/4] w-full border-b-2 border-[#101010]"
                positionX={c.pos.positionX}
                positionY={c.pos.positionY}
                zoom={c.pos.zoom}
                rotate={c.pos.rotate}
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="p-5">
                <span className="inline-block border-2 border-[#101010] bg-[#FF4D2E] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#101010]">
                  {c.role}
                </span>
                <p className="mt-3 font-sans text-[clamp(1.25rem,1.1rem+0.8vw,1.6rem)] font-black uppercase leading-tight tracking-tight [overflow-wrap:anywhere]">
                  {c.name}
                </p>
                {c.parents && (
                  <p className="mt-2 text-sm leading-relaxed text-[#55524B]">{c.parents}</p>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center font-elegant text-xl italic text-[#101010]">
        <CoupleNames invitation={invitation} />
      </p>
    </Section>
  );
}

function StorySection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.story;
  const milestones = invitation.story_milestones;
  if (!s.visible) return null;
  if (!milestones?.length && !invitation.story_content) return null;

  return (
    <Section settings={s} wide id="story" className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Perjalanan Cinta</Kicker>
      <Heading settings={s}>{invitation.story_title || "Cerita Kami"}</Heading>

      {milestones?.length ? (
        <div className="mt-8 space-y-6">
          {milestones.map((m, i) => (
            <Reveal
              key={i}
              delay={i * 70}
              distance={22}
              className={cn("min-w-0", i % 2 === 1 ? "lg:ml-14" : "lg:mr-14")}
            >
              <article className="min-w-0 border-2 border-[#101010] bg-white p-5 shadow-[6px_6px_0_#101010] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="font-sans text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] font-black leading-none text-[#FF4D2E]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {m.date && (
                    <Stamp tone="cream" className="rotate-[-1deg]">
                      {m.date}
                    </Stamp>
                  )}
                </div>
                <p className="mt-3 font-sans text-[clamp(1.125rem,1rem+0.7vw,1.4rem)] font-black uppercase leading-tight tracking-tight [overflow-wrap:anywhere]">
                  {m.title}
                </p>
                {m.image && (
                  <div className="mt-4 border-2 border-[#101010]">
                    <InvitationPhoto
                      src={m.image}
                      alt={m.title}
                      className="aspect-[16/10] w-full"
                      sizes="(max-width: 768px) 100vw, 40rem"
                    />
                  </div>
                )}
                <p className="mt-4 text-sm leading-relaxed text-[#55524B] sm:text-base">
                  {m.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-6 border-2 border-[#101010] bg-white p-5 shadow-[6px_6px_0_#101010] sm:p-6">
          <StoryParagraphs content={invitation.story_content} />
        </div>
      )}
    </Section>
  );
}

function CountdownSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.countdown;
  return (
    <Section settings={s} id="countdown" className="border-b-2 border-[#101010] bg-white">
      <Kicker>Hitung Mundur</Kicker>
      <Heading settings={s}>Momen Bahagia</Heading>
      <NbCountdown eventDate={invitation.event_date} />
    </Section>
  );
}

function ScheduleSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.schedule;
  const cells = [
    invitation.event_date && {
      label: "Tanggal",
      value: new Date(invitation.event_date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
    invitation.event_time && { label: "Waktu", value: invitation.event_time },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Section settings={s} id="schedule" className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Jadwal</Kicker>
      <Heading settings={s}>Acara Kami</Heading>
      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
        {cells.map((cell, i) => (
          <Reveal key={cell.label} delay={i * 80} distance={16} className="min-w-0">
            <div
              className={cn(
                "h-full border-2 border-[#101010] p-5 shadow-[4px_4px_0_#101010]",
                i % 2 === 0 ? "bg-white" : "bg-[#F7C8D4]",
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#101010]/60">
                {cell.label}
              </p>
              <p className="mt-2 font-sans text-base font-bold leading-snug text-[#101010] [overflow-wrap:anywhere] sm:text-lg">
                {cell.value}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function VenueSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.venue;
  return (
    <Section settings={s} id="venue" className="border-b-2 border-[#101010] bg-white">
      <Kicker>Lokasi</Kicker>
      <Heading settings={s}>Tempat Acara</Heading>
      <div className="mt-6 border-2 border-[#101010] bg-[#F4EFE6] p-5 shadow-[6px_6px_0_#101010] sm:p-6">
        {invitation.venue_name && (
          <p className="font-sans text-[clamp(1.125rem,1rem+0.7vw,1.4rem)] font-black uppercase leading-tight [overflow-wrap:anywhere]">
            {invitation.venue_name}
          </p>
        )}
        {invitation.venue_address && (
          <p className="mt-2 text-sm leading-relaxed text-[#55524B] sm:text-base">
            {invitation.venue_address}
          </p>
        )}
        {invitation.google_maps_url && (
          <div className="mt-5">
            <a
              href={invitation.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={btnCls}
            >
              Buka di Google Maps
            </a>
          </div>
        )}
      </div>
    </Section>
  );
}

function GallerySection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.gallery;
  const images = invitation.gallery_images;
  if (!images.length || !s.visible) return null;
  const shown = images.slice(0, 6);

  return (
    <Section settings={s} wide id="gallery" className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Galeri</Kicker>
      <Heading settings={s}>Momen Terindah</Heading>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {shown.map((img, i) => (
          <Reveal
            key={img.id}
            delay={i * 55}
            distance={18}
            className={cn("min-w-0", i === 0 && shown.length > 1 && "col-span-2")}
          >
            <div
              className={cn(
                "group relative overflow-hidden border-2 border-[#101010] bg-white p-1.5 shadow-[4px_4px_0_#101010]",
                "transition-all duration-300 ease-out",
                "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_#101010]",
                i % 2 === 1 && "sm:rotate-[0.6deg]",
                i % 2 === 0 && i > 0 && "sm:-rotate-[0.5deg]",
              )}
            >
              <InvitationPhoto
                src={img.url}
                alt={img.alt || ""}
                className={cn("w-full border-2 border-[#101010]", i === 0 && shown.length > 1 ? "aspect-[16/10]" : "aspect-square")}
                positionX={img.positionX}
                positionY={img.positionY}
                zoom={img.zoom}
                rotate={img.rotate}
                sizes={i === 0 && shown.length > 1 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
              />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function VideoSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.video;
  if (!invitation.video_url || !s.visible) return null;
  return (
    <Section settings={s} id="video" className="border-b-2 border-[#101010] bg-white">
      <Kicker>Video</Kicker>
      <Heading settings={s}>Tayangan</Heading>
      <div className="mt-6 border-2 border-[#101010] bg-[#F4EFE6] p-2 shadow-[6px_6px_0_#101010]">
        <VideoPlayer url={invitation.video_url} poster={invitation.video_poster} className="border-0" />
      </div>
    </Section>
  );
}

function GiftSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.gift;
  if ((!invitation.gift_accounts.length && !invitation.qris_image) || !s.visible) return null;

  return (
    <Section settings={s} id="gift" className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Amal</Kicker>
      <Heading settings={s}>Angpao Digital</Heading>
      {invitation.gift_accounts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {invitation.gift_accounts.map((gift, i) => (
            <Reveal key={gift.id} delay={i * 80} distance={16} className="min-w-0">
              <article
                className={cn(
                  "h-full border-2 border-[#101010] bg-white p-5 shadow-[4px_4px_0_#101010]",
                  i % 2 === 1 ? "sm:rotate-[0.5deg]" : "",
                )}
              >
                <span className="inline-block border-2 border-[#101010] bg-[#FF4D2E] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#101010]">
                  {gift.bank}
                </span>
                <p className="mt-3 font-sans text-[clamp(1.25rem,1.1rem+0.8vw,1.5rem)] font-black tabular-nums [overflow-wrap:anywhere]">
                  {gift.accountNumber}
                </p>
                <p className="mt-1 text-sm text-[#55524B]">{gift.accountName}</p>
                <CopyButton
                  text={gift.accountNumber}
                  className="mt-4 rounded-none border-2 border-[#101010] bg-[#F4EFE6] text-[#101010] shadow-[3px_3px_0_#101010] hover:border-[#101010] hover:text-[#101010] hover:shadow-[1px_1px_0_#101010]"
                />
              </article>
            </Reveal>
          ))}
        </div>
      )}
      {invitation.qris_image && (
        <div className="mt-6 border-2 border-[#101010] bg-white p-2 shadow-[6px_6px_0_#101010]">
          <InvitationPhoto
            src={invitation.qris_image}
            alt="QRIS"
            className="mx-auto aspect-square w-full max-w-64 border-2 border-[#101010]"
            sizes="16rem"
          />
        </div>
      )}
    </Section>
  );
}

function RsvpSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.rsvp;
  return (
    <Section settings={s} id="rsvp" className="border-b-2 border-[#101010] bg-[#101010] text-[#F4EFE6]">
      <Kicker dark>Konfirmasi</Kicker>
      <Heading settings={s} className="text-[#F4EFE6]">
        Kehadiran Anda
      </Heading>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#F4EFE6]/75 sm:text-base">
        Konfirmasi kehadiran Anda melalui tombol di bawah ini — hanya butuh sepuluh detik.
      </p>
      <div className="mt-8">
        <a
          href={`/${invitation.slug}`}
          className={cn(btnCls, "shadow-[4px_4px_0_#F4EFE6] hover:shadow-[2px_2px_0_#F4EFE6] active:shadow-none")}
        >
          Konfirmasi Kehadiran
        </a>
      </div>
    </Section>
  );
}

function WishesSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.wishes;
  return (
    <Section settings={s} id="wishes" className="border-b-2 border-[#101010] bg-white">
      <Kicker>Doa & Harapan</Kicker>
      <Heading settings={s}>Harapan Kami</Heading>
      <p className="mt-4 text-sm leading-relaxed text-[#55524B] sm:text-base">
        Doa dan harapan terbaik dari keluarga dan sahabat.
      </p>
    </Section>
  );
}

function FunFactsSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.funfacts;
  const facts = invitation.fun_facts;
  if (!facts?.length || !s.visible) return null;

  return (
    <Section settings={s} wide className="border-b-2 border-[#101010] bg-[#F4EFE6]">
      <Kicker>Trivia</Kicker>
      <Heading settings={s}>Tentang Kami</Heading>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {facts.map((fact, i) => (
          <Reveal key={i} delay={i * 50} distance={14} className="min-w-0">
            <div
              className={cn(
                "flex h-full flex-col items-center border-2 border-[#101010] px-3 py-5 text-center shadow-[4px_4px_0_#101010]",
                i % 3 === 1 ? "bg-[#F7C8D4]" : "bg-white",
              )}
            >
              <Icon name={fact.icon} className="text-2xl" />
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#101010]/60">
                {fact.label}
              </p>
              <p className="mt-1 font-sans text-sm font-black text-[#101010] [overflow-wrap:anywhere]">
                {fact.value}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function ClosingSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.closing;
  return (
    <Section settings={s} className="bg-[#101010] text-[#F4EFE6]">
      <div className="text-center">
        <Stamp tone="accent" className="rotate-[-2deg]">
          The End · For Now
        </Stamp>
        <h2 className="mt-6 font-sans text-[clamp(2rem,1.4rem+3vw,3.75rem)] font-black uppercase leading-[1] tracking-[-0.02em] [overflow-wrap:anywhere]">
          Terima Kasih
        </h2>
        {invitation.closing_image && (
          <div className="mx-auto mt-7 w-full max-w-xs border-2 border-[#F4EFE6] bg-[#F4EFE6] p-1.5 shadow-[6px_6px_0_#FF4D2E] rotate-[-1.5deg]">
            <InvitationPhoto
              src={invitation.closing_image}
              alt=""
              className="aspect-[4/5] w-full border-2 border-[#101010]"
              sizes="20rem"
            />
          </div>
        )}
        <p className="mx-auto mt-6 max-w-lg font-elegant text-base italic leading-relaxed text-[#F4EFE6]/80 sm:text-lg">
          {invitation.closing_message ||
            "Atas kehadiran dan doa restu Anda, kami mengucapkan terima kasih yang tulus."}
        </p>
        <p className="mt-8 font-sans text-[clamp(1.25rem,1rem+1.2vw,1.75rem)] font-black uppercase tracking-tight [overflow-wrap:anywhere]">
          <CoupleNames invitation={invitation} />
        </p>
        <div className="mx-auto mt-6 h-1 w-24 bg-[#FF4D2E]" aria-hidden />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#F4EFE6]/50">
          See you there
        </p>
      </div>
    </Section>
  );
}

export default function NeoBrutalism({ invitation }: { invitation: Invitation }) {
  const bride = (invitation.bride_nickname || invitation.bride_name || "Bride").toUpperCase();
  const groom = (invitation.groom_nickname || invitation.groom_name || "Groom").toUpperCase();
  const dateTag = invitation.event_date
    ? new Date(invitation.event_date)
        .toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\//g, ".")
    : "SAVE THE DATE";

  const tickerItems = [bride, "FOREVER", groom, "LOVE", dateTag, "TOGETHER"];

  return (
    <div className="relative min-h-screen bg-[#F4EFE6] text-[#101010]">
      <Hero invitation={invitation} />
      <GreetingSection invitation={invitation} />
      <CoupleSection invitation={invitation} />
      <StorySection invitation={invitation} />
      <Ticker items={tickerItems} />
      <CountdownSection invitation={invitation} />
      <ScheduleSection invitation={invitation} />
      <VenueSection invitation={invitation} />
      <GallerySection invitation={invitation} />
      <VideoSection invitation={invitation} />
      <GiftSection invitation={invitation} />
      <RsvpSection invitation={invitation} />
      <WishesSection invitation={invitation} />
      <FunFactsSection invitation={invitation} />
      <ClosingSection invitation={invitation} />
    </div>
  );
}
