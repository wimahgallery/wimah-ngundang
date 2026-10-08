"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  alignClass,
  eventTargetTime,
  headingClass,
  objectPosition,
  paragraphClass,
  spacingClass,
  type Invitation,
  type SectionSettings,
} from "@/lib/invitation";
import { formatDate, previewImageSrc, proxiedMediaSrc, safeHttpUrl } from "@/lib/utils";

export function InvitationPhoto({
  src,
  alt,
  className,
  style,
  positionX = 50,
  positionY = 50,
  zoom = 100,
  rotate = 0,
  sizes = "100vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  rotate?: number;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)} style={style}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={{
            objectPosition: objectPosition(positionX, positionY),
            transform: `scale(${zoom / 100}) rotate(${rotate}deg)`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-secondary" />
      )}
    </div>
  );
}

export function SectionShell({
  settings,
  className,
  children,
}: {
  settings: SectionSettings;
  className?: string;
  children: React.ReactNode;
}) {
  if (!settings.visible) return null;
  return (
    <section
      className={cn(
        "relative px-6",
        spacingClass(settings.sectionSpacing),
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col gap-4",
          alignClass(settings.align),
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="dna-kicker text-[11px] font-medium uppercase tracking-[clamp(0.1em,0.06rem+0.3vw,0.2em)] text-accent-dark">
      {children}
    </p>
  );
}

export function SectionHeading({
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
        "font-heading font-normal leading-[1.1]",
        headingClass(settings.headingSize),
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionCopy({
  settings,
  className,
  children,
}: {
  settings: SectionSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "max-w-2xl text-text-secondary leading-relaxed",
        paragraphClass(settings.paragraphSize),
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CoupleNames({
  invitation,
  className,
}: {
  invitation: Invitation;
  className?: string;
}) {
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  return (
    <span className={className}>
      {groom} <span className="font-accent italic text-accent-light">&</span>{" "}
      {bride}
    </span>
  );
}

export function EventMeta({ invitation }: { invitation: Invitation }) {
  return (
    <div className="space-y-1 text-text-secondary">
      {invitation.event_date && <p>{formatDate(invitation.event_date)}</p>}
      {invitation.event_time && <p>{invitation.event_time}</p>}
      {invitation.venue_name && (
        <p className="text-text-primary">{invitation.venue_name}</p>
      )}
      {invitation.venue_address && <p>{invitation.venue_address}</p>}
    </div>
  );
}

export function GiftList({ invitation }: { invitation: Invitation }) {
  if (!invitation.gift_accounts.length) return null;
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {invitation.gift_accounts.map((gift) => (
        <article
          key={gift.id}
          className="dna-card rounded-xl border border-border bg-surface/80 p-5 text-left"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-accent">
            {gift.bank}
          </p>
          <p className="mt-2 font-heading text-xl">{gift.accountNumber}</p>
          <p className="mt-1 text-sm text-text-secondary">{gift.accountName}</p>
        </article>
      ))}
    </div>
  );
}

export function MapsButton({ invitation }: { invitation: Invitation }) {
  const href = safeHttpUrl(invitation.google_maps_url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-light active:scale-[0.97]"
    >
      Buka di Google Maps
    </a>
  );
}

export function StoryParagraphs({ content }: { content?: string | null }) {
  if (!content) return null;
  return (
    <div className="space-y-4">
      {content
        .split(/\n\n+/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-text-secondary leading-relaxed">
            {p}
          </p>
        ))}
    </div>
  );
}

/**
 * Dipanggil oleh tombol "Buka Undangan". Klik itulah yang memberi izin autoplay
 * ke browser, jadi listener di dokumen yang sama (termasuk di dalam iframe
 * desktop) menjalankan `audio.play()` masih di dalam gelombang gesture.
 */
export const INVITATION_OPEN_EVENT = "invitation:open";

export function dispatchInvitationOpen() {
  document.dispatchEvent(new CustomEvent(INVITATION_OPEN_EVENT));
}

export function MusicDock({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  /** True saat layar masih terkunci (sampul "Buka Undangan") — tombol melayang
   *  disembunyikan supaya tidak menutupi tombol buka undangan. */
  const [locked, setLocked] = useState(true);
  /** True setelah audio benar-benar pernah berbunyi — dipakai supaya lagu yang
   *  sengaja dijeda tamu tidak "hidup lagi" saat klik CTA kedua kali. */
  const startedRef = useRef(false);
  /** True bila URL asli gagal dimuat dan sudah dialihkan ke proxy `/api/media`
   *  — dipakai saat jaringan memblokir host CDN supaya lagu tetap bisa diputar. */
  const [proxyFallback, setProxyFallback] = useState(false);
  /** True selama pemutaran diminta (CTA/tombol) — dipakai untuk melanjutkan
   *  pemutaran setelah `src` berganti akibat fallback. */
  const wantPlayRef = useRef(false);
  // Sinkronkan state turunan saat prop `url` berpindah (pola "adjust during render").
  const [prevUrl, setPrevUrl] = useState(url);
  if (prevUrl !== url) {
    setPrevUrl(url);
    setProxyFallback(false);
  }
  const src = proxyFallback ? proxiedMediaSrc(url) : url;

  useEffect(() => {
    startedRef.current = false;
    wantPlayRef.current = false;
  }, [url]);

  // `src` dipasang secara imperatif, bukan lewat JSX: <audio> lalu ikut ter-SSR
  // tanpa URL, sehingga request (dan kegagalannya) baru dimulai setelah listener
  // `onError` React terpasang — fallback tidak lagi meleset saat jaringan
  // membajak host CDN sebelum hydrate.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audio.getAttribute("src") === src) return;
    audio.src = src;
  }, [src]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.volume = 0.5;
    wantPlayRef.current = true;
    void audio.play().then(
      () => {
        startedRef.current = true;
      },
      () => {
        // Autoplay ditolak (mis. tanpa gesture) — tombol dock tetap menawarkan
        // "Putar musik undangan", jadi tamu bisa nyalakan manual.
      },
    );
  }, []);

  // URL asli gagal dimuat (diblokir jaringan) → coba lewat proxy sekali.
  const handleError = useCallback(() => {
    const proxied = proxiedMediaSrc(url);
    if (!proxyFallback && proxied !== url) {
      setProxyFallback(true);
      return;
    }
    wantPlayRef.current = false;
    setPlaying(false);
  }, [proxyFallback, url]);

  // Setelah src berganti karena fallback, lanjutkan pemutaran yang diminta.
  useEffect(() => {
    if (!wantPlayRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().then(
      () => {
        startedRef.current = true;
      },
      () => {},
    );
  }, [src]);

  /** Auto-start dari CTA "Buka Undangan": hanya sekali, supaya lagu yang sudah
   *  sengaja dijeda tamu tidak kembali hidup saat CTA diklik lagi. */
  const start = useCallback(() => {
    if (startedRef.current) return;
    play();
  }, [play]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5;
    document.addEventListener(INVITATION_OPEN_EVENT, start);
    return () => document.removeEventListener(INVITATION_OPEN_EVENT, start);
  }, [start]);

  // Pantau kunci scroll: tombol muncul begitu undangan dibuka (klik CTA,
  // langsung dari URL ber-hash, atau halaman preview tanpa kunci).
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setLocked(root.hasAttribute("data-invitation-locked"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-invitation-locked"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else {
      wantPlayRef.current = false;
      audio.pause();
    }
  };

  return (
    <div
      className={cn(
        "music-dock fixed right-4 z-40 transition duration-300 motion-reduce:transition-none sm:right-6",
        locked
          ? "pointer-events-none translate-y-3 opacity-0"
          : "translate-y-0 opacity-100",
      )}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        aria-label="Musik undangan"
        onError={handleError}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Jeda musik undangan" : "Putar musik undangan"}
        title={playing ? "Jeda musik" : "Putar musik"}
        className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-glass/95 shadow-[0_12px_40px_rgba(84,82,77,0.18)] backdrop-blur transition hover:bg-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 sm:h-14 sm:w-14"
      >
        {playing && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-accent/25 motion-reduce:animate-none"
          />
        )}
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-background sm:h-10 sm:w-10">
          {playing ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
          )}
        </span>
      </button>
    </div>
  );
}

