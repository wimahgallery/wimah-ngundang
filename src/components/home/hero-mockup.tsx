"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { animated, useInView, useSpring } from "@react-spring/web";
import { MapPin, Music4 } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { heroFeaturedTemplates, templateShowcase } from "@/lib/homepage-content";
import { springSnappy } from "@/components/motion/springs";
import { Reveal } from "@/components/motion/reveal";
import { DeviceFrame } from "./device-frame";
import { previewMockups } from "./previews/registry";
import { cn } from "@/lib/utils";

const AUTO_PLAY_INTERVAL = 6500;

/**
 * Mockup undangan di dalam frame device dengan template yang berganti otomatis.
 * Auto-play hanya berjalan saat mockup terlihat di viewport dan berhenti ketika
 * pengunjung berinteraksi (hover / pilih template).
 */
export function HeroMockup() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const intersection = useMemo(() => ({ once: false, amount: 0.3 }), []);
  const [ref, inView] = useInView(intersection);

  useEffect(() => {
    if (!inView || paused || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % heroFeaturedTemplates.length),
      AUTO_PLAY_INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [inView, paused, reducedMotion]);

  const activeId = heroFeaturedTemplates[index];
  const item = templateShowcase.find((entry) => entry.id === activeId) ?? templateShowcase[0];
  const Mockup = previewMockups[item.id];

  const theme = {
    "--tpl-screen": item.palette.screen,
    "--tpl-ink": item.palette.ink,
    "--tpl-soft": item.palette.soft,
    "--tpl-accent": item.palette.accent,
  } as CSSProperties;

  const chip = useSpring({
    from: { opacity: 0, y: 10 },
    to: { opacity: 1, y: 0 },
    delay: 420,
    immediate: reducedMotion,
    config: springSnappy,
  });

  return (
    <div ref={ref} style={theme} className="flex w-full flex-col items-center gap-6">
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <DeviceFrame
          size="md"
          className="w-[min(268px,68vw)]"
          screenClassName="aspect-auto h-[520px] sm:h-[560px]"
        >
          <div key={item.id} className="h-full w-full">
            <Mockup play active={false} />
          </div>
        </DeviceFrame>

        <Reveal
          delay={700}
          direction="left"
          className="pointer-events-none absolute -left-12 top-24 hidden sm:block"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-glass-border bg-glass/90 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(84,82,77,0.14)] backdrop-blur">
            <Music4 className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] text-text-primary">Musik latar aktif</span>
          </div>
        </Reveal>

        <Reveal
          delay={880}
          direction="right"
          className="pointer-events-none absolute -right-10 bottom-32 hidden sm:block"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-glass-border bg-glass/90 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(84,82,77,0.14)] backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] text-text-primary">Peta lokasi tamu</span>
          </div>
        </Reveal>
      </div>

      <animated.div style={chip} className="flex flex-wrap items-center justify-center gap-2">
        {heroFeaturedTemplates.map((id, chipIndex) => {
          const meta = templateShowcase.find((entry) => entry.id === id);
          if (!meta) return null;
          const isActive = chipIndex === index;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setIndex(chipIndex);
                setPaused(true);
              }}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors duration-300",
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-text-secondary hover:border-accent/40 hover:text-accent",
              )}
            >
              {meta.name}
            </button>
          );
        })}
      </animated.div>
    </div>
  );
}
