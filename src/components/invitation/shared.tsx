"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  alignClass,
  headingClass,
  objectPosition,
  paragraphClass,
  spacingClass,
  type Invitation,
  type SectionSettings,
} from "@/lib/invitation";
import { formatDate } from "@/lib/utils";

export function InvitationPhoto({
  src,
  alt,
  className,
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
  positionX?: number;
  positionY?: number;
  zoom?: number;
  rotate?: number;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
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
    <section className={cn("relative px-6", spacingClass(settings.sectionSpacing), className)}>
      <div className={cn("mx-auto flex max-w-5xl flex-col gap-4", alignClass(settings.align))}>
        {children}
      </div>
    </section>
  );
}

export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">{children}</p>
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
    <h2 className={cn("font-heading font-normal leading-[1.1]", headingClass(settings.headingSize), className)}>
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
    <p className={cn("max-w-2xl text-text-secondary leading-relaxed", paragraphClass(settings.paragraphSize), className)}>
      {children}
    </p>
  );
}

export function CoupleNames({ invitation, className }: { invitation: Invitation; className?: string }) {
  const bride = invitation.bride_nickname || invitation.bride_name || "Bride";
  const groom = invitation.groom_nickname || invitation.groom_name || "Groom";
  return (
    <span className={className}>
      {bride} <span className="font-elegant italic text-accent-light">&</span> {groom}
    </span>
  );
}

export function EventMeta({ invitation }: { invitation: Invitation }) {
  return (
    <div className="space-y-1 text-text-secondary">
      {invitation.event_date && <p>{formatDate(invitation.event_date)}</p>}
      {invitation.event_time && <p>{invitation.event_time}</p>}
      {invitation.venue_name && <p className="text-text-primary">{invitation.venue_name}</p>}
      {invitation.venue_address && <p>{invitation.venue_address}</p>}
    </div>
  );
}

export function GiftList({ invitation }: { invitation: Invitation }) {
  if (!invitation.gift_accounts.length) return null;
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {invitation.gift_accounts.map((gift) => (
        <article key={gift.id} className="rounded-3xl border border-border bg-surface/80 p-5 text-left">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">{gift.bank}</p>
          <p className="mt-2 font-heading text-xl">{gift.accountNumber}</p>
          <p className="mt-1 text-sm text-text-secondary">{gift.accountName}</p>
        </article>
      ))}
    </div>
  );
}

export function MapsButton({ invitation }: { invitation: Invitation }) {
  if (!invitation.google_maps_url) return null;
  return (
    <a
      href={invitation.google_maps_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-light"
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

export function MusicDock({ url }: { url: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-full border border-border bg-glass/95 px-4 py-2 shadow-[0_12px_40px_rgba(84,82,77,0.12)] backdrop-blur">
      <audio controls src={url} className="w-full h-8" preload="none" aria-label="Musik undangan" />
    </div>
  );
}

export function CountdownTimer({ eventDate }: { eventDate?: string | null }) {
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
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center rounded-2xl border border-border bg-background/60 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
        >
          <span className="font-heading text-3xl tabular-nums text-text-primary sm:text-4xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
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
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-black", className)}>
      <video
        controls
        preload="none"
        poster={poster ?? undefined}
        src={url}
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent",
        className,
      )}
    >
      {copied ? (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Tersalin
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Salin
        </>
      )}
    </button>
  );
}

export function DecorativeDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2", className)}>
      <span className="h-px w-12 bg-accent/30" />
      <svg className="h-4 w-4 text-accent/50" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6.4-4.8-6.4 4.8 2.4-7.4-6-4.6h7.6z" />
      </svg>
      <span className="h-px w-12 bg-accent/30" />
    </div>
  );
}

export function GuestWishesList({ wishes }: { wishes: Array<{ name: string; message: string; created_at: string }> }) {
  if (!wishes.length) return null;
  return (
    <div className="grid gap-3">
      {wishes.map((wish, i) => (
        <article
          key={i}
          className="rounded-2xl border border-border bg-surface/60 p-4 text-left backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
              {wish.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">{wish.name}</p>
              <p className="text-[10px] text-text-secondary">{formatDate(wish.created_at)}</p>
            </div>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{wish.message}</p>
        </article>
      ))}
    </div>
  );
}
