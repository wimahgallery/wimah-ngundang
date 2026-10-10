"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  templateShowcase,
  type TemplateShowcaseItem,
} from "@/lib/homepage-content";
import { waMessages, whatsappLink } from "@/lib/site-config";
import { LazyFrame } from "@/components/lazy";
import type { PreviewModalData } from "./preview-modal";

const PreviewModal = dynamic(
  () => import("./preview-modal").then((mod) => mod.PreviewModal),
  { ssr: false },
);
import { SectionIntro } from "./section-intro";

export function TemplateShowcase() {
  const [selected, setSelected] = useState<TemplateShowcaseItem | null>(null);

  const handlePreview = useCallback(
    (item: TemplateShowcaseItem) => setSelected(item),
    [],
  );
  const handleClose = useCallback(() => setSelected(null), []);

  const attachScreen = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const update = () =>
      node.style.setProperty("--k", String(node.clientWidth / 390));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

  return (
    <section
      id="template"
      className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          kicker="Our Template"
          title="Semua template kami dalam satu katalog"
          description="Pilih gaya yang paling terasa seperti kalian. Semua bagian undangan tetap bisa dicustom — nama, jadwal, galeri, musik, sampai angpao digital."
        />

        <ul className="mt-11 grid grid-cols-2 gap-4 sm:mt-14 md:grid-cols-3 md:gap-5 lg:gap-6">
          {templateShowcase.map((item, index) => (
            <li key={item.id} className="min-w-0">
              <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface/50 p-3 transition-colors duration-300 hover:border-accent/40 sm:p-4">
                <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(130%_100%_at_50%_0%,#f2f1ee_0%,#e7e4dd_70%,#dcd8d0_100%)] p-4 transition-transform duration-500 ease-out group-hover:-translate-y-1 [perspective:1200px] sm:p-6 lg:p-7">
                  <span
                    aria-hidden
                    className="absolute bottom-[11%] left-1/2 h-5 w-[58%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl sm:h-6"
                  />

                  <div className="relative aspect-[200/416] h-[90%] transition-transform duration-500 ease-out [transform:rotateY(16deg)_rotateX(4deg)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)]">
                    <span
                      aria-hidden
                      className="absolute -left-[3px] top-[16%] h-[7%] w-[3px] rounded-l-sm bg-[#3c3c41]"
                    />
                    <span
                      aria-hidden
                      className="absolute -left-[3px] top-[26%] h-[7%] w-[3px] rounded-l-sm bg-[#3c3c41]"
                    />
                    <span
                      aria-hidden
                      className="absolute -right-[3px] top-[21%] h-[11%] w-[3px] rounded-r-sm bg-[#3c3c41]"
                    />

                    <div className="relative h-full w-full rounded-[1.3rem] bg-gradient-to-b from-[#2b2b31] via-[#16161a] to-[#0e0e12] p-[5px] shadow-[0_35px_70px_rgba(10,10,14,0.4),0_10px_24px_rgba(10,10,14,0.28)] ring-1 ring-white/10 sm:p-[7px]">
                      {/* Layar replika bersifat dekoratif: pointer-events-none
                          supaya klik & gulir tamu jatuh ke halaman (bukan ke
                          iframe preview) — interaksi ada di tombol "Preview
                          Live" di bawah kartu. */}
                      <div
                        ref={attachScreen}
                        className="pointer-events-none relative h-full w-full overflow-hidden rounded-[1rem] bg-black"
                      >
                        <LazyFrame
                          src={`/preview/${item.id}`}
                          title={`Preview template ${item.name}`}
                          tabIndex={-1}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "390px",
                            height: "calc(100% / var(--k, 1))",
                            transform: "scale(var(--k, 1))",
                            transformOrigin: "top left",
                          }}
                          fallbackClassName="bg-[#0e0e12]"
                        />
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-[5px] z-10 h-1.5 w-[30%] max-w-14 -translate-x-1/2 rounded-full bg-black"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-1 flex-col sm:mt-4">
                  <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.24em]">
                    Tema {index + 1}
                  </span>
                  <h3 className="mt-1.5 font-heading text-base leading-snug text-text-primary sm:text-lg lg:text-xl">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                    {item.tagline}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 pt-1 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <button
                      type="button"
                      onClick={() => handlePreview(item)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-4 py-3 text-[13px] font-medium text-background shadow-[0_12px_30px_rgba(124,132,114,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:flex-1 sm:text-sm"
                    >
                      Preview Live
                    </button>
                    <a
                      href={whatsappLink(waMessages.template(item.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border px-4 py-3 text-[13px] text-text-primary transition-colors duration-300 hover:border-accent/40 hover:text-accent sm:flex-1 sm:text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Pesan
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <PreviewModal data={modalData} onClose={handleClose} />
    </section>
  );
}
