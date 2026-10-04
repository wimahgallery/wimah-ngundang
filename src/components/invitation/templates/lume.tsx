"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Image from "next/image";
import {
  Calendar,
  CalendarPlus,
  Camera,
  Coffee,
  Gift,
  Gem,
  Heart,
  Home,
  MapPin,
  Music,
  Plane,
  Sparkles,
  Star,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { LazyMount, useInViewOnce } from "@/components/lazy";
import {
  agendaEvents,
  coupleLabel,
  googleCalendarLink,
  type Invitation,
} from "@/lib/invitation";
import {
  fetchWishes,
  submitGuestWish,
  updateGuestWish,
  type WishRow,
} from "@/features/invitations/services/invitationApi";
import {
  ensureInvitationFontsLoaded,
  invitationFontsHref,
  resolveFontVars,
  type FontSettingsLike,
} from "@/lib/wedding-fonts";
import type { TemplateProps } from "../template-registry";
import {
  LumeThemeProvider,
  resolveLumeTheme,
  useLumeTheme,
  type LumeTheme,
} from "./lume-theme";
import { lumeVariant } from "./lume-themes";
import {
  CopyButton,
  CoupleNames,
  CountdownTimer,
  DecorativeDivider,
  GuestWishesList,
  InvitationPhoto,
  SectionCopy,
  SectionHeading,
  SectionKicker,
  StoryParagraphs,
  VideoPlayer,
} from "../shared";

/**
 * Sistem responsif (satu identitas → tiga komposisi):
 *  mobile  320–767  : satu kolom, full-bleed, tipografi fluid, tap-friendly
 *  tablet  768–1199 : dua kolom, ruang napas lebih lega (breakpoint `md`)
 *  desktop 1200+    : komposisi asimetris, overlap, skala editorial (breakpoint `desk`)
 */

/* ─── band: section penuh-lebar + container responsif ─── */
function Band({
  id,
  visible = true,
  tone = "plain",
  wide = false,
  children,
}: {
  id?: string;
  visible?: boolean;
  tone?: "plain" | "soft" | "dark";
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  if (!visible) return null;
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative lume-reveal",
        revealed && "is-revealed",
        "py-[clamp(4rem,10vw,10rem)]",
        tone === "soft" && "bg-surface/40",
        tone === "dark" && "bg-hero text-hero-ink",
      )}
    >
      <div className={wide ? "invite-wrap-wide" : "invite-wrap"}>
        {children}
      </div>
    </section>
  );
}

function OpeningPhotos(invitation: Invitation) {
  const gallery = invitation.gallery_images;
  return [gallery[0]?.url, gallery[1]?.url]
    .filter(Boolean)
    .slice(0, 2) as string[];
}

/* ─── 1. Loading dengan nama mempelai ─── */
function LoadingScreen({
  invitation,
  onDone,
}: {
  invitation: Invitation;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      onDone();
      return;
    }

    const duration = 1500;
    const start = performance.now();
    let frame = 0;
    let timer = 0;

    const tick = (now: number) => {
      const value = Math.min(100, Math.round(((now - start) / duration) * 100));
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
      else timer = window.setTimeout(onDone, 300);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-hero px-6 text-center text-hero-ink">
      <div
        aria-hidden
        className="texture-noise pointer-events-none absolute inset-0"
      />

      <p className="relative text-[10px] uppercase tracking-[0.34em] text-gold md:text-xs desk:text-sm">
        {invitation.hero_title || "The Wedding of"}
      </p>

      <p className="relative mt-5 font-heading text-[clamp(1.75rem,1rem+5vw,3rem)] md:text-[clamp(2.25rem,1rem+4vw,3.75rem)] desk:text-[clamp(3rem,1rem+4vw,4.5rem)] leading-[1.15]">
        {bride}
        <span className="mx-2 font-elegant italic text-gold">&amp;</span>
        {groom}
      </p>

      <div className="relative mt-8 w-[min(16rem,70vw)]">
        <div className="flex items-end justify-between">
          <span className="text-[10px] uppercase tracking-[0.24em] text-hero-ink/50">
            Memuat
          </span>
          <span className="font-heading text-2xl tabular-nums text-gold md:text-3xl desk:text-4xl">
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-px w-full bg-white/15">
          <div
            className="h-px bg-gold transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="relative mt-8 max-w-xs text-xs leading-relaxed text-hero-ink/55 md:text-sm">
        {formatDate(invitation.event_date)}
      </p>
    </div>
  );
}

/* ─── 2. Hero: satu identitas, tiga komposisi ───
   mobile  : nama → foto full-bleed → tanggal & tamu → tombol (satu kolom)
   tablet  : [ nama + tanggal + tamu ] [ foto tinggi  ]
   desktop : nama besar kiri-atas · foto melayang kanan · tanggal & tamu kiri-bawah
*/
function subscribeSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function useGuestName(): string | null {
  const search = useSyncExternalStore(
    subscribeSearch,
    () => window.location.search,
    () => "",
  );
  if (!search) return null;
  const value = new URLSearchParams(search).get("to");
  return value ? value.trim().slice(0, 80) : null;
}

