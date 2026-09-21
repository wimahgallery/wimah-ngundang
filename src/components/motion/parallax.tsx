"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";

export interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Total pergeseran (px) dari atas ke bawah viewport. Kecil saja: 16–32. */
  strength?: number;
}

/**
 * Parallax sangat halus berbasis scroll.
 *
 * - Hanya menghitung saat elemen mendekati viewport (IntersectionObserver).
 * - Update di-throttle lewat requestAnimationFrame, listener pasif.
 * - Hanya mengubah transform (translateY) sehingga aman untuk mobile.
 * - Otomatis nonaktif saat pengguna memilih reduced motion.
 */
export function Parallax({ children, className, strength = 24 }: ParallaxProps) {
  const reducedMotion = usePrefersReducedMotion();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [styles, api] = useSpring(() => ({
    y: 0,
    config: { tension: 120, friction: 30 },
  }));

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || reducedMotion) {
      api.set({ y: 0 });
      return;
    }

    const isCompact = window.matchMedia("(max-width: 767px)").matches;
    const effectiveStrength = isCompact ? strength * 0.6 : strength;
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = nodeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport + rect.height);
      api.start({ y: progress * effectiveStrength * -1.6 });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          update();
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "30% 0px 30% 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [api, reducedMotion, strength]);

  return (
    <animated.div ref={nodeRef} style={styles} className={className}>
      {children}
    </animated.div>
  );
}
