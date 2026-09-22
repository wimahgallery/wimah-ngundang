"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { templateShowcase, type TemplateShowcaseItem } from "@/lib/homepage-content";
import { PreviewModal, type PreviewModalData } from "./preview-modal";
import { SectionIntro } from "./section-intro";
import { Reveal } from "@/components/motion/reveal";

export function TemplateShowcase() {
  const [selected, setSelected] = useState<TemplateShowcaseItem | null>(null);
  const item = templateShowcase[0];

  const handlePreview = useCallback(() => setSelected(item), [item]);
  const handleClose = useCallback(() => setSelected(null), []);

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
    <section id="template" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionIntro
          kicker="Template Premium"
          title="Elegant Classic — desain yang timeless"
          description="Hero fullscreen, tipografi klasik, animasi halus. Semua section bisa dicustom sesuai kebutuhan acaramu."
        />

        <Reveal delay={100} className="mt-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* left: info */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <div>
                <h3 className="font-heading text-2xl text-text-primary sm:text-3xl">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                  {item.tagline}
                </p>
              </div>

              {/* color palette */}
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="text-xs text-text-secondary">Palet warna:</span>
                <div className="flex items-center gap-1.5">
                  {[item.palette.accent, item.palette.soft, item.palette.ink, item.palette.screen].map(
                    (color, i) => (
                      <span
                        key={i}
                        className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: color }}
                        aria-label={`Warna ${i + 1}`}
                      />
                    ),
                  )}
                </div>
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
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-background shadow-[0_12px_30px_rgba(124,132,114,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(124,132,114,0.3)] active:scale-[0.98]"
                >
                  Preview Live
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </button>
                <Link
                  href="/dashboard/invitations/new"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-primary transition-colors duration-300 hover:border-accent/40 hover:text-accent"
                >
                  Gunakan Template Ini
                </Link>
              </div>
            </div>

            {/* right: mockup preview */}
            <div className="flex justify-center">
              <div className="relative w-[min(280px,70vw)] overflow-hidden rounded-2xl border-[6px] border-black/15 bg-black/5 shadow-[0_30px_80px_rgba(84,82,77,0.15)] sm:w-[min(320px,45vw)]">
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
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <PreviewModal data={modalData} onClose={handleClose} />
    </section>
  );
}