function HeroCover({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const hero = invitation.custom_settings.hero;
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  const photoLeft = useLumeTheme().layout.heroPhoto === "left";
  const guestName = useGuestName();

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-hero py-[clamp(4.5rem,10vw,7rem)] text-hero-ink">
      <div
        aria-hidden
        className="texture-noise pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-[16%] h-56 w-56 rounded-full bg-gold/10 blur-3xl md:h-72 md:w-72"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-[10%] h-64 w-64 rounded-full bg-accent/15 blur-3xl md:h-80 md:w-80"
      />

      <div className="invite-wrap relative z-10 grid grid-cols-1 gap-7 md:grid-cols-2 md:grid-rows-[auto_auto] md:gap-x-10 md:gap-y-4 desk:grid-cols-12 desk:gap-x-14 desk:gap-y-0">
        {/* 1 · nama mempelai */}
        <div
          className={cn(
            "lume-fade-up text-center md:col-start-1 md:row-start-1 md:self-end md:pb-3 md:text-left desk:col-span-7 desk:row-start-1 desk:self-end desk:pb-6",
            photoLeft ? "desk:col-start-6" : "desk:col-start-1",
          )}
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold md:text-xs desk:text-[13px]">
            {invitation.hero_title || "The Wedding of"}
          </p>

          <h1 className="mt-4 font-heading text-[clamp(2.75rem,1.4rem+8vw,4rem)] leading-[1.02] md:mt-5 md:text-[clamp(3rem,1rem+4.4vw,4.75rem)] desk:text-[clamp(4rem,0.5rem+5vw,7rem)]">
            <span className="block">{bride}</span>
            <span className="my-1 block font-elegant text-[0.5em] italic leading-none text-gold md:my-2">
              &amp;
            </span>
            <span className="block">{groom}</span>
          </h1>
        </div>

        {/* 2 · foto */}
        <figure
          className={cn(
            "lume-fade-up relative mx-auto w-full max-w-[24rem] md:col-start-2 md:row-start-1 md:row-span-2 md:max-w-none md:self-center desk:col-span-5 desk:row-start-1 desk:row-span-2 desk:max-w-[34rem]",
            photoLeft
              ? "desk:col-start-1 desk:-mr-6"
              : "desk:col-start-8 desk:-ml-6",
          )}
          style={{ animationDelay: "250ms" }}
        >
          <span
            aria-hidden
            className="absolute -inset-3 hidden rounded-2xl border border-gold/30 md:block desk:-inset-4"
          />
          <InvitationPhoto
            src={invitation.cover_image}
            alt={invitation.event_title || "Cover"}
            className="aspect-[3/4] w-full md:aspect-[4/5] md:rounded-2xl desk:rounded-3xl"
            positionX={hero.imagePositionX}
            positionY={hero.imagePositionY}
            zoom={hero.zoom}
            rotate={hero.rotate}
            priority
            sizes="(min-width: 1200px) 40vw, (min-width: 768px) 45vw, 100vw"
          />
        </figure>

        {/* 3 · tanggal, tamu, tombol */}
        <div
          className={cn(
            "lume-fade-up text-center md:col-start-1 md:row-start-2 md:self-start md:text-left desk:col-span-6 desk:row-start-2 desk:self-start desk:pt-8",
            photoLeft ? "desk:col-start-6" : "desk:col-start-1",
          )}
          style={{ animationDelay: "400ms" }}
        >
          {invitation.event_date && (
            <p className="font-heading text-[clamp(1rem,0.8rem+1vw,1.25rem)] tracking-wide text-hero-ink/90 md:text-[clamp(1.1rem,0.8rem+0.6vw,1.5rem)]">
              {formatDate(invitation.event_date)}
            </p>
          )}

          <div className="mx-auto my-6 h-px w-16 bg-gold/40 md:mx-0 desk:my-7" />

          <div className="border-y border-white/10 py-5 md:border-0 md:py-0 desk:border-l desk:border-gold/30 desk:py-0 desk:pl-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-hero-ink/65 md:text-[11px]">
              {invitation.greeting_text || "Kepada Yth. Bapak/Ibu/Saudara/i"}
            </p>
            <p className="mt-2 font-heading text-xl italic md:text-2xl desk:text-[1.75rem]">
              {guestName || "Tamu Undangan"}
            </p>
          </div>

          <a
            href="#greeting"
            onClick={onOpen}
            className="mt-7 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-8 py-3.5 text-sm font-medium tracking-wide text-gold backdrop-blur-sm transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_10px_40px_rgba(212,168,83,0.25)] active:scale-[0.97] md:w-auto md:max-w-none md:px-9"
          >
            Buka Undangan
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Pembuka: deskripsi + foto ───
   mobile  : teks center, dua foto berdampingan
   tablet  : teks kiri · dua foto kanan (offset)
   desktop : teks kolom sempit kiri · foto besar kanan, saling menjorok
*/
function OpeningSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.greeting;
  const photos = OpeningPhotos(invitation);
  const description = invitation.hero_subtitle || invitation.greeting_text;
  const { layout } = useLumeTheme();
  const photoRight = layout.openingPhoto === "right";
  const tallIndex = layout.openingStagger === "first" ? 0 : 1;
  const lowIndex = layout.openingStagger === "first" ? 1 : 0;

  return (
    <Band id="greeting" visible={settings.visible}>
      <div className="grid gap-9 md:gap-12 desk:grid-cols-12 desk:items-center desk:gap-16">
        <div
          className={cn(
            "text-center md:mx-auto md:max-w-2xl md:text-center desk:col-span-5 desk:mx-0 desk:max-w-md desk:text-left",
            photoRight ? "desk:col-start-1" : "desk:col-start-6",
          )}
        >
          <SectionKicker>
            {invitation.hero_title || "The Wedding of"}
          </SectionKicker>
          <h2 className="mt-3 font-heading text-[clamp(1.75rem,1.2rem+2.4vw,2.5rem)] md:text-[clamp(2rem,1.2rem+2vw,3rem)] leading-[1.15]">
            <CoupleNames invitation={invitation} />
          </h2>
          {description && (
            <p className="mx-auto mt-6 text-sm leading-[1.9] text-text-secondary md:mx-0 md:text-base desk:text-[1.0625rem]">
              {description}
            </p>
          )}
          <DecorativeDivider className="mt-7 desk:justify-start" />
        </div>

        {photos.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-2 gap-3 md:gap-5 desk:col-span-7 desk:gap-7",
              photoRight ? "desk:col-start-6" : "desk:col-start-1",
            )}
          >
            {photos.map((src, index) => (
              <InvitationPhoto
                key={`${src}-${index}`}
                src={src}
                alt={`Momen ${index + 1}`}
                className={cn(
                  "aspect-[3/4] w-full overflow-hidden rounded-xl shadow-[0_18px_50px_rgba(84,82,77,0.12)] md:rounded-2xl",
                  index === tallIndex && "md:mt-10 desk:mt-20",
                  index === lowIndex && "desk:mb-16",
                )}
                sizes="(min-width: 1200px) 30vw, (min-width: 768px) 40vw, 45vw"
              />
            ))}
          </div>
        )}
      </div>
    </Band>
  );
}

/* ─── 4. Mempelai ───
   mobile  : satu kolom, foto lebar terpusat
   tablet  : dua kolom sejajar
   desktop : dua kolom dengan card kanan menjorok ke bawah (asimetris)
*/
function CoupleSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.couple;
  const { layout } = useLumeTheme();
  if (!settings.visible) return null;
  const staggerIndex = layout.coupleStagger === "first" ? 0 : 1;

  const people = [
    {
      role: "Mempelai • Pria",
      name: invitation.groom_name,
      parents: invitation.groom_parents,
      photo: invitation.groom_photo,
      position: {
        positionX: invitation.groom_image_position_x,
        positionY: invitation.groom_image_position_y,
        zoom: invitation.groom_image_zoom,
        rotate: invitation.groom_image_rotate,
      },
    },
    {
      role: "Mempelai • Wanita",
      name: invitation.bride_name,
      parents: invitation.bride_parents,
      photo: invitation.bride_photo,
      position: {
        positionX: settings.imagePositionX,
        positionY: settings.imagePositionY,
        zoom: settings.zoom,
        rotate: settings.rotate,
      },
    },
  ];

  return (
    <Band tone={layout.tones.couple}>
      <div className="text-center desk:max-w-2xl desk:text-left">
        <SectionKicker>Mempelai</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Insan yang Berbahagia
        </SectionHeading>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8 desk:mt-14 desk:gap-16">
        {people.map((person, index) => (
          <article
            key={person.role}
            className={cn(
              "flex flex-col items-center text-center",
              index === staggerIndex && "md:mt-14 desk:mt-24",
            )}
          >
            <InvitationPhoto
              src={person.photo}
              alt={person.name || person.role}
              className="aspect-[3/4] w-full max-w-[19rem] rounded-xl shadow-[0_20px_60px_rgba(84,82,77,0.14)] md:max-w-none md:rounded-2xl desk:rounded-3xl"
              {...person.position}
              sizes="(min-width: 1200px) 40vw, (min-width: 768px) 45vw, 80vw"
            />
            <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-accent-dark md:text-[11px]">
              {person.role}
            </p>
            <h3 className="mt-2 font-heading text-2xl text-text-primary md:text-3xl desk:text-[2.5rem]">
              {person.name}
            </h3>
            {person.parents && (
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-secondary md:text-sm desk:max-w-sm desk:text-[0.95rem]">
                {person.parents}
              </p>
            )}
          </article>
        ))}
      </div>
    </Band>
  );
}

