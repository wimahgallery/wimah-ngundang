"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kontrak untuk semua mockup preview template.
 *
 * `play`  → true ketika kartu masuk viewport (lazy animation trigger).
 * `active` → true ketika kartu di-hover / di-focus / di-tap.
 *
 * Warna diambil dari CSS variable yang dipasang oleh kartu:
 * --tpl-screen, --tpl-ink, --tpl-soft, --tpl-accent.
 */
export interface PreviewMotionProps {
  play: boolean;
  active: boolean;
}

export function MockScreen({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[var(--tpl-screen)] text-[var(--tpl-ink)]",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function MockPhoto({
  src,
  alt,
  className,
  position = "50% 45%",
  sizes = "(max-width: 640px) 60vw, 360px",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

export function MockKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[8px] font-medium uppercase leading-none tracking-[0.3em]", className)}>
      {children}
    </p>
  );
}

export function MockName({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-heading text-[21px] leading-[1.08] tracking-tight", className)}>
      {children}
    </p>
  );
}

export function MockMeta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[9px] leading-relaxed opacity-75", className)}>{children}</p>;
}

export function MockRule({ className }: { className?: string }) {
  return <span className={cn("block h-px w-10 bg-[var(--tpl-accent)]", className)} />;
}

export function MockPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--tpl-accent)] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.16em] text-[var(--tpl-screen)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Butiran halus supaya mockup terasa seperti produk jadi, bukan flat demo. */
export function MockGrain({ className }: { className?: string }) {
  return <span className={cn("texture-noise pointer-events-none absolute inset-0", className)} />;
}
