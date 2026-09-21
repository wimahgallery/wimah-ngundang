"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { animated, useInView, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import type { TemplateShowcaseItem } from "@/lib/homepage-content";
import { springSmooth, springSnappy } from "@/components/motion/springs";
import { previewMockups } from "./previews/registry";

export function TemplateCard({
  item,
  index,
  onPreview,
}: {
  item: TemplateShowcaseItem;
  index: number;
  onPreview: (item: TemplateShowcaseItem) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(false);
  const intersection = useMemo(
    () => ({ once: true, amount: 0.15, rootMargin: "0px 0px -8% 0px" }),
    [],
  );
  const [ref, inView] = useInView(intersection);
  const Mockup = previewMockups[item.id];

  const entrance = useSpring({
    from: { opacity: 0, y: 28 },
    to: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    delay: inView ? (index % 4) * 90 : 0,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const lift = useSpring({
    from: { y: 0, scale: 1 },
    to: { y: active ? -6 : 0, scale: active ? 1.015 : 1 },
    immediate: reducedMotion,
    config: springSnappy,
  });

  const overlayOpacity = useSpring({
    from: { opacity: 0 },
    to: { opacity: active ? 1 : 0 },
    immediate: reducedMotion,
    config: springSmooth,
  });

  const themeStyle = {
    "--tpl-screen": item.palette.screen,
    "--tpl-ink": item.palette.ink,
    "--tpl-soft": item.palette.soft,
    "--tpl-accent": item.palette.accent,
  } as CSSProperties;

  const handlePreview = useCallback(() => onPreview(item), [item, onPreview]);

  return (
    <div style={themeStyle} className="h-full">
      <animated.div ref={ref} style={entrance} className="h-full">
        <animated.div
          style={lift}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          onTouchStart={() => setActive(true)}
          className="group @container flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_8px_30px_rgba(84,82,77,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(84,82,77,0.12)]"
        >
          {/* ── Mockup Area ── */}
          <button
            type="button"
            onClick={handlePreview}
            aria-label={`Lihat preview template ${item.name}`}
            className="relative block aspect-[3/4] w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <Mockup play={inView} active={active} />

            {/* overlays */}
            <span className="pointer-events-none absolute inset-0 z-[1] bg-black/5" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[60%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* top badges */}
            <div className="pointer-events-none absolute left-2 top-2 z-[3] flex items-center gap-1.5 @sm:left-3 @sm:top-3">
              {item.isPopular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-black backdrop-blur-sm @sm:px-2.5 @sm:py-0.5 @sm:text-[8px]">
                  <svg className="h-2 w-2 @sm:h-2.5 @sm:w-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Populer
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-black/40 px-1.5 py-0.5 text-[7px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-md @sm:px-2 @sm:py-0.5 @sm:text-[8px]">
                {item.bestFor}
              </span>
            </div>
            <span className="pointer-events-none absolute right-2 top-2 z-[3] inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[7px] text-white/80 backdrop-blur-md @sm:right-3 @sm:top-3 @sm:h-5.5 @sm:w-5.5 @sm:text-[8px]">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* bottom text */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex flex-col gap-0.5 p-2.5 @sm:gap-1 @sm:p-3">
              <span className="font-heading text-sm leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] @sm:text-base">
                {item.name}
              </span>
              <span className="line-clamp-2 text-[7px] leading-snug text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] @sm:text-[9px] @sm:leading-relaxed">
                {item.tagline}
              </span>
            </span>

            {/* hover: show features overlay */}
            <animated.div
              style={overlayOpacity}
              className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            >
              <span className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-medium text-black shadow-lg @sm:text-xs">
                Lihat Preview →
              </span>
            </animated.div>
          </button>

          {/* ── Info Bar ── */}
          <div className="flex flex-col gap-2 border-t border-border px-2.5 py-2 @sm:gap-2.5 @sm:px-3 @sm:py-2.5">
            {/* color palette + section count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[item.palette.accent, item.palette.soft, item.palette.ink, item.palette.screen].map(
                  (color, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-full border border-black/10 shadow-sm @sm:h-3.5 @sm:w-3.5"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                  ),
                )}
              </div>
              <span className="text-[7px] tabular-nums text-text-secondary @sm:text-[8px]">
                {item.sectionCount} section
              </span>
            </div>

            {/* feature tags */}
            <div className="flex flex-wrap gap-1">
              {item.features.slice(0, 4).map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-surface-secondary/60 px-1.5 py-0.5 text-[6px] font-medium uppercase tracking-[0.08em] text-text-secondary @sm:px-2 @sm:text-[7px]"
                >
                  {f}
                </span>
              ))}
              {item.features.length > 4 && (
                <span className="rounded-full bg-surface-secondary/60 px-1.5 py-0.5 text-[6px] font-medium text-text-secondary @sm:px-2 @sm:text-[7px]">
                  +{item.features.length - 4}
                </span>
              )}
            </div>

            {/* motion + CTA */}
            <div className="flex items-center justify-between">
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[6px] font-medium text-primary @sm:px-2 @sm:text-[7px]">
                {item.motion}
              </span>
              <button
                type="button"
                onClick={handlePreview}
                className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[7px] font-medium text-background transition-all duration-300 hover:bg-accent-dark hover:shadow-md active:scale-[0.97] @sm:px-3 @sm:py-1.5 @sm:text-[8px]"
              >
                Preview →
              </button>
            </div>
          </div>
        </animated.div>
      </animated.div>
    </div>
  );
}