/* ─── 5. Love story ───
   mobile  : potret + teks menumpuk
   tablet  : dua kolom berselang-seling
   desktop : teks menjorok menimpa foto (overlap editorial)
*/
function LoveStorySection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.story;
  const milestones = invitation.story_milestones ?? [];
  const { layout } = useLumeTheme();
  const photoFirstLeft = layout.storyFirstPhoto === "left";

  return (
    <Band tone={layout.tones.story} visible={settings.visible}>
      <div className="text-center desk:max-w-3xl desk:text-left">
        <SectionKicker>Our Love Story</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          {invitation.story_title || "Bagaimana Kami Bertemu & Jatuh Cinta"}
        </SectionHeading>
      </div>

      {milestones.length > 0 ? (
        <div className="mt-11 space-y-14 md:mt-14 md:space-y-20 desk:space-y-28">
          {milestones.map((item, index) => {
            const textOnLeft = photoFirstLeft
              ? index % 2 === 1
              : index % 2 === 0;
            return (
              <article
                key={item.id || `${item.title}-${index}`}
                className="grid items-center gap-6 md:grid-cols-2 md:gap-10 desk:gap-0"
              >
                {item.image && (
                  <figure
                    className={cn(
                      "w-full",
                      textOnLeft ? "md:order-2" : "md:order-1",
                    )}
                  >
                    <InvitationPhoto
                      src={item.image}
                      alt={item.title}
                      className="aspect-[4/5] w-full rounded-xl shadow-[0_18px_50px_rgba(84,82,77,0.12)] md:aspect-[4/3] md:rounded-2xl desk:aspect-[5/4] desk:rounded-3xl"
                      sizes="(min-width: 1200px) 55vw, (min-width: 768px) 50vw, 92vw"
                    />
                  </figure>
                )}

                <div
                  className={cn(
                    "relative z-10 min-w-0",
                    textOnLeft ? "md:order-1" : "md:order-2",
                    !item.image &&
                      "md:col-span-2 md:mx-auto md:max-w-2xl md:text-center",
                    item.image && textOnLeft && "desk:-mr-24",
                    item.image && !textOnLeft && "desk:-ml-24",
                    item.image &&
                      "desk:rounded-2xl desk:border desk:border-border/60 desk:bg-background/85 desk:p-9 desk:shadow-[0_24px_70px_rgba(84,82,77,0.10)] desk:backdrop-blur-sm",
                  )}
                >
                  <div className="flex items-center gap-3 md:inline-flex">
                    <span className="font-heading text-3xl text-accent/35 md:text-4xl desk:text-6xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.date && (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-accent md:text-[11px]">
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-heading text-xl text-text-primary md:text-2xl desk:text-[1.75rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.85] text-text-secondary md:text-base desk:text-[1.0625rem]">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-2xl space-y-4 text-center md:mt-12 desk:max-w-3xl">
          <StoryParagraphs content={invitation.story_content} />
        </div>
      )}
    </Band>
  );
}

/* ─── 6. Countdown + Google Calendar ─── */
function CountdownSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.countdown;
  const agenda = agendaEvents(invitation);
  const first = agenda[0];
  const tone = useLumeTheme().layout.tones.countdown;

  if (!settings.visible || !invitation.event_date) return null;

  const calendarLink = googleCalendarLink({
    title: invitation.event_title || coupleLabel(invitation),
    date: first?.date || invitation.event_date,
    time: first?.time || invitation.event_time,
    location: first?.location || invitation.venue_name,
    details: coupleLabel(invitation),
  });

  return (
    <Band tone={tone} visible>
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Hitung Mundur</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Menuju Hari Bahagia
        </SectionHeading>

        <div className="mt-9 md:mt-11 desk:[&_>div>div>span:first-child]:text-6xl">
          <CountdownTimer eventDate={invitation.event_date} />
        </div>

        {calendarLink && (
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-accent/40 bg-background/70 px-6 py-3.5 text-sm font-medium text-text-primary backdrop-blur-sm transition-all duration-300 hover:border-accent hover:text-accent md:w-auto md:max-w-none md:px-7"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Tambahkan ke Kalender
          </a>
        )}
      </div>
    </Band>
  );
}

/* ─── 7. Agenda acara ───
   mobile  : judul center, kartu menumpuk
   tablet  : judul di atas, dua kartu sejajar
   desktop : judul kiri (kolom sempit) · daftar agenda kanan, kartu horizontal
*/
function AgendaSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.schedule;
  const agenda = agendaEvents(invitation);
  const headerRight = useLumeTheme().layout.agendaHeader === "right";

  if (!settings.visible || agenda.length === 0) return null;

  return (
    <Band visible>
      <div className="grid gap-8 md:gap-10 desk:grid-cols-12 desk:items-start desk:gap-16">
        <header
          className={cn(
            "text-center md:mx-auto md:max-w-2xl md:text-center desk:col-span-4 desk:mx-0 desk:max-w-none desk:row-start-1 desk:text-left",
            headerRight ? "desk:col-start-9" : "desk:col-start-1",
          )}
        >
          <SectionKicker>Agenda Acara</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Mari Menjadi Saksi Cinta Kami
          </SectionHeading>
          <SectionCopy settings={settings} className="mt-4 md:mx-0">
            Dengan penuh cinta dan harapan, kami mengundang kehadiranmu di hari
            bahagia kami.
          </SectionCopy>
        </header>

        <div
          className={cn(
            "grid gap-4 md:grid-cols-2 md:gap-5 desk:col-span-8 desk:row-start-1 desk:gap-5",
            headerRight ? "desk:col-start-1" : "desk:col-start-5",
          )}
        >
          {agenda.map((event) => (
            <AgendaCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </Band>
  );
}

function AgendaCard({
  event,
}: {
  event: {
    name: string;
    date: string;
    time?: string | null;
    location?: string | null;
    address?: string | null;
    mapsUrl?: string | null;
  };
}) {
  return (
    <article className="dna-card flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-background/80 p-6 text-left shadow-[0_14px_44px_rgba(84,82,77,0.07)] backdrop-blur-sm md:p-7 desk:gap-6 desk:p-8">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.24em] text-accent md:text-[11px]">
          Agenda
        </p>
        <h3 className="mt-2 font-heading text-2xl text-text-primary md:text-[1.75rem]">
          {event.name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm md:text-[0.95rem]">
          {event.date && (
            <span className="text-text-primary">{formatDate(event.date)}</span>
          )}
          {event.time && (
            <>
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent/50" />
              <span className="text-text-secondary">{event.time}</span>
            </>
          )}
        </div>

        {(event.location || event.address) && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="flex items-start gap-1.5 text-sm text-text-primary">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span className="min-w-0 break-words">{event.location}</span>
            </p>
            {event.address && (
              <p className="mt-1.5 pl-6 text-xs leading-relaxed text-text-secondary md:text-[13px]">
                {event.address}
              </p>
            )}
          </div>
        )}
      </div>

      {event.mapsUrl && (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-dark md:w-auto md:self-start"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Google Maps
        </a>
      )}
    </article>
  );
}

/* ─── 8. Galeri ───
   mobile 2 kolom · tablet 3 kolom · desktop 4 kolom dengan potret berselang
*/
function GallerySection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.gallery;
  const [active, setActive] = useState<number | null>(null);
  const images = invitation.gallery_images;
  const { layout } = useLumeTheme();

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!settings.visible || images.length === 0) return null;

  return (
    <Band tone={layout.tones.gallery} wide={layout.galleryWide} visible>
      <div className="text-center">
        <SectionKicker>Galeri</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          <span className="block text-[0.55em] uppercase tracking-[0.2em] text-accent-dark">
            A Journey Of
          </span>
          <CoupleNames invitation={invitation} />
        </SectionHeading>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 desk:grid-cols-4 desk:gap-5">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            className="overflow-hidden rounded-lg transition active:scale-[0.98] md:rounded-xl"
            aria-label={`Buka foto ${i + 1}`}
          >
            <InvitationPhoto
              src={img.url}
              alt={img.alt || `Galeri ${i + 1}`}
              className="w-full rounded-lg transition-transform duration-500 hover:scale-[1.04] md:rounded-xl aspect-square"
              positionX={img.positionX}
              positionY={img.positionY}
              zoom={img.zoom}
              rotate={img.rotate}
              sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto"
          className="lume-lightbox-dialog fixed inset-0 z-[70] flex items-center justify-center bg-black/92 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center text-white/70 transition hover:text-white active:scale-90"
            aria-label="Tutup"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive((prev) =>
                prev === 0 ? images.length - 1 : (prev ?? 0) - 1,
              );
            }}
            className="absolute left-2 z-10 grid h-12 w-12 place-items-center text-white/70 transition hover:text-white active:scale-90 sm:left-4"
            aria-label="Sebelumnya"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive((prev) =>
                prev === images.length - 1 ? 0 : (prev ?? 0) + 1,
              );
            }}
            className="absolute right-2 z-10 grid h-12 w-12 place-items-center text-white/70 transition hover:text-white active:scale-90 sm:right-4"
            aria-label="Berikutnya"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <div
            className="relative max-h-[82vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={active}
              src={images[active].url}
              alt={images[active].alt || "Galeri"}
              width={1000}
              height={1250}
              className="lume-lightbox-photo max-h-[82vh] w-auto rounded-lg object-contain"
              sizes="92vw"
            />
          </div>
        </div>
      )}
    </Band>
  );
}