export function CountdownTimer({
  eventDate,
  eventTime,
}: {
  eventDate?: string | null;
  eventTime?: string | null;
}) {
  const target = eventTargetTime(eventDate, eventTime);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  // Acara sudah lewat: jangan menampilkan "00 Hari 00 Detik" selamanya.
  const [passed, setPassed] = useState(
    () => target !== null && Date.now() >= target,
  );

  useEffect(() => {
    if (target === null) return;
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setPassed(target - now <= 0);
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
  }, [target]);

  if (target === null) return null;

  if (passed) {
    return (
      <div className="grid place-items-center rounded-2xl border border-accent/30 bg-background/70 px-6 py-10 backdrop-blur-sm">
        <p className="font-heading text-2xl leading-tight text-text-primary sm:text-3xl">
          Hari Bahagia Telah Tiba
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Terima kasih atas doa dan restunya.
        </p>
      </div>
    );
  }

  const units = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-0 flex-col items-center rounded-lg border border-border bg-background/60 px-2 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
        >
          <span className="font-heading text-[clamp(1.375rem,5vw,2.25rem)] tabular-nums text-text-primary sm:text-4xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-text-secondary sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Deteksi YouTube / Vimeo supaya link video bisa langsung di-embed. */
export function videoEmbedUrl(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function VideoPlayer({
  url,
  poster,
  className,
}: {
  url?: string | null;
  poster?: string | null;
  className?: string;
}) {
  if (!url) return null;

  const embed = videoEmbedUrl(url);
  // Hanya URL file video yang boleh masuk ke <video> — URL halaman web biasa
  // (tautan Google Drive, youtube.com/live, playlist) tidak akan pernah bisa
  // diputar dan menghasilkan player hitam.
  const directMedia = /\.(mp4|webm|ogg|ogv|m4v|mov|m3u8)([?#].*)?$/i.test(url);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-black",
        className,
      )}
    >
      {embed ? (
        <iframe
          src={embed}
          title="Video undangan"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
      ) : directMedia ? (
        <video
          controls
          preload="none"
          poster={poster ? previewImageSrc(poster) : undefined}
          src={url}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="grid aspect-video w-full place-items-center bg-surface p-6 text-center">
          <div>
            <p className="text-sm text-text-secondary">
              Video tidak bisa diputar langsung di sini.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background/70 px-5 text-sm font-medium text-text-primary transition hover:border-accent/50 hover:text-accent"
            >
              Buka video di tab baru
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const showResult = useCallback((ok: boolean) => {
    setCopied(ok);
    setFailed(!ok);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  }, []);

  const handleCopy = useCallback(() => {
    // Fallback untuk origin non-HTTPS / browser lama / iframe (iOS sering
    // menolak clipboard-write) — tanpa ini tombol diam-diam tidak berfungsi.
    const legacyCopy = () => {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.top = "0";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, el.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        showResult(ok);
      } catch {
        showResult(false);
      }
    };

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showResult(true), legacyCopy);
    } else {
      legacyCopy();
    }
  }, [text, showResult]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent",
        failed &&
          "border-red-300 text-red-600 hover:border-red-400 hover:text-red-700",
        className,
      )}
    >
      {copied ? (
        <>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Tersalin
        </>
      ) : failed ? (
        <>
          <svg
            className="h-3 w-3"
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
          Gagal — salin manual
        </>
      ) : (
        <>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
          Salin
        </>
      )}
    </button>
  );
}

export function GuestWishesList({
  wishes,
}: {
  wishes: Array<{ name: string; message: string; created_at: string }>;
}) {
  if (!wishes.length) return null;
  return (
    <div className="grid gap-3">
      {wishes.map((wish, i) => (
        <article
          key={i}
          className="dna-card rounded-lg border border-border bg-surface/60 p-4 text-left backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
              {wish.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {wish.name}
              </p>
              <p className="text-[10px] text-text-secondary">
                {formatDate(wish.created_at)}
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
            {wish.message}
          </p>
        </article>
      ))}
    </div>
  );
}
