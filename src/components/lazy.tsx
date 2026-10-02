"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Nilai rootMargin supaya konten mulai dimuat sedikit sebelum masuk viewport. */
const ROOT_MARGIN = "200px 0px";

/**
 * Hook: `inView` menjadi true sekali elemen (ref) mendekati viewport, lalu tidak
 * pernah kembali false. Dipakai untuk menunda fetch / mount konten berat.
 */
export function useInViewOnce<T extends HTMLElement>(rootMargin: string = ROOT_MARGIN) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView } as const;
}

/**
 * Iframe yang hanya mulai memuat setelah mendekati viewport (IntersectionObserver).
 * `loading="lazy"` natif saja tidak cukup untuk katalog homepage — sembilan iframe
 * preview tetap membuka sembilan request sekaligus. Komponen ini menunda *penempatan*
 * iframe sampai benar-benar dibutuhkan, lalu mendelegasikan pemuatan ke browser.
 *
 * `className` / `style` dipindahkan ke elemen pembungkus supaya layout (absolute,
 * aspect-ratio, transform skala, dsb.) tetap berperilaku sama seperti iframe langsung.
 */
export function LazyFrame({
  src,
  title,
  className,
  style,
  rootMargin = ROOT_MARGIN,
  tabIndex,
  sandbox,
  referrerPolicy,
  allow,
  allowFullScreen,
  onLoad,
  fallbackClassName,
}: {
  src: string;
  title: string;
  className?: string;
  style?: CSSProperties;
  rootMargin?: string;
  tabIndex?: number;
  sandbox?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  allow?: string;
  allowFullScreen?: boolean;
  onLoad?: () => void;
  fallbackClassName?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(rootMargin);

  return (
    <div ref={ref} className={className} style={style}>
      {inView ? (
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
          tabIndex={tabIndex}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          allow={allow}
          allowFullScreen={allowFullScreen}
          onLoad={onLoad}
        />
      ) : (
        <div aria-hidden className={cn("h-full w-full animate-pulse bg-black/5", fallbackClassName)} />
      )}
    </div>
  );
}

/**
 * Menunda render subtree yang berat sampai mendekati viewport.
 * Children tidak di-mount (tidak fetch apa pun) sebelum dibutuhkan;
 * `fallback` menjaga layout tetap stabil.
 */
export function LazyMount({
  children,
  fallback,
  className,
  rootMargin = ROOT_MARGIN,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(rootMargin);

  return (
    <div ref={ref} className={className}>
      {inView ? children : fallback}
    </div>
  );
}
