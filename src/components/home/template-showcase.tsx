"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { templateShowcase, type TemplateShowcaseItem } from "@/lib/homepage-content";
import { PreviewModal, type PreviewModalData } from "./preview-modal";
import { SectionIntro } from "./section-intro";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TemplateShowcase() {
  const [selected, setSelected] = useState<TemplateShowcaseItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const item = templateShowcase[activeIndex];

  const handlePreview = useCallback(() => setSelected(item), [item]);
  const handleClose = useCallback(() => setSelected(null), []);
  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % templateShowcase.length), []);
  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + templateShowcase.length) % templateShowcase.length), []);

  const modalData: PreviewModalData | null = useMemo(
    () =>
      selected
        ? {
            id: selected.id,
            name: selected.name,
            motion: selected.motion,
            tagline: selected.tagline,
            bestFor: selected.bestFor,
          }
        : null,
    [selected],
  );

  if (!item) return null;

  return (
    <section id="template" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          kicker="Template Premium"
          title="Pilih Gaya Undanganmu"
          description="Setiap template punya gerak dan nuansa yang berbeda — dari formal elegan hingga cerita perjalanan cinta."
        />

        <div className="mt-10 grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          {/* left: info */}
          <div className="flex min-w-0 flex-col gap-6 text-center lg:text-left">
            <div className="min-w-0">
              <h3 className="font-heading text-[clamp(1.5rem,1.2rem+1.4vw,1.875rem)] text-text-primary">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                {item.tagline}
              </p>
            </div>

            {/* features */}
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {item.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {f}
                </span>
              ))}
              <span className="rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-text-secondary">
                {item.sectionCount} section
              </span>
            </div>

            {/* motion */}
            <p className="text-xs text-text-secondary">
              Animasi: <span className="font-medium text-accent">{item.motion}</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-background shadow-[0_12px_30px_rgba(124,132,114,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(124,132,114,0.3)] active:scale-[0.98]"
              >
                Preview Live
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>
              <Link
                href="/dashboard/invitations/new"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-primary transition-colors duration-300 hover:border-accent/40 hover:text-accent"
              >
                Gunakan Template Ini
              </Link>
            </div>
          </div>

          {/* right: mockup preview */}
          <div className="flex min-w-0 justify-center">
            <div className="relative w-[clamp(240px,65vw,320px)] overflow-hidden rounded-2xl border-[6px] border-black/15 bg-black/5 shadow-[0_30px_80px_rgba(84,82,77,0.15)]">
              {/* notch */}
              <span className="absolute left-1/2 top-2 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-black/20" />
              {/* iframe preview */}
              <div className="aspect-[9/19.5] w-full overflow-hidden rounded-t-xl bg-background">
                <iframe
                  src={`/preview/${item.id}`}
                  title={`Preview template ${item.name}`}
                  loading="lazy"
                  className="h-full w-full border-0"
                />
              </div>
              {/* navigation dots */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  className="grid h-11 w-11 place-items-center rounded-full bg-black/30 text-white/80 transition hover:bg-black/50 hover:text-white"
                  aria-label="Template sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] text-white/70" aria-live="polite">
                  {activeIndex + 1}/{templateShowcase.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="grid h-11 w-11 place-items-center rounded-full bg-black/30 text-white/80 transition hover:bg-black/50 hover:text-white"
                  aria-label="Template berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template thumbnails */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {templateShowcase.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-12 w-12 rounded-lg border-2 transition-all duration-200 ${
                i === activeIndex ? "border-accent scale-110" : "border-black/10 hover:scale-105"
              }`}
              style={{ backgroundColor: t.palette.screen }}
              aria-label={`View ${t.name} template`}
            >
              <span className="sr-only">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <PreviewModal data={modalData} onClose={handleClose} />
    </section>
  );
}