/* ─── 9. Video / YouTube ─── */
function VideoSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.video;
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  if (!settings.visible || !invitation.video_url) return null;

  return (
    <Band visible>
      <div className="mx-auto max-w-3xl text-center desk:max-w-5xl">
        <SectionKicker>Video</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Cerita dalam Video
        </SectionHeading>
        <div ref={ref} className="mt-8 md:mt-10">
          {inView ? (
            <VideoPlayer
              url={invitation.video_url}
              poster={invitation.video_poster}
            />
          ) : (
            <div
              aria-hidden
              className="aspect-video w-full animate-pulse rounded-lg border border-border bg-surface"
            />
          )}
        </div>
      </div>
    </Band>
  );
}

/* ─── 10. Wedding gift ───
   mobile  : teks + QRIS + rekening menumpuk
   desktop : teks & QRIS kiri · rekening kanan (dua kolom)
*/
function GiftSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.gift;
  const hasGift = invitation.gift_accounts.length > 0 || invitation.qris_image;
  const tone = useLumeTheme().layout.tones.gift;

  if (!settings.visible || !hasGift) return null;

  return (
    <Band tone={tone} visible>
      <div className="grid gap-9 md:gap-11 desk:grid-cols-12 desk:items-start desk:gap-16">
        <div className="text-center md:max-w-2xl md:mx-auto desk:col-span-5 desk:mx-0 desk:max-w-none desk:text-left">
          <SectionKicker>Tanda Kasih</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Wedding Gift
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:mx-0 md:text-base">
            Ucapan dan doa sudah sangat berarti. Namun jika ingin memberikan
            hadiah secara langsung, dapat melalui rekening di bawah ini:
          </p>

          {invitation.qris_image && (
            <div className="mx-auto mt-8 w-[min(16rem,80vw)] md:w-[min(17rem,60vw)] desk:mx-0 desk:w-56">
              <Image
                src={invitation.qris_image}
                alt="QRIS"
                width={400}
                height={400}
                className="w-full rounded-xl border border-border shadow-[0_14px_44px_rgba(84,82,77,0.1)]"
                loading="lazy"
              />
              <p className="mt-2 text-xs text-text-secondary md:text-left">
                Scan QRIS untuk transfer
              </p>
            </div>
          )}
        </div>

        {invitation.gift_accounts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 md:gap-4 desk:col-span-7 desk:gap-5">
            {invitation.gift_accounts.map((gift) => (
              <article
                key={gift.id}
                className="dna-card flex min-w-0 flex-col items-center rounded-2xl border border-border bg-background/85 p-6 text-center shadow-[0_14px_44px_rgba(84,82,77,0.06)] md:p-7"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-accent md:text-[11px]">
                  {gift.bank}
                </p>
                <p className="mt-3 break-all font-heading text-xl text-text-primary md:text-2xl desk:text-[1.75rem]">
                  {gift.accountNumber}
                </p>
                <p className="mt-1.5 text-sm text-text-secondary md:text-[0.95rem]">
                  {gift.accountName}
                </p>
                <CopyButton text={gift.accountNumber} className="mt-4" />
              </article>
            ))}
          </div>
        )}
      </div>
    </Band>
  );
}

