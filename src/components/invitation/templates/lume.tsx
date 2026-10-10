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
  BookHeart,
  Calendar,
  CalendarPlus,
  Camera,
  Coffee,
  Gift,
  Gem,
  Heart,
  Home,
  Hourglass,
  Lightbulb,
  MailOpen,
  MapPin,
  MessageCircleHeart,
  Music,
  Plane,
  Play,
  Quote,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { cn, formatDate, previewImageSrc } from "@/lib/utils";
import { wimahInstagram } from "@/lib/site-config";
import { InstagramIcon } from "@/components/home/social-icons";
import { dispatchInvitationOpen } from "../shared";
import { useInViewOnce } from "@/components/lazy";
import {
  agendaEvents,
  coupleLabel,
  googleCalendarLink,
  paragraphClass,
  textGapFor,
  type GalleryImage,
  type Invitation,
  type TextAlign,
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
import { RichText } from "../rich-text";
import {
  CopyButton,
  CoupleNames,
  CountdownTimer,
  GuestWishesList,
  InvitationPhoto,
  SectionCopy,
  SectionHeading,
  SectionKicker,
  VideoPlayer,
} from "../shared";

/**
 * Sistem responsif (satu identitas → dua komposisi):
 *  mobile 320–767 : satu kolom, full-bleed, tipografi fluid, tap-friendly
 *  tablet & desktop 768+ : komposisi asimetris, overlap, skala editorial (breakpoint `desk` = `md`)
 */

/* ─── band: section penuh-lebar + container responsif ─── */
function Band({
  id,
  visible = true,
  tone = "plain",
  wide = false,
  full = false,
  backdrop,
  children,
}: {
  id?: string;
  visible?: boolean;
  tone?: "plain" | "soft" | "dark";
  wide?: boolean;
  full?: boolean;
  backdrop?: React.ReactNode;
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
        full
          ? "flex min-h-[100svh] flex-col justify-center py-[clamp(3rem,8vw,7rem)]"
          : "py-[clamp(4rem,10vw,10rem)]",
        tone === "soft" && "bg-surface/40",
        tone === "dark" && "bg-hero text-hero-ink",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {backdrop}
        {/* Lapisan foto blur untuk band berselang-seling. Diam secara default;
            CSS di globals.css yang menyalakannya (section genap dalam
            .lume-sections), sehingga ritme tetap foto → polos → foto → polos. */}
        <div className="lume-band__photo" />
      </div>
      <div
        className={cn(
          wide ? "invite-wrap-wide" : "invite-wrap",
          "relative z-10",
        )}
      >
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
      <p className="relative text-[10px] uppercase tracking-[0.34em] text-gold desk:text-sm">
        {invitation.hero_title || "The Wedding of"}
      </p>

      <p className="relative mt-5 font-heading text-[clamp(1.75rem,1rem+5vw,3rem)] desk:text-[clamp(3rem,1rem+4vw,4.5rem)] leading-[1.15]">
        {groom}
        <span className="mx-2 font-elegant italic text-gold">&amp;</span>
        {bride}
      </p>

      <div className="relative mt-8 w-[min(16rem,70vw)]">
        <div className="flex items-end justify-between">
          <span className="text-[10px] uppercase tracking-[0.24em] text-hero-ink/50">
            Memuat
          </span>
          <span className="font-heading text-2xl tabular-nums text-gold desk:text-4xl">
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

/* ─── 2. Sampul bersama — dipakai semua template.
   Layout mengikuti sampul referensi: foto full-bleed + veil gelap,
   blok atas (kicker · nama pasangan · tanggal), blok bawah
   (sapaan tamu · catatan penulisan nama · tombol "Buka Undangan"). ─── */

const COVER_BG = "bg-[#0c0d0b]";

const COVER_VEIL =
  "linear-gradient(180deg, rgba(12,13,11,0.6) 0%, rgba(12,13,11,0.45) 38%, rgba(12,13,11,0.5) 62%, rgba(12,13,11,0.78) 100%)";

const COVER_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-8 py-3 text-sm font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25 active:scale-[0.97]";

/** Latar sampul: foto undangan full-bleed; kalau belum ada foto, bidang gelap
 *  netral supaya teks putih tetap terbaca di semua tema (terang maupun gelap). */
function CoverBackdrop({ invitation }: { invitation: Invitation }) {
  const hero = invitation.custom_settings.hero;
  if (!invitation.cover_image) {
    return <div aria-hidden className={`absolute inset-0 ${COVER_BG}`} />;
  }
  return (
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
  );
}

/** Blok atas sampul: kicker, nama pasangan satu baris, dan tanggal. */
function CoverTop({ invitation }: { invitation: Invitation }) {
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";

  return (
    <div
      className="lume-fade-up relative z-10 w-full px-6 text-center"
      style={{ animationDelay: "150ms" }}
    >
      <p className="text-[13px] tracking-[0.1em] text-white/75 md:text-sm md:tracking-[0.14em]">
        {invitation.hero_title || "The Wedding of"}
      </p>

      <h1 className="mx-auto mt-3 max-w-[22rem] text-balance font-heading text-[clamp(1.9rem,1.1rem+4.5vw,3.5rem)] font-semibold uppercase leading-[1.15] tracking-[0.02em] text-white md:mt-4 md:max-w-[34rem] md:text-[clamp(2.75rem,1.2rem+4vw,5rem)]">
        {groom}
        <span
          aria-hidden
          className="mx-2 align-middle font-normal text-white/60"
        >
          •
        </span>
        {bride}
      </h1>

      {invitation.event_date && (
        <p className="mt-3 text-[15px] tracking-wide text-white/85 md:mt-4 md:text-base">
          {formatDate(invitation.event_date)}
        </p>
      )}
    </div>
  );
}

/** Blok bawah sampul: sapaan tamu, catatan, dan tombol pembuka. */
function CoverBottom({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const guestName = useGuestName();

  return (
    <div
      className="lume-fade-up relative z-10 w-full px-6 text-center"
      style={{ animationDelay: "350ms" }}
    >
      <RichText
        text={invitation.greeting_text || "Kepada Yth. Bapak/Ibu/Saudara/i"}
        align={invitation.custom_settings.textAlign?.greeting_text}
        gap={textGapFor(invitation.custom_settings, "greeting_text")}
        className="text-[13px] tracking-[0.06em] text-white/75 md:text-sm"
      />
      <p className="mt-4 font-heading text-[clamp(1.6rem,1.2rem+1.8vw,2.5rem)] font-semibold leading-tight text-white">
        {guestName || "Tamu Undangan"}
      </p>
      <p className="mx-auto mt-3 max-w-[24rem] text-[13px] italic leading-relaxed text-white/60">
        Mohon maaf untuk kesalahan penulisan nama/gelar
      </p>

      <a
        href="#greeting"
        onClick={onOpen}
        className={cn("mt-7 w-fit", COVER_BUTTON_CLASS)}
      >
        <MailOpen className="h-4 w-4" aria-hidden />
        Buka Undangan
      </a>
    </div>
  );
}

function HeroCover({
  invitation,
  onOpen,
  exiting = false,
}: {
  invitation: Invitation;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  exiting?: boolean;
}) {
  return (
    <section
      aria-label="Sampul undangan"
      aria-hidden={exiting || undefined}
      className={cn(
        "relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden text-white",
        COVER_BG,
        exiting &&
          "pointer-events-none fixed inset-0 z-50 transition-all duration-700 ease-out",
        exiting && "scale-[1.04] opacity-0 blur-[20px]",
      )}
    >
      <CoverBackdrop invitation={invitation} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: COVER_VEIL }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-9 md:gap-11">
        <CoverTop invitation={invitation} />
        <CoverBottom invitation={invitation} onOpen={onOpen} />
      </div>
    </section>
  );
}

/* ─── 3. Kartu judul satu layar penuh: kicker + nama pasangan + tanggal ───
   Tampil tepat setelah sampul dibuka; jadi layar pertama saat scroll.
*/
function OpeningSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.greeting;
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  const gallery = invitation.gallery_images
    .map((g) => g?.url)
    .filter((u): u is string => Boolean(u))
    .slice(0, 6);
  const [active, setActive] = useState(0);

  // Crossfade latar galeri tiap 5 detik (berhenti kalau user minta reduced motion).
  useEffect(() => {
    if (gallery.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % gallery.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [gallery.length]);

  const activeIndex = Math.min(active, Math.max(gallery.length - 1, 0));

  return (
    <Band
      id="greeting"
      visible={settings.visible}
      full
      backdrop={
        gallery.length > 0 ? (
          <>
            {gallery.map((src, index) => (
              <div
                key={`title-bg-${index}`}
                className={cn(
                  "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out",
                  index === activeIndex ? "opacity-100" : "opacity-0",
                )}
                style={{
                  backgroundImage: `url(${JSON.stringify(previewImageSrc(src, 1200))})`,
                  filter: "blur(4px)",
                  transform: "scale(1.06)",
                }}
              />
            ))}
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/50" />
          </>
        ) : undefined
      }
    >
      <div className="relative z-10 text-center text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5),0_2px_32px_rgba(0,0,0,0.35)] [&_.dna-kicker]:text-white/85">
        <SectionKicker icon={Heart}>
          {invitation.hero_title || "The Wedding of"}
        </SectionKicker>
        <h2 className="mt-4 text-balance font-heading text-[clamp(2.2rem,1.3rem+4vw,4.5rem)] font-semibold uppercase leading-[1.15] tracking-[0.02em]">
          {groom}
          <span
            aria-hidden
            className="mx-2 align-middle font-normal text-accent-light"
          >
            •
          </span>
          {bride}
        </h2>
        {invitation.event_date && (
          <p className="mt-5 text-sm tracking-wide text-white/85 md:text-base">
            {formatDate(invitation.event_date)}
          </p>
        )}
      </div>
    </Band>
  );
}

/* ─── 3b. Kata pembuka + deskripsi + foto couple ───
   Teks pembuka di-edit per undangan (`custom_settings.preamble.text`) —
   tanpa teks, foto tetap tampil (selama section nama+foto tidak disembunyikan). ─── */
function PreambleSection({ invitation }: { invitation: Invitation }) {
  const greeting = invitation.custom_settings.greeting;
  const settings = invitation.custom_settings.preamble;
  const text = settings.visible ? settings.text?.trim() : undefined;
  const description = greeting.visible
    ? invitation.hero_subtitle || undefined
    : undefined;
  const photos = greeting.visible ? OpeningPhotos(invitation) : [];
  const { layout } = useLumeTheme();
  const tallIndex = layout.openingStagger === "first" ? 0 : 1;
  const lowIndex = layout.openingStagger === "first" ? 1 : 0;

  if (!text && !description && photos.length === 0) return null;

  return (
    <Band
      id="pembuka"
      backdrop={
        <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/30 to-surface/70" />
      }
    >
      {(text || description) && (
        <div className="mx-auto max-w-2xl text-center">
          {text && (
            <>
              <SectionKicker icon={Quote}>OM SWASTIASTU.</SectionKicker>
              <RichText
                text={text}
                align={invitation.custom_settings.textAlign?.preamble_text}
                gap={textGapFor(invitation.custom_settings, "preamble_text")}
                className={cn(
                  "mt-6 space-y-4 text-text-secondary leading-[2]",
                  paragraphClass(settings.paragraphSize),
                )}
              />
            </>
          )}
          {description && (
            <RichText
              text={description}
              align={invitation.custom_settings.textAlign?.hero_subtitle}
              gap={textGapFor(invitation.custom_settings, "hero_subtitle")}
              className={cn(
                "space-y-3 text-sm leading-[1.9] text-text-secondary md:text-base",
                text && "mt-6",
              )}
            />
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 md:mt-14 md:gap-5">
          {photos.map((src, index) => (
            <InvitationPhoto
              key={`opening-photo-${index}`}
              src={src}
              alt={`Momen ${index + 1}`}
              className={cn(
                "photo-garden aspect-[3/4] w-full overflow-hidden shadow-[0_18px_50px_rgba(84,82,77,0.12)]",
                index === tallIndex && "md:mt-10",
                index === lowIndex && "md:mb-10",
              )}
              sizes="(min-width: 768px) 40vw, 45vw"
            />
          ))}
        </div>
      )}
    </Band>
  );
}

/* ─── 4. Mempelai ───
   mobile  : satu kolom, foto lebar terpusat
   tablet  : dua kolom sejajar
   desktop : dua kolom dengan card kanan menjorok ke bawah (asimetris)
*/
/** Tautan Instagram yang sudah diberi awalan `https://` bila user hanya menulis
 *  username (mis. `@dikapratama` → `https://www.instagram.com/dikapratama`). */
function instagramHref(url: string): string {
  const value = (url ?? "").trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value)
    ? value
    : `https://www.instagram.com/${value.replace(/^@/, "")}`;
}

/** Handle untuk label link: `@dikapratama`; kalau bukan username tunggal
 *  (URL rumit/berantakan), tulis saja "Instagram". */
function instagramHandle(url: string): string {
  const path = (url ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .split(/[?#]/)[0]
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  return path && !path.includes("/") ? `@${path}` : "Instagram";
}

function CoupleSection({ invitation }: { invitation: Invitation }) {
  const settings = invitation.custom_settings.couple;
  const { layout } = useLumeTheme();
  if (!settings.visible) return null;
  const staggerIndex = layout.coupleStagger === "first" ? 0 : 1;

  const people = [
    {
      role: "The Groom",
      name: invitation.groom_name,
      parents: invitation.groom_parents,
      photo: invitation.groom_photo,
      instagram: invitation.groom_social?.instagram,
      position: {
        positionX: invitation.groom_image_position_x,
        positionY: invitation.groom_image_position_y,
        zoom: invitation.groom_image_zoom,
        rotate: invitation.groom_image_rotate,
      },
    },
    {
      role: "The Bride",
      name: invitation.bride_name,
      parents: invitation.bride_parents,
      photo: invitation.bride_photo,
      instagram: invitation.bride_social?.instagram,
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
      <div className="max-w-2xl">
        <SectionKicker icon={Users}>Mempelai</SectionKicker>
      </div>

      {/* Mempelai pria di kiri, mempelai wanita di kanan — teks menempel ke
          sisi fotonya (kiri/kanan), tidak center, supaya komposisi asimetris. */}
      <div className="mt-10 grid gap-10 md:grid-cols-2 desk:mt-14 desk:gap-16">
        {people.map((person, index) => (
          <article
            key={person.role}
            className={cn(
              "flex flex-col",
              index === 0 ? "items-start text-left" : "items-end text-right",
              index === staggerIndex && "desk:mt-24",
            )}
          >
            <InvitationPhoto
              src={person.photo}
              alt={person.name || person.role}
              className="photo-garden aspect-[3/4] w-full max-w-[21.5rem] shadow-[0_20px_60px_rgba(84,82,77,0.14)] md:max-w-none"
              {...person.position}
              sizes="(min-width: 768px) 40vw, 80vw"
            />
            <p className="mt-6 font-script text-[1.45rem] leading-[1.2] text-accent-dark md:text-[1.75rem]">
              {person.role}
            </p>
            <h3 className="mt-3 font-heading text-2xl text-text-primary desk:text-[2.5rem]">
              {person.name}
            </h3>
            {person.instagram && (
              <a
                href={instagramHref(person.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors duration-300 hover:text-accent-dark"
              >
                <InstagramIcon className="h-4 w-4" />
                {instagramHandle(person.instagram)}
              </a>
            )}
            {person.parents && (
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-secondary desk:max-w-sm desk:text-[0.95rem]">
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
        <SectionKicker icon={BookHeart}>Our Love Story</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          {invitation.story_title || "Bagaimana Kami Bertemu & Jatuh Cinta"}
        </SectionHeading>
      </div>

      {milestones.length > 0 ? (
        <div className="mt-11 space-y-14 md:mt-14 desk:space-y-28">
          {milestones.map((item, index) => {
            const textOnLeft = photoFirstLeft
              ? index % 2 === 1
              : index % 2 === 0;
            return (
              <article
                key={item.id || `${item.title}-${index}`}
                className="grid items-center gap-6 md:grid-cols-2 desk:gap-0"
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
                      className="aspect-[4/5] w-full rounded-xl shadow-[0_18px_50px_rgba(84,82,77,0.12)] desk:aspect-[5/4] desk:rounded-3xl"
                      sizes="(min-width: 768px) 55vw, 92vw"
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
                    <span className="font-heading text-3xl text-accent/35 desk:text-6xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.date && (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-accent md:text-[11px]">
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-heading text-xl text-text-primary desk:text-[1.75rem]">
                    {item.title}
                  </h3>
                  <RichText
                    text={item.description}
                    align={
                      invitation.custom_settings.textAlign?.story_milestones
                    }
                    gap={textGapFor(
                      invitation.custom_settings,
                      "story_milestones",
                    )}
                    className="mt-3 space-y-2 text-sm leading-[1.85] text-text-secondary desk:text-[1.0625rem]"
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-2xl text-center md:mt-12 desk:max-w-3xl">
          <RichText
            text={invitation.story_content}
            align={invitation.custom_settings.textAlign?.story_content}
            gap={textGapFor(invitation.custom_settings, "story_content")}
            className="space-y-4 text-text-secondary leading-relaxed"
          />
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
        <SectionKicker icon={Hourglass}>Hitung Mundur</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Menuju Hari Bahagia
        </SectionHeading>

        <div className="mt-9 md:mt-11 desk:[&_>div>div>span:first-child]:text-6xl">
          <CountdownTimer
            eventDate={first?.date || invitation.event_date}
            eventTime={first?.time || invitation.event_time}
          />
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
      <div className="grid gap-8 desk:grid-cols-12 desk:items-start desk:gap-16">
        <header
          className={cn(
            "text-center desk:col-span-4 desk:mx-0 desk:max-w-none desk:row-start-1 desk:text-left",
            headerRight ? "desk:col-start-9" : "desk:col-start-1",
          )}
        >
          <SectionKicker icon={Calendar}>Agenda Acara</SectionKicker>
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
            <AgendaCard
              key={event.id}
              event={event}
              align={invitation.custom_settings.textAlign?.schedule_events}
              gap={textGapFor(invitation.custom_settings, "schedule_events")}
            />
          ))}
        </div>
      </div>
    </Band>
  );
}

function AgendaCard({
  event,
  align,
  gap,
}: {
  event: {
    name: string;
    date: string;
    time?: string | null;
    location?: string | null;
    address?: string | null;
    mapsUrl?: string | null;
  };
  align?: TextAlign;
  gap?: number;
}) {
  return (
    <article className="dna-card flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-background/80 p-6 text-left shadow-[0_14px_44px_rgba(84,82,77,0.07)] backdrop-blur-sm desk:gap-6 desk:p-8">
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
            <div className="flex items-start gap-1.5 text-sm text-text-primary">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              {/* `location` dan `address` adalah field terpisah — hanya salah satu
                  yang terisi tidak boleh menghasilkan ikon mengambang tanpa teks. */}
              <RichText
                text={event.location || event.address}
                align={align}
                gap={gap}
                className="min-w-0 flex-1 break-words"
              />
            </div>
            {event.location && event.address && (
              <RichText
                text={event.address}
                align={align}
                gap={gap}
                className="mt-1.5 space-y-1 pl-6 text-xs leading-relaxed text-text-secondary md:text-[13px]"
              />
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
  const dialogContentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isOpen = active !== null;
  const imageCount = images.length;

  // Lifecycle dialog: kunci scroll + pindahkan fokus ke lightbox, lalu
  // kembalikan fokus ke thumbnail yang membukanya saat ditutup.
  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      dialogContentRef.current?.querySelector<HTMLElement>("button")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.overflow = previousOverflow;
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [isOpen]);

  // Keyboard: Escape tutup, ← → pindah foto, Tab diputar di dalam dialog.
  useEffect(() => {
    if (active === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActive(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((prev) =>
          prev === null ? prev : prev === 0 ? imageCount - 1 : prev - 1,
        );
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((prev) =>
          prev === null ? prev : prev === imageCount - 1 ? 0 : prev + 1,
        );
        return;
      }
      if (e.key !== "Tab") return;

      const root = dialogContentRef.current;
      const nodes = Array.from(
        root?.querySelectorAll<HTMLElement>("button") ?? [],
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      const inside = Boolean(current && root?.contains(current));
      if (e.shiftKey && (!inside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, imageCount]);

  if (!settings.visible || images.length === 0) return null;

  const gridMode = settings.layout ?? "grid";

  // --- Kolom responsif 1–8 per breakpoint. String statis agar ter-scan JIT Tailwind. ---
  const GRID_COLS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
  };
  const GRID_COLS_DESK: Record<number, string> = {
    1: "desk:grid-cols-1",
    2: "desk:grid-cols-2",
    3: "desk:grid-cols-3",
    4: "desk:grid-cols-4",
    5: "desk:grid-cols-5",
    6: "desk:grid-cols-6",
    7: "desk:grid-cols-7",
    8: "desk:grid-cols-8",
  };
  const COLUMNS_N: Record<number, string> = {
    1: "columns-1",
    2: "columns-2",
    3: "columns-3",
    4: "columns-4",
    5: "columns-5",
    6: "columns-6",
    7: "columns-7",
    8: "columns-8",
  };
  const COLUMNS_DESK: Record<number, string> = {
    1: "desk:columns-1",
    2: "desk:columns-2",
    3: "desk:columns-3",
    4: "desk:columns-4",
    5: "desk:columns-5",
    6: "desk:columns-6",
    7: "desk:columns-7",
    8: "desk:columns-8",
  };
  const clampInt = (
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const mCols = clampInt(settings.columnsMobile, 1, 8, 2);
  const dCols = clampInt(settings.columnsDesktop, 1, 8, 4);
  const gridClass = cn(
    GRID_COLS[mCols],
    GRID_COLS_DESK[dCols],
    "gap-2.5 desk:gap-5",
  );
  const columnsClass = cn(
    COLUMNS_N[mCols],
    COLUMNS_DESK[dCols],
    "gap-2.5 desk:gap-5",
  );

  // --- Bentuk foto bebas: rasio CSS apa pun ("1/1", "16/9", angka kustom). ---
  const parseRatio = (value: unknown, fallback: number): number => {
    const raw = String(value ?? "").trim();
    const match = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(raw);
    if (match) {
      const r = Number(match[1]) / Number(match[2]);
      if (Number.isFinite(r) && r > 0) return r;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const ratioStyle = (r: number) => ({
    aspectRatio: String(Math.round(r * 1000) / 1000),
  });
  const cellRatio = parseRatio(settings.aspect, 1);
  const heroRatio = parseRatio(settings.heroAspect, 16 / 9);
  const cellSizes = `(min-width: 768px) ${(100 / dCols).toFixed(1)}vw, ${(100 / mCols).toFixed(1)}vw`;

  const thumb = (
    img: GalleryImage,
    i: number,
    opts: { ratio: number; sizes: string; extra?: string },
  ) => (
    <button
      key={img.id}
      type="button"
      onClick={(e) => {
        triggerRef.current = e.currentTarget;
        setActive(i);
      }}
      className={cn(
        "block w-full overflow-hidden rounded-lg transition active:scale-[0.98] md:rounded-xl",
        opts.extra,
      )}
      aria-label={`Buka foto ${i + 1}`}
    >
      <InvitationPhoto
        src={img.url}
        alt={img.alt || `Galeri ${i + 1}`}
        className="w-full rounded-lg transition-transform duration-500 hover:scale-[1.04] md:rounded-xl"
        style={ratioStyle(opts.ratio)}
        positionX={img.positionX}
        positionY={img.positionY}
        zoom={img.zoom}
        rotate={img.rotate}
        sizes={opts.sizes}
      />
    </button>
  );

  return (
    <Band tone={layout.tones.gallery} wide={layout.galleryWide} visible>
      <div className="text-center">
        <SectionKicker icon={Camera}>Galeri</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          <span className="block text-[0.55em] uppercase tracking-[0.2em] text-accent-dark">
            A Journey Of
          </span>
          <CoupleNames invitation={invitation} />
        </SectionHeading>
      </div>

      {gridMode === "hero" ? (
        <div className={cn("mt-10 grid", gridClass)}>
          {thumb(images[0], 0, {
            ratio: heroRatio,
            sizes: "(min-width: 1200px) 1100px, 100vw",
            extra: "col-span-full",
          })}
          {images
            .slice(1)
            .map((img, idx) =>
              thumb(img, idx + 1, { ratio: cellRatio, sizes: cellSizes }),
            )}
        </div>
      ) : gridMode === "mosaic" ? (
        <div className={cn("mt-10", columnsClass)}>
          {images.map((img, i) =>
            thumb(img, i, {
              ratio: cellRatio * [0.8, 1, 4 / 3][i % 3],
              sizes: cellSizes,
              extra: "mb-2.5 break-inside-avoid md:mb-4",
            }),
          )}
        </div>
      ) : (
        <div className={cn("mt-10 grid", gridClass)}>
          {images.map((img, i) =>
            thumb(img, i, { ratio: cellRatio, sizes: cellSizes }),
          )}
        </div>
      )}

      {active !== null && (
        <div
          ref={dialogContentRef}
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
        <SectionKicker icon={Play}>Video</SectionKicker>
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
  // Baris rekening kosong (editor mengizinkan "Tambah rekening" yang belum diisi)
  // tidak boleh dirender — kartu tanpa nomor + tombol salin yang menyalin "null".
  const accounts = invitation.gift_accounts.filter(
    (gift) => (gift.accountNumber ?? "").trim().length > 0,
  );
  const hasGift = accounts.length > 0 || Boolean(invitation.qris_image);
  const tone = useLumeTheme().layout.tones.gift;

  if (!settings.visible || !hasGift) return null;

  return (
    <Band tone={tone} visible>
      <div className="grid gap-9 desk:grid-cols-12 desk:items-start desk:gap-16">
        <div className="text-center desk:col-span-5 desk:mx-0 desk:max-w-none desk:text-left">
          <SectionKicker icon={Gift}>Tanda Kasih</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Wedding Gift
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:mx-0 md:text-base">
            Ucapan dan doa sudah sangat berarti. Namun jika ingin memberikan
            hadiah secara langsung, dapat melalui rekening di bawah ini:
          </p>

          {invitation.qris_image && (
            <div className="mx-auto mt-8 w-[min(16rem,80vw)] desk:mx-0 desk:w-56">
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

        {accounts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 desk:col-span-7 desk:gap-5">
            {accounts.map((gift) => (
              <article
                key={gift.id}
                className="dna-card flex min-w-0 flex-col items-center rounded-2xl border border-border bg-background/85 p-6 text-center shadow-[0_14px_44px_rgba(84,82,77,0.06)] md:p-7"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-accent md:text-[11px]">
                  {gift.bank}
                </p>
                <p className="mt-3 break-all font-heading text-xl text-text-primary desk:text-[1.75rem]">
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
      <div className="grid gap-8 desk:grid-cols-12 desk:items-center desk:gap-16">
        <header
          className={cn(
            "text-center desk:col-span-4 desk:mx-0 desk:max-w-none desk:text-left",
            !embedUrl &&
              "desk:col-span-12 desk:mx-auto desk:max-w-2xl desk:text-center",
          )}
        >
          <SectionKicker icon={MapPin}>Lokasi</SectionKicker>
          <SectionHeading settings={settings} className="mt-3">
            Lokasi Acara
          </SectionHeading>

          {venueName && (
            <p className="mt-5 font-heading text-xl text-text-primary md:text-2xl">
              {venueName}
            </p>
          )}
          {venueAddress && (
            <RichText
              text={venueAddress}
              align={invitation.custom_settings.textAlign?.venue_address}
              gap={textGapFor(invitation.custom_settings, "venue_address")}
              className="mx-auto mt-2 max-w-xl space-y-1 text-sm leading-relaxed text-text-secondary md:text-[0.95rem]"
            />
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
              className="h-64 w-full border-0 desk:h-[26rem]"
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
        <SectionKicker icon={Lightbulb}>Fun Facts</SectionKicker>
        <SectionHeading settings={settings} className="mt-3">
          Sedikit Tentang Kami
        </SectionHeading>
      </div>

      <div
        className={cn(
          "mt-10 grid grid-cols-2 gap-3 md:mt-12 md:gap-4",
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
              <p
                className="mt-3.5 w-full truncate text-[10px] uppercase tracking-[0.18em] text-text-secondary md:text-[11px]"
                title={fact.label}
              >
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
  "lume-field h-12 w-full rounded-full border border-border px-5 text-sm outline-none transition focus:border-accent";
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
        <SectionKicker icon={Send}>RSVP</SectionKicker>
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
  const [loadError, setLoadError] = useState("");
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
      .catch((err: unknown) => {
        if (cancelled) return;
        setWishes([]);
        setLoadError(
          err instanceof Error ? err.message : "Gagal memuat ucapan tamu.",
        );
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
        <SectionKicker icon={MessageCircleHeart}>Wishes</SectionKicker>
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
              className="lume-field mt-2 min-h-32 w-full rounded-2xl border border-border px-5 py-4 text-sm leading-relaxed outline-none transition focus:border-accent"
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
          ) : loadError ? (
            <p
              role="alert"
              className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-text-secondary"
            >
              {loadError}
            </p>
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
      <div className="grid gap-9 desk:grid-cols-12 desk:items-center desk:gap-16">
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
              className="photo-garden mx-auto aspect-[3/4] w-[min(20rem,80vw)] shadow-[0_22px_60px_rgba(84,82,77,0.14)] desk:mx-0 desk:w-full"
              sizes="(min-width: 768px) 35vw, 80vw"
            />
          </figure>
        )}

        <div
          className={cn(
            "text-center desk:col-span-7 desk:mx-0 desk:max-w-none desk:text-left",
            photoRight ? "desk:col-start-1" : "desk:col-start-6",
          )}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent md:text-[11px]">
            Thank You
          </p>
          <h2 className="mt-3 font-heading text-[clamp(1.75rem,1.2rem+2.4vw,2.5rem)] md:text-[clamp(2rem,1.2rem+2vw,3rem)] leading-[1.15] text-text-primary">
            Terima Kasih
          </h2>
          <RichText
            text={
              invitation.closing_message ||
              "Setiap ucapan dan doa kamu berikan jadi bagian indah dalam cerita kami. Kami tak sabar menyambutmu di hari spesial nanti."
            }
            className="mx-auto mt-5 max-w-xl space-y-3 text-sm leading-[1.9] text-text-secondary md:mx-0 md:text-base"
            align={invitation.custom_settings.textAlign?.closing_message}
            gap={textGapFor(invitation.custom_settings, "closing_message")}
          />

          <div className="mt-8 md:mt-9">
            <CoupleNames
              invitation={invitation}
              className="font-heading text-2xl text-text-primary desk:text-4xl"
            />
          </div>

          <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-text-secondary">
            Dengan cinta, {coupleLabel(invitation)}
          </p>

          <a
            href={wimahInstagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-accent-dark"
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            Wimah Ngundang
          </a>
        </div>
      </div>
    </Band>
  );
}

/* ─── Desktop stage (≥768px): galeri full-screen di kiri · kolom mobile di kanan ─── */
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
          sizes="(min-width: 768px) calc(100vw - clamp(400px, 32vw, 480px)), 100vw"
          className={cn("lume-stage__shot", i === active && "is-active")}
        />
      ))}

      <div className="lume-stage__veil" aria-hidden="true" />

      <div className="lume-stage__caption">
        <p className="lume-stage__kicker">Galeri</p>
        <p className="lume-stage__title">
          <CoupleNames invitation={invitation} />
        </p>
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
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

/* ─── Tombol "Buka Undangan" untuk layar pertama desktop (≥768px):
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
          ? { paddingBottom: "calc(3.5rem + env(safe-area-inset-bottom))" }
          : undefined
      }
    >
      {/* <a
        href="#greeting"
        onClick={onOpen}
        className={cn("w-full max-w-[17rem]", COVER_BUTTON_CLASS)}
      >
        <MailOpen className="h-4 w-4" aria-hidden />
        Buka Undangan
      </a> */}
    </div>
  );
}

/* ─── Mobile stage (<768px): cover full-bleed seperti sampul — latar galeri
       yang otomatis berganti (sama seperti panel desktop), nama+tanggal di atas,
       "Kepada Yth" + tombol di bawah, muat satu layar.
       Di ≥768px disembunyikan oleh CSS (desktop pakai galeri + frame HP). ─── */
function MobileStageCover({
  invitation,
  onOpen,
  exiting = false,
}: {
  invitation: Invitation;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  exiting?: boolean;
}) {
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
      className={cn(
        "lume-stage__cover relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden text-white",
        COVER_BG,
        exiting &&
          "pointer-events-none fixed inset-0 z-50 transition-all duration-700 ease-out",
        exiting && "scale-[1.04] opacity-0 blur-[20px]",
      )}
      aria-label="Sampul undangan"
      aria-hidden={exiting || undefined}
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
        <CoverBackdrop invitation={invitation} />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: COVER_VEIL }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-9 md:gap-11">
        {/* atas: kicker + nama pasangan + tanggal */}
        <CoverTop invitation={invitation} />

        {/* bawah: sapaan tamu + catatan + tombol */}
        <CoverBottom invitation={invitation} onOpen={onOpen} />
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
  // Transisi sampul → konten utama: sampul keluar dari alur dokumen (fixed)
  // lalu blur+fade, sehingga section pembuka di belakangnya tersingkap.
  const [coverExiting, setCoverExiting] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const coverTimerRef = useRef<number | null>(null);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(
    () => () => {
      if (coverTimerRef.current !== null)
        window.clearTimeout(coverTimerRef.current);
    },
    [],
  );

  // Buka kunci scroll + mulai transisi sampul. Gulir tidak diperlukan:
  // saat sampul berpindah ke position:fixed, section pembuka otomatis naik
  // ke posisi paling atas di belakangnya (opacity cover masih 1 → tidak
  // terlihat patah), lalu cover meluruh dan section itu tersingkap.
  // Masih synchronous dengan klik tamu → `MusicDock` boleh memutar lagu
  // (izin autoplay browser melekat pada gesture ini).
  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      document.documentElement.removeAttribute("data-invitation-locked");
      setOpened(true);
      dispatchInvitationOpen();
      // Cukup cegah lompatan anchor — URL sengaja tidak pernah diberi hash
      // `#greeting`, supaya setiap kunjungan (termasuk muat ulang) selalu
      // menampilkan sampul dan tamu wajib menekan "Buka Undangan".
      if (e.currentTarget.hash) e.preventDefault();
      if (coverGone) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCoverGone(true);
        return;
      }
      setCoverExiting(true);
      coverTimerRef.current = window.setTimeout(() => setCoverGone(true), 750);
    },
    [coverGone],
  );

  // Desktop (≥768px): halaman luar tidak menggulir (galeri + frame HP, isi
  // undangan ada di dalam iframe) — jadi klik tombol diteruskan ke tombol
  // "Buka Undangan" di dalam frame HP supaya undangan terbuka di sana.
  const forwardTimerRef = useRef<number | null>(null);
  const forwardTriesRef = useRef(0);

  const stopForwarding = useCallback(() => {
    if (forwardTimerRef.current !== null) {
      window.clearInterval(forwardTimerRef.current);
      forwardTimerRef.current = null;
    }
    forwardTriesRef.current = 0;
  }, []);

  useEffect(() => stopForwarding, [stopForwarding]);

  const handleDesktopOpen = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      // Selalu tandai terbuka lebih dulu. `btn` bisa null (iframe masih lazy-load
      // atau React di dalamnya belum hydrate); tanpa langkah ini klik terasa mati —
      // CTA tidak hilang dan blokir scroll tidak terbuka.
      setOpened(true);

      const frame = document.querySelector<HTMLIFrameElement>(
        "iframe.lume-stage__frame",
      );
      if (!frame) return;

      stopForwarding();
      let forwarded = false;
      const tryForward = () => {
        const btn = frame.contentDocument?.querySelector<HTMLAnchorElement>(
          'a[href="#greeting"]',
        );
        if (btn) {
          btn.click();
          forwarded = true;
          stopForwarding();
          return;
        }
        forwardTriesRef.current += 1;
        // ±10 detik: kalau sampai habis, biarkan — CTA sudah hilang.
        if (forwardTriesRef.current >= 40) stopForwarding();
      };

      tryForward();
      if (!forwarded)
        forwardTimerRef.current = window.setInterval(tryForward, 250);
    },
    [stopForwarding],
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
    if (opened) {
      root.removeAttribute("data-invitation-locked");
      return;
    }
    root.setAttribute("data-invitation-locked", "");
    // Selama terkunci, tamu harus berada tepat di sampul: buang sisa tautan
    // `#greeting` dari tautan lama dan kunci guliran ke atas — mencegah
    // lompatan anchor serta pemulihan posisi guliran saat muat ulang.
    if (window.location.hash === "#greeting") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    const pinTop = () => {
      if (window.scrollY > 0) window.scrollTo(0, 0);
    };
    pinTop();
    window.addEventListener("scroll", pinTop, { passive: true });
    // Pengaman iOS: cegah scroll sentuh selama terkunci.
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventTouch, { passive: false });
    return () => {
      root.removeAttribute("data-invitation-locked");
      window.removeEventListener("scroll", pinTop);
      document.removeEventListener("touchmove", preventTouch);
    };
  }, [gated, opened]);

  // Foto sumber untuk band berselang-seling: sampul → galeri → foto penutup.
  // Tanpa foto pun band tetap tampil (latar gelap polos dari CSS).
  const bandPhoto =
    invitation.cover_image ||
    invitation.gallery_images?.map((img) => img?.url).find(Boolean) ||
    invitation.closing_image ||
    undefined;

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
          ...(bandPhoto
            ? {
                "--band-photo": `url(${JSON.stringify(previewImageSrc(bandPhoto, 1200))})`,
              }
            : null),
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
          {!coverGone && (
            <MobileStageCover
              invitation={invitation}
              onOpen={handleOpen}
              exiting={coverExiting}
            />
          )}
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
        {!stage && !coverGone && (
          <HeroCover
            invitation={invitation}
            onOpen={handleOpen}
            exiting={coverExiting}
          />
        )}
        {/* Section pembuka di LUAR .lume-sections: ia sudah punya latar foto
            crossfade sendiri, dan penempatannya di luar membuat ritme band
            di dalam pembungkus selalu berpasangan polos → foto. */}
        <OpeningSection invitation={invitation} />
        {/* Pembungkus band berselang-seling: section genap tampil di atas foto
            blur gelap, section ganjil tetap polos di latar halaman. Section
            yang disembunyikan user menggeser pasangannya, tapi selalu
            selang-seling. */}
        <div className="lume-sections">
          <PreambleSection invitation={invitation} />
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
          <div className="invite-wrap py-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-text-secondary">
              {sections.music.visible
                ? "Terima kasih atas doa restunya"
                : "Dengan cinta"}
            </p>
          </div>
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
