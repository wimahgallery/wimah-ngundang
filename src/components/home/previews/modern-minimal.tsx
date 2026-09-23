"use client";

import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { previewImages } from "@/lib/homepage-content";
import { durationCinematic, durationEase } from "@/components/motion/springs";
import {
  MockGrain,
  MockKicker,
  MockMeta,
  MockName,
  MockPhoto,
  MockScreen,
  type PreviewMotionProps,
} from "./shared";

export default function ModernMinimalPreview({ play, active }: PreviewMotionProps) {
  const reducedMotion = usePrefersReducedMotion();

  const reveal = useSpring({
    from: { opacity: 0 },
    to: play ? { opacity: 1 } : { opacity: 0 },
    immediate: reducedMotion,
    config: durationCinematic(1200),
  });

  const drift = useSpring({
    from: { y: 0 },
    to: { y: active ? -6 : 0 },
    immediate: reducedMotion,
    config: { tension: 60, friction: 26 },
  });

  const rule = useSpring({
    from: { width: 0 },
    to: play ? { width: 40 } : { width: 0 },
    delay: play ? 400 : 0,
    immediate: reducedMotion,
    config: durationEase(800),
  });

  return (
    <MockScreen>
      <animated.div style={reveal} className="absolute inset-0">
        <animated.div style={drift} className="absolute -inset-y-5 inset-x-0">
          <MockPhoto
            src={previewImages.cover}
            alt="Preview template Modern Minimal"
            className="h-full w-full"
          />
        </animated.div>
      </animated.div>
      <span className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[var(--tpl-screen)]" />
      <MockGrain />
      <animated.div style={reveal} className="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-6 text-center">
        <MockKicker className="text-[var(--tpl-ink)]/60">Modern</MockKicker>
        <MockName className="mt-2">Rina &amp; Budi</MockName>
        <animated.span style={rule} className="mt-3 block h-px bg-[var(--tpl-accent)]" />
        <MockMeta className="mt-3">15 Agustus 2026 — Nusa Dua, Bali</MockMeta>
      </animated.div>
    </MockScreen>
  );
}