/* ─── 10b. Lokasi acara (venue_name / venue_address / google_maps_url) ─── */
function VenueSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.venue;
  const {
    venue_name: venueName,
    venue_address: venueAddress,
    google_maps_url: mapsUrl,
  } = invitation;
  const hasContent = Boolean(venueName || venueAddress || mapsUrl);

  if (!settings.visible || !hasContent) return null;

  const mapQuery = venueAddress || venueName || "";
  const embedUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;
  const openUrl =
    mapsUrl ||
    (mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
      : null);

  return (
    <Band visible>
      <div className="grid gap-8 md:gap-10 desk:grid-cols-12 desk:items-center desk:gap-16">
        <header
          className={cn(
            "text-center md:mx-auto md:max-w-2xl desk:col-span-4 desk:mx-0 desk:max-w-none desk:text-left",
            !embedUrl &&
              "desk:col-span-12 desk:mx-auto desk:max-w-2xl desk:text-center",
          )}
        >
          <SectionKicker>Lokasi</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Lokasi Acara
          </SectionHeading>

          {venueName && (
            <p className="mt-5 font-heading text-xl text-text-primary md:text-2xl">
              {venueName}
            </p>
          )}
          {venueAddress && (
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-secondary md:text-[0.95rem]">
              {venueAddress}
            </p>
          )}

          {openUrl && (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-background transition hover:bg-accent-dark"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Buka Google Maps
            </a>
          )}
        </header>

        {embedUrl && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_14px_44px_rgba(84,82,77,0.07)] desk:col-span-8">
            <iframe
              src={embedUrl}
              title="Peta lokasi acara"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full border-0 md:h-80 desk:h-[26rem]"
            />
          </div>
        )}
      </div>
    </Band>
  );
}

/* ─── 10c. Fun facts / trivia (fun_facts[]) ─── */
const funFactIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  calendar: Calendar,
  camera: Camera,
  coffee: Coffee,
  gift: Gift,
  gem: Gem,
  heart: Heart,
  home: Home,
  map: MapPin,
  music: Music,
  plane: Plane,
  ring: Gem,
  star: Star,
  sparkles: Sparkles,
};

function FunFactsSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.funfacts;
  const facts = (invitation.fun_facts ?? []).filter((f) => f.label || f.value);

  if (!settings.visible || facts.length === 0) return null;

  return (
    <Band visible>
      <div className="mx-auto max-w-3xl text-center">
        <SectionKicker>Fun Facts</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Sedikit Tentang Kami
        </SectionHeading>
      </div>

      <div
        className={cn(
          "mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-4",
          facts.length > 4 ? "desk:grid-cols-6" : "desk:grid-cols-3",
        )}
      >
        {facts.map((fact, index) => {
          const Icon =
            funFactIcons[(fact.icon || "").toLowerCase()] ?? Sparkles;
          return (
            <article
              key={`${fact.label}-${index}`}
              className="dna-card flex min-w-0 flex-col items-center rounded-2xl border border-border bg-background/85 px-3 py-5 text-center shadow-[0_14px_44px_rgba(84,82,77,0.06)] md:px-4 md:py-6"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-full bg-accent/10 text-accent"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3.5 w-full truncate text-[10px] uppercase tracking-[0.18em] text-text-secondary md:text-[11px]">
                {fact.label}
              </p>
              <p className="mt-1.5 w-full break-words font-heading text-base text-text-primary md:text-lg">
                {fact.value}
              </p>
            </article>
          );
        })}
      </div>
    </Band>
  );
}

/* ─── bentuk bersama untuk RSVP & ucapan tamu ─── */
const guestFieldClass =
  "h-12 w-full rounded-full border border-border bg-white/80 px-5 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-accent";
const guestButtonClass =
  "min-h-12 w-full rounded-full bg-accent px-6 text-sm font-medium text-background transition hover:bg-accent-dark active:scale-[0.97] disabled:opacity-50";
const guestLabelClass =
  "text-[10px] uppercase tracking-[0.2em] text-text-secondary md:text-[11px]";

function applyOwnRow(
  row: WishRow,
  setName: (value: string) => void,
  setAttendance: (value: "hadir" | "ragu" | "tidak" | "") => void,
  setGuestCount: (value: number) => void,
) {
  setName(row.name);
  if (
    row.attendance === "hadir" ||
    row.attendance === "ragu" ||
    row.attendance === "tidak"
  ) {
    setAttendance(row.attendance);
  }
  if (row.guest_count) setGuestCount(row.guest_count);
}

