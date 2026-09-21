"use client";

import { useCallback, useMemo, useState } from "react";
import { animated, easings, useInView, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { ArrowUpRight, Eye } from "lucide-react";
import { sampleInvitations, templateShowcase } from "@/lib/homepage-content";
import { PreviewModal, type PreviewModalData } from "./preview-modal";
import { DeviceFrame } from "./device-frame";
import { TabletFrame } from "./tablet-frame";
import { DesktopFrame } from "./desktop-frame";
import { SectionIntro } from "./section-intro";
import { Reveal } from "@/components/motion/reveal";

const SCROLL_DISTANCE = 150;

function DeviceShowcase({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const sample = sampleInvitations[0];
  const meta = templateShowcase.find((item) => item.id === sample.id);
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInView({ once: false, amount: 0.35 });

  const scroll = useSpring({
    from: { y: 0 },
    to: inView ? { y: -SCROLL_DISTANCE } : { y: 0 },
    loop: inView && !reducedMotion ? { reverse: true } : false,
    immediate: reducedMotion,
    config: { duration: 14000, easing: easings.easeInOutCubic },
  });

  const iframe = (
    <iframe
      src={`/preview/${sample.id}`}
      title={`Preview template ${meta?.name}`}
      loading="lazy"
      className="h-full w-full border-0"
    />
  );

  return (
    <div className="flex flex-col items-center">
      {/* ── MOBILE: phone frame ── */}
      <div className="block md:hidden">
        <button
          type="button"
          ref={ref}
          onClick={onOpen}
          aria-label={`Lihat contoh undangan ${meta?.name}`}
          className="group relative rounded-[44px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <DeviceFrame
            size="md"
            className="w-[min(260px,72vw)]"
            screenClassName="aspect-auto h-[460px]"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{ height: `calc(100% + ${SCROLL_DISTANCE}px)` }}
            >
              <animated.div style={{ y: scroll.y }} className="h-full w-full">
                {iframe}
              </animated.div>
            </div>
          </DeviceFrame>

          <span className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#3F3E3A] opacity-0 shadow-[0_10px_24px_rgba(84,82,77,0.18)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Eye className="h-3 w-3" />
              Lihat preview
            </span>
          </span>
        </button>
      </div>

      {/* ── TABLET: tablet frame ── */}
      <div className="hidden md:block lg:hidden">
        <button
          type="button"
          ref={inView ? undefined : ref}
          onClick={onOpen}
          aria-label={`Lihat contoh undangan ${meta?.name}`}
          className="group relative rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <TabletFrame className="w-[min(380px,55vw)]" screenClassName="h-[500px]">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{ height: `calc(100% + ${SCROLL_DISTANCE}px)` }}
            >
              <animated.div style={{ y: scroll.y }} className="h-full w-full">
                {iframe}
              </animated.div>
            </div>
          </TabletFrame>

          <span className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#3F3E3A] opacity-0 shadow-[0_10px_24px_rgba(84,82,77,0.18)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Eye className="h-3 w-3" />
              Lihat preview
            </span>
          </span>
        </button>
      </div>

      {/* ── DESKTOP: laptop frame ── */}
      <div className="hidden lg:block">
        <button
          type="button"
          ref={inView ? undefined : ref}
          onClick={onOpen}
          aria-label={`Lihat contoh undangan ${meta?.name}`}
          className="group relative outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <DesktopFrame className="w-[min(520px,42vw)]" screenClassName="h-auto">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{ height: `calc(100% + ${SCROLL_DISTANCE}px)` }}
            >
              <animated.div style={{ y: scroll.y }} className="h-full w-full">
                {iframe}
              </animated.div>
            </div>
          </DesktopFrame>

          <span className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#3F3E3A] opacity-0 shadow-[0_10px_24px_rgba(84,82,77,0.18)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Eye className="h-3 w-3" />
              Lihat preview
            </span>
          </span>
        </button>
      </div>

      {/* ── Info ── */}
      <div className="mt-6 max-w-[280px] text-center">
        <p className="font-heading text-lg text-text-primary">{meta?.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{sample.caption}</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-accent">
          {sample.date} · {sample.venue}
        </p>
      </div>
    </div>
  );
}

export function HomeInvitationPreview() {
  const [selected, setSelected] = useState<PreviewModalData | null>(null);
  const handleClose = useCallback(() => setSelected(null), []);

  const modalData: PreviewModalData | null = useMemo(() => {
    if (!selected) return null;
    const sample = sampleInvitations[0];
    const meta = templateShowcase.find((item) => item.id === sample.id);
    return {
      id: sample.id,
      name: meta?.name ?? sample.name,
      motion: meta?.motion ?? "",
      tagline: meta?.tagline ?? sample.caption,
      bestFor: meta?.bestFor ?? "",
    };
  }, [selected]);

  const handleOpen = useCallback(() => {
    const sample = sampleInvitations[0];
    const meta = templateShowcase.find((item) => item.id === sample.id);
    setSelected({
      id: sample.id,
      name: meta?.name ?? sample.name,
      motion: meta?.motion ?? "",
      tagline: meta?.tagline ?? sample.caption,
      bestFor: meta?.bestFor ?? "",
    });
  }, []);

  return (
    <section id="contoh" className="scroll-mt-24 bg-surface/50 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          kicker="Preview Undangan"
          title="Lihat sendiri bagaimana tamu membuka undangan"
          description="Ini tampilan asli undangan saat dibuka dari perangkat tamu — lengkap dengan gerak, foto, dan informasi acara."
        />

        <Reveal delay={80} className="mt-12">
          <DeviceShowcase onOpen={handleOpen} />
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02]"
            >
              Buka preview penuh
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-text-secondary">
              Preview ditampilkan langsung dari halaman undangan asli, bukan gambar statis.
            </p>
          </div>
        </Reveal>
      </div>

      <PreviewModal data={modalData} onClose={handleClose} />
    </section>
  );
}