/* ─── 10d. RSVP (rsvp_enabled + custom_settings.rsvp) ─── */
function RsvpSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.rsvp;
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "ragu" | "tidak" | "">(
    "",
  );
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [mine, setMine] = useState<WishRow | null>(null);

  const enabled = settings.visible && invitation.rsvp_enabled;
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  useEffect(() => {
    if (!enabled || !inView) return;
    let cancelled = false;
    fetchWishes(invitation.slug)
      .then((rows) => {
        if (cancelled) return;
        const own = rows.find((row) => row.mine) ?? null;
        if (own) applyOwnRow(own, setName, setAttendance, setGuestCount);
        setMine(own);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, invitation.slug, inView]);

  if (!enabled) return null;

  const options = [
    { value: "hadir", label: "Hadir" },
    { value: "ragu", label: "Masih Ragu" },
    { value: "tidak", label: "Tidak Hadir" },
  ] as const;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !attendance || status === "sending") return;
    setStatus("sending");
    setError("");
    const payload = {
      name: name.trim(),
      attendance,
      guest_count: attendance === "hadir" ? guestCount : null,
    };
    try {
      if (mine) {
        const updated = await updateGuestWish(invitation.slug, payload);
        if (updated.status === "updated" && updated.row) {
          setMine(updated.row);
        } else {
          const created = await submitGuestWish(invitation.slug, payload);
          setMine(created.row);
        }
      } else {
        const created = await submitGuestWish(invitation.slug, payload);
        if (created.status === "exists") {
          applyOwnRow(created.row, setName, setAttendance, setGuestCount);
          setMine(created.row);
          setStatus("idle");
          setError(
            "Kamu sudah mengirim konfirmasi dari perangkat ini. Data lama kami tampilkan — silakan ubah lalu simpan.",
          );
          return;
        }
        setMine(created.row);
      }
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    }
  };

  return (
    <Band tone="soft" visible>
      <div ref={ref} className="mx-auto max-w-xl text-center">
        <SectionKicker>RSVP</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Konfirmasi Kehadiran
        </SectionHeading>
        <SectionCopy settings={settings} className="mt-4">
          Mohon konfirmasi kehadiranmu agar kami dapat mempersiapkan hari
          bahagia dengan baik.
        </SectionCopy>

        {status === "done" ? (
          <div className="dna-card mt-8 rounded-2xl border border-accent/40 bg-background/85 p-6">
            <p className="font-heading text-lg text-text-primary md:text-xl">
              Terima kasih, {name.trim()}!
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Konfirmasi kehadiranmu sudah kami terima. Sampai jumpa di hari
              bahagia kami.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError("");
              }}
              className="mt-4 min-h-11 rounded-full border border-border bg-background/70 px-6 py-2.5 text-sm text-text-secondary transition hover:border-accent/50"
            >
              Ubah Konfirmasi
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-8 space-y-5 text-left"
          >
            {mine && (
              <p className="rounded-full border border-accent/30 bg-background/70 px-4 py-2.5 text-center text-xs text-text-secondary">
                Konfirmasi dari perangkat ini sudah tersimpan dan masih boleh
                diubah.
              </p>
            )}
            <div>
              <p className={guestLabelClass}>Nama</p>
              <input
                className={`${guestFieldClass} mt-2`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                maxLength={80}
                required
              />
            </div>

            <div>
              <p className={guestLabelClass}>Kehadiran</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setAttendance(
                        attendance === option.value ? "" : option.value,
                      )
                    }
                    aria-pressed={attendance === option.value}
                    className={cn(
                      "min-h-11 flex-1 rounded-full border px-4 py-2.5 text-sm transition active:scale-[0.97]",
                      attendance === option.value
                        ? "border-accent bg-accent text-background"
                        : "border-border bg-background/70 text-text-secondary hover:border-accent/50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" && (
              <div>
                <p className={guestLabelClass}>Jumlah tamu</p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={`${guestFieldClass} mt-2`}
                  value={guestCount}
                  onChange={(e) =>
                    setGuestCount(
                      Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className={guestButtonClass}
              disabled={status === "sending" || !name.trim() || !attendance}
            >
              {status === "sending"
                ? "Menyimpan..."
                : mine
                  ? "Simpan Perubahan"
                  : "Kirim Konfirmasi"}
            </button>
          </form>
        )}
      </div>
    </Band>
  );
}

/* ─── 10e. Doa & harapan tamu (guest_wishes) ─── */
function WishesSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.wishes;
  const [wishes, setWishes] = useState<WishRow[] | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [mine, setMine] = useState<WishRow | null>(null);

  const visible = settings.visible;
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  useEffect(() => {
    if (!visible || !inView) return;
    let cancelled = false;
    fetchWishes(invitation.slug)
      .then((rows) => {
        if (cancelled) return;
        setWishes(rows);
        const own = rows.find((row) => row.mine) ?? null;
        if (own) {
          setMine(own);
          setName(own.name);
          setMessage(own.message ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setWishes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [invitation.slug, visible, inView]);

  if (!visible) return null;

  const rendered = (wishes ?? []).filter((wish) => wish.message);
  const list = rendered.map((wish) => ({
    name: wish.name,
    message: wish.message || "",
    created_at: wish.created_at,
  }));

  const applyExisting = (row: WishRow) => {
    setMine(row);
    setName(row.name);
    setMessage(row.message ?? "");
    setStatus("idle");
    setError(
      "Kamu sudah mengirim ucapan dari perangkat ini. Data lama kami tampilkan — silakan ubah lalu simpan.",
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim() || status === "sending") return;
    setStatus("sending");
    setError("");
    const payload = { name: name.trim(), message: message.trim() };
    try {
      if (mine) {
        const updated = await updateGuestWish(invitation.slug, payload);
        if (updated.status === "updated" && updated.row) {
          const row = updated.row;
          setMine(row);
          setWishes((prev) =>
            (prev ?? []).map((wish) => (wish.id === row.id ? row : wish)),
          );
        } else {
          const created = await submitGuestWish(invitation.slug, payload);
          if (created.status === "exists") {
            applyExisting(created.row);
            return;
          }
          setMine(created.row);
          setWishes((prev) => [...(prev ?? []), created.row]);
        }
      } else {
        const created = await submitGuestWish(invitation.slug, payload);
        if (created.status === "exists") {
          applyExisting(created.row);
          return;
        }
        setMine(created.row);
        setWishes((prev) => [...(prev ?? []), created.row]);
      }
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    }
  };

  return (
    <Band visible>
      <div ref={ref} className="mx-auto max-w-2xl text-center">
        <SectionKicker>Wishes</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Doa &amp; Harapan
        </SectionHeading>
        <SectionCopy settings={settings} className="mt-4">
          Kirimkan doa dan harapan terbaikmu untuk hari bahagia kami.
        </SectionCopy>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-8 space-y-5 text-left"
        >
          {mine && (
            <p className="rounded-full border border-accent/30 bg-background/70 px-4 py-2.5 text-center text-xs text-text-secondary">
              Ucapan dari perangkat ini sudah tersimpan dan masih boleh diubah.
            </p>
          )}
          <div>
            <p className={guestLabelClass}>Nama</p>
            <input
              className={`${guestFieldClass} mt-2`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              maxLength={80}
              required
            />
          </div>
          <div>
            <p className={guestLabelClass}>Ucapan &amp; doa</p>
            <textarea
              className="mt-2 min-h-32 w-full rounded-2xl border border-border bg-white/80 px-5 py-4 text-sm leading-relaxed text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-accent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis doa dan harapanmu di sini..."
              maxLength={1000}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status === "done" && !error && (
            <p className="text-sm text-accent">
              Terima kasih! Ucapanmu sudah tersimpan dan masih bisa diubah.
            </p>
          )}

          <button
            type="submit"
            className={guestButtonClass}
            disabled={status === "sending" || !name.trim() || !message.trim()}
          >
            {status === "sending"
              ? "Menyimpan..."
              : mine
                ? "Simpan Perubahan"
                : "Kirim Ucapan"}
          </button>
        </form>

        <div className="mt-10 text-left">
          {wishes === null ? null : list.length > 0 ? (
            <GuestWishesList wishes={list} />
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-text-secondary">
              Belum ada ucapan. Jadilah yang pertama mengirim doa!
            </p>
          )}
        </div>
      </div>
    </Band>
  );
}

/* ─── 11. Terima kasih ───
   mobile  : foto → teks
   desktop : foto kiri · teks kanan
*/
function ThankYouSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.closing;
  const photoRight = useLumeTheme().layout.thankPhoto === "right";

  return (
    <Band visible={settings.visible}>
      <div className="grid gap-9 md:gap-11 desk:grid-cols-12 desk:items-center desk:gap-16">
        {invitation.closing_image && (
          <figure
            className={cn(
              "desk:col-span-5",
              photoRight ? "desk:col-start-8" : "desk:col-start-1",
            )}
          >
            <InvitationPhoto
              src={invitation.closing_image}
              alt="Terima kasih"
              className="mx-auto aspect-[3/4] w-[min(20rem,80vw)] rounded-xl shadow-[0_22px_60px_rgba(84,82,77,0.14)] md:w-[min(24rem,70vw)] md:rounded-2xl desk:mx-0 desk:w-full desk:rounded-3xl"
              sizes="(min-width: 1200px) 35vw, (min-width: 768px) 40vw, 80vw"
            />
          </figure>
        )}

        <div
          className={cn(
            "text-center md:max-w-xl md:mx-auto desk:col-span-7 desk:mx-0 desk:max-w-none desk:text-left",
            photoRight ? "desk:col-start-1" : "desk:col-start-6",
          )}
        >
          <DecorativeDivider className="mb-7 desk:justify-start" />

          <p className="text-[10px] uppercase tracking-[0.3em] text-accent md:text-[11px]">
            Thank You
          </p>
          <h2 className="mt-3 font-heading text-[clamp(1.75rem,1.2rem+2.4vw,2.5rem)] md:text-[clamp(2rem,1.2rem+2vw,3rem)] leading-[1.15] text-text-primary">
            Terima Kasih
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-[1.9] text-text-secondary md:mx-0 md:text-base">
            {invitation.closing_message ||
              "Setiap ucapan dan doa yang kamu berikan jadi bagian indah dalam cerita kami. Kami tak sabar menyambutmu di hari spesial nanti."}
          </p>

          <div className="mt-8 md:mt-9">
            <CoupleNames
              invitation={invitation}
              className="font-heading text-2xl text-text-primary md:text-3xl desk:text-4xl"
            />
          </div>

          <DecorativeDivider className="mt-7 desk:justify-start" />
          <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-text-secondary">
            Dengan cinta, {coupleLabel(invitation)}
          </p>
        </div>
      </div>
    </Band>
  );
}

/* ─── Desktop stage (≥1200px): galeri full-screen di kiri · kolom mobile di kanan ─── */
function DesktopGalleryPanel({ invitation }: { invitation: Invitation }) {
  const images = invitation.gallery_images;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <aside className="lume-stage__panel" aria-label="Galeri">
      {images.map((img, i) => (
        <Image
          key={img.id}
          src={img.url}
          alt={img.alt || `Galeri ${i + 1}`}
          fill
          priority={i === 0}
          sizes="(min-width: 1200px) 65vw"
          className={cn("lume-stage__shot", i === active && "is-active")}
        />
      ))}

      <div className="lume-stage__veil" aria-hidden="true" />

      <div className="lume-stage__caption">
        <p className="lume-stage__kicker">Galeri</p>
        <p className="lume-stage__title">
          <CoupleNames invitation={invitation} />
        </p>
        <div className="lume-stage__controls">
          <span className="lume-stage__count" aria-live="off">
            {String(active + 1).padStart(2, "0")}
            <span aria-hidden="true"> / </span>
            <span className="sr-only">dari</span>
            {String(images.length).padStart(2, "0")}
          </span>
          <div className="lume-stage__dots">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={cn("lume-stage__dot", i === active && "is-active")}
                onClick={() => setActive(i)}
                aria-label={`Tampilkan foto ${i + 1}`}
                aria-current={i === active}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* kolom kanan: undangan dirender ulang dalam viewport mobile (iframe same-origin) */
function DesktopPhoneFrame({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <div className="lume-stage__phone">
      <iframe
        className="lume-stage__frame"
        src={src}
        title="Pratinjau undangan versi mobile"
        loading="lazy"
      />
    </div>
  );
}

/* ─── Tombol "Buka Undangan" untuk layar pertama desktop (≥1200px):
       overlay bottom-center di atas galeri + frame HP. Layout desktop tidak
       menggulir (isi undangan ada di dalam iframe) — klik meneruskan klik ke
       tombol di dalam frame HP, lalu tombol ini hilang. ─── */
function DesktopStageCta({
  onOpen,
  hasMusic,
}: {
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  hasMusic?: boolean;
}) {
  return (
    <div
      className="lume-stage__cta"
      style={
        hasMusic
          ? { paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }
          : undefined
      }
    >
      <a
        href="#greeting"
        onClick={onOpen}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-gold/50 bg-black/45 px-8 py-3.5 text-sm font-medium tracking-wide text-gold backdrop-blur-md transition-all duration-300 hover:bg-gold/20 hover:shadow-[0_10px_40px_rgba(212,168,83,0.25)] active:scale-[0.97]"
      >
        Buka Undangan
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
          />
        </svg>
      </a>
    </div>
  );
}

/* ─── Mobile stage (<1200px): cover full-bleed seperti sampul — latar galeri
       yang otomatis berganti (sama seperti panel desktop), nama+tanggal di atas,
       "Kepada Yth" + tombol di bawah, muat satu layar.
       Di ≥1200px disembunyikan oleh CSS (desktop pakai galeri + frame HP). ─── */
function MobileStageCover({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const hero = invitation.custom_settings.hero;
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  const guestName = useGuestName();
  const images = invitation.gallery_images;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);

  const activeIndex = images.length > 0 ? active % images.length : 0;

  return (
    <section
      className="lume-stage__cover relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[#0c0d0b] text-white"
      aria-label="Sampul undangan"
    >
      {images.length > 0 ? (
        images.map((img, i) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt || `Foto ${i + 1}`}
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn("lume-stage__shot", i === activeIndex && "is-active")}
          />
        ))
      ) : (
        <InvitationPhoto
          src={invitation.cover_image}
          alt={invitation.event_title || "Cover"}
          className="absolute inset-0"
          positionX={hero.imagePositionX}
          positionY={hero.imagePositionY}
          zoom={hero.zoom}
          rotate={hero.rotate}
          priority
          sizes="100vw"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,13,11,0.72) 0%, rgba(12,13,11,0.2) 32%, rgba(12,13,11,0.3) 58%, rgba(12,13,11,0.9) 100%)",
        }}
      />
      <div aria-hidden className="texture-noise pointer-events-none absolute inset-0 opacity-40" />

      {/* atas: kicker + nama pasangan + tanggal + indikator galeri */}
      <div
        className="lume-fade-up relative z-10 px-6 pt-[max(clamp(2rem,7vh,4rem),env(safe-area-inset-top))] text-center"
        style={{ animationDelay: "150ms" }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/75">
          {invitation.hero_title || "The Wedding of"}
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2.5rem,1.4rem+7vw,3.75rem)] leading-[1.05]">
          <span className="block">{bride}</span>
          <span className="my-0.5 block font-elegant text-[0.5em] italic leading-none text-gold">
            &amp;
          </span>
          <span className="block">{groom}</span>
        </h1>
        {invitation.event_date && (
          <p className="mt-3 font-heading text-sm tracking-wide text-white/85 md:text-base">
            {formatDate(invitation.event_date)}
          </p>
        )}

        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="lume-stage__count" aria-live="off">
              {String(activeIndex + 1).padStart(2, "0")}
              <span aria-hidden="true"> / </span>
              <span className="sr-only">dari</span>
              {String(images.length).padStart(2, "0")}
            </span>
            <div className="lume-stage__dots">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Tampilkan foto ${i + 1}`}
                  aria-current={i === activeIndex}
                  className="-m-2 flex items-center p-2"
                >
                  <span
                    className={cn("lume-stage__dot block", i === activeIndex && "is-active")}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* bawah: sapaan tamu + tombol */}
      <div
        className="lume-fade-up relative z-10 px-6 pb-[max(clamp(2rem,6vh,3.5rem),env(safe-area-inset-bottom))] text-center"
        style={{ animationDelay: "350ms" }}
      >
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">
          {invitation.greeting_text || "Kepada Yth. Bapak/Ibu/Saudara/i"}
        </p>
        <p className="mt-2 font-heading text-2xl italic md:text-3xl">
          {guestName || "Tamu Undangan"}
        </p>
        <a
          href="#greeting"
          onClick={onOpen}
          className="mx-auto mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-8 py-3.5 text-sm font-medium tracking-wide text-gold backdrop-blur-sm transition-all duration-300 hover:bg-gold/25 hover:shadow-[0_10px_40px_rgba(212,168,83,0.25)] active:scale-[0.97]"
        >
          Buka Undangan
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

/* ─── Main template ─── */
function GoogleFontLink({ font }: { font: FontSettingsLike }) {
  // Pastikan font pilihan user (atau default template) termuat sebelum dipakai.
  useEffect(() => {
    ensureInvitationFontsLoaded(font);
  }, [font]);

  const href = invitationFontsHref(font);
  useEffect(() => {
    if (!href) return;
    let link = document.getElementById(
      "invitation-google-fonts",
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "invitation-google-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [href]);
  return null;
}

function LumeTemplate({
  invitation,
  embed = false,
  frameSrc,
  gated = false,
}: TemplateProps) {
  const { id: templateId, css, pageGradient } = useLumeTheme();
  const [ready, setReady] = useState(embed);
  const [opened, setOpened] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  // Buka kunci scroll + gulir ke section pembuka secara sinkron sebelum
  // navigasi anchor default berjalan. Posisi target dihitung tanpa transform
  // reveal (translateY) supaya mendarat pas di tepi viewport.
  const handleOpen = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    document.documentElement.removeAttribute("data-invitation-locked");
    setOpened(true);
    const href = e.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    history.replaceState(null, "", href);
    const ty = new DOMMatrixReadOnly(getComputedStyle(target).transform).m42;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - ty,
      // "auto" mengikuti css scroll-behavior (smooth; instant saat reduced-motion)
      behavior: "auto",
    });
  }, []);

  // Desktop (≥1200px): halaman luar tidak menggulir (galeri + frame HP, isi
  // undangan ada di dalam iframe) — jadi klik tombol diteruskan ke tombol
  // "Buka Undangan" di dalam frame HP supaya undangan terbuka di sana.
  const handleDesktopOpen = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const frame = document.querySelector<HTMLIFrameElement>(
        "iframe.lume-stage__frame",
      );
      const btn =
        frame?.contentDocument?.querySelector<HTMLAnchorElement>(
          'a[href="#greeting"]',
        );
      if (btn) {
        btn.click();
        setOpened(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (embed) document.documentElement.setAttribute("data-embed", "");
  }, [embed]);

  useEffect(() => {
    if (ready || embed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ready, embed]);

  const sections = invitation.custom_settings;
  const gallery = invitation.custom_settings.gallery;
  const galleryImages = invitation.gallery_images;
  const stage = Boolean(gallery?.visible && galleryImages.length > 0) && !embed;

  // Kunci scroll sampai pengguna klik "Buka Undangan" (hanya halaman undangan
  // nyata; halaman katalog preview lewat begitu saja). Berlaku di semua breakpoint
  // — di desktop, tombolnya ada di layar pertama (DesktopStageCta).
  useEffect(() => {
    const root = document.documentElement;
    if (!gated) {
      root.removeAttribute("data-invitation-locked");
      return;
    }
    if (opened || window.location.hash) {
      root.removeAttribute("data-invitation-locked");
      return;
    }
    root.setAttribute("data-invitation-locked", "");
    // Pengaman iOS: cegah scroll sentuh selama terkunci.
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventTouch, { passive: false });
    return () => {
      root.removeAttribute("data-invitation-locked");
      document.removeEventListener("touchmove", preventTouch);
    };
  }, [gated, opened]);

  return (
    <div
      data-template={templateId}
      className={cn(
        "relative text-text-primary",
        !pageGradient && "bg-blob-1",
        stage && "lume-stage",
      )}
      style={
        {
          ...css,
          ...resolveFontVars(invitation.custom_settings.font),
          background: pageGradient,
        } as CSSProperties
      }
    >
      <GoogleFontLink font={invitation.custom_settings.font} />
      {!ready && !embed && (
        <LoadingScreen invitation={invitation} onDone={handleReady} />
      )}

      {stage && (
        <>
          <MobileStageCover invitation={invitation} onOpen={handleOpen} />
          <DesktopGalleryPanel invitation={invitation} />
          <DesktopPhoneFrame src={frameSrc} />
          {!opened && (
            <DesktopStageCta
              onOpen={handleDesktopOpen}
              hasMusic={
                Boolean(invitation.music_url) &&
                invitation.custom_settings.music.visible
              }
            />
          )}
        </>
      )}

      <div className={cn(stage && "lume-stage__body")}>
        {!stage && <HeroCover invitation={invitation} onOpen={handleOpen} />}
        <OpeningSection invitation={invitation} />
        <CoupleSection invitation={invitation} />
        <LoveStorySection invitation={invitation} />
        <CountdownSection invitation={invitation} />
        <AgendaSection invitation={invitation} />
        <VenueSection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <FunFactsSection invitation={invitation} />
        <VideoSection invitation={invitation} />
        <GiftSection invitation={invitation} />
        <RsvpSection invitation={invitation} />
        <WishesSection invitation={invitation} />
        <ThankYouSection invitation={invitation} />
        <div className="h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
        <div className="invite-wrap py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-text-secondary">
            {sections.music.visible
              ? "Terima kasih atas doa restunya"
              : "Dengan cinta"}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Satu layout Lume, banyak varian: palet/ritme section diambil dari tema. */
export function createLumeTemplate(theme: LumeTheme) {
  const value = resolveLumeTheme(theme);

  function ThemedLumeTemplate(props: TemplateProps) {
    return (
      <LumeThemeProvider value={value}>
        <LumeTemplate {...props} />
      </LumeThemeProvider>
    );
  }

  ThemedLumeTemplate.displayName = `Lume(${theme.id})`;
  return ThemedLumeTemplate;
}

export default createLumeTemplate(lumeVariant);
