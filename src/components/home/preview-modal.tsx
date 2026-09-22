"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { animated, useSpring } from "@react-spring/web";
import { ExternalLink, MessageCircle, MonitorSmartphone, Smartphone, Tablet, X } from "lucide-react";
import type { TemplateId } from "@/components/invitation/template-registry";
import { waMessages, whatsappLink } from "@/lib/site-config";
import { springSnappy, springSheet } from "@/components/motion/springs";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface PreviewModalData {
  id: TemplateId;
  name: string;
  motion: string;
  tagline: string;
  bestFor: string;
}

type Viewport = "phone" | "tablet" | "desktop";

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
const DRAG_THRESHOLD = 140;

export function PreviewModal({
  data,
  onClose,
}: {
  data: PreviewModalData | null;
  onClose: () => void;
}) {
  if (!data || typeof document === "undefined") return null;
  return createPortal(<PreviewModalShell data={data} onClose={onClose} />, document.body);
}

function PreviewModalShell({
  data,
  onClose,
}: {
  data: PreviewModalData;
  onClose: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<Viewport>("phone");
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);

  const [sheetSpring, sheetApi] = useSpring(() => ({
    y: 100,
    opacity: 0,
    config: springSheet,
    immediate: reducedMotion,
  }));

  const [dragSpring, dragApi] = useSpring(() => ({
    y: 0,
    config: { tension: 350, friction: 35, precision: 0.5 },
  }));

  const [backdropSpring, backdropApi] = useSpring(() => ({
    opacity: 0,
    config: { tension: 200, friction: 30 },
    immediate: reducedMotion,
  }));

  const frameSrc = `/preview/${data.id}`;

  const handleClose = useCallback(() => {
    backdropApi.start({ opacity: 0 });
    sheetApi.start({
      y: 100,
      opacity: 0,
      onRest: onClose,
    });
  }, [sheetApi, backdropApi, onClose]);

  // entrance
  useEffect(() => {
    backdropApi.start({ opacity: 1 });
    sheetApi.start({ y: 0, opacity: 1 });
  }, [sheetApi, backdropApi]);

  // body lock + focus
  useEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - documentElement.clientWidth;
    const previousFocus = document.activeElement as HTMLElement | null;

    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    const frame = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialogRef.current)?.focus();
    });

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      previousFocus?.focus?.();
    };
  }, [handleClose]);

  const handleTabTrap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setDragging(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const delta = e.touches[0].clientY - dragStartY.current;
      if (delta > 0) {
        setDragging(true);
        dragApi.set({ y: delta });
      }
    },
    [dragApi],
  );

  const handleTouchEnd = useCallback(() => {
    const currentY = dragSpring.y.get();
    if (currentY > DRAG_THRESHOLD) {
      handleClose();
    } else {
      dragApi.start({ y: 0 });
    }
    setDragging(false);
  }, [dragSpring, dragApi, handleClose]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    setDragging(false);

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientY - dragStartY.current;
      if (delta > 0) {
        setDragging(true);
        dragApi.set({ y: delta });
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      const currentY = dragSpring.y.get();
      if (currentY > DRAG_THRESHOLD) {
        handleClose();
      } else {
        dragApi.start({ y: 0 });
      }
      setDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [dragApi, dragSpring, handleClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      role="presentation"
    >
      {/* backdrop */}
      <animated.div
        style={{ opacity: backdropSpring.opacity }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* sheet */}
      <animated.div
        style={{
          transform: sheetSpring.y.to((y) => `translate3d(0,${y}%,0)`),
          opacity: sheetSpring.opacity,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        ref={dialogRef}
        onKeyDown={handleTabTrap}
        tabIndex={-1}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#1a1b17] text-[#F5F3EE] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] outline-none will-change-transform lg:max-w-6xl"
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />
        </div>

        {/* drag handle */}
        <div
          className="relative flex shrink-0 justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <span
            className={cn(
              "h-1 w-10 rounded-full transition-colors duration-200",
              dragging ? "bg-white/60" : "bg-white/25",
            )}
          />
        </div>

        {/* header */}
        <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.28em] text-gold sm:text-[10px]">Preview live template</p>
            <h3
              id="preview-modal-title"
              className="mt-0.5 truncate font-heading text-base sm:text-xl lg:text-2xl"
            >
              {data.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[#F5F3EE]/60 sm:text-xs">{data.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              role="tablist"
              aria-label="Pilih tampilan preview"
              className="items-center rounded-full border border-white/15 bg-white/5 p-0.5 hidden sm:flex"
            >
              <ViewportTab
                label="Telepon"
                icon={<Smartphone className="h-3.5 w-3.5" />}
                selected={viewport === "phone"}
                onSelect={() => setViewport("phone")}
              />
              <ViewportTab
                label="Tablet"
                icon={<Tablet className="h-3.5 w-3.5" />}
                selected={viewport === "tablet"}
                onSelect={() => setViewport("tablet")}
              />
              <ViewportTab
                label="Desktop"
                icon={<MonitorSmartphone className="h-3.5 w-3.5" />}
                selected={viewport === "desktop"}
                onSelect={() => setViewport("desktop")}
              />
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Tutup preview"
              className="rounded-full border border-white/15 p-1.5 text-[#F5F3EE]/80 transition-colors hover:border-white/40 hover:text-white sm:p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* body */}
        <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-0 sm:gap-4 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* preview area */}
          <div className="relative flex min-h-0 items-center justify-center overflow-hidden px-2 pt-3 pb-2 sm:px-0 sm:pt-0">
            {viewport === "phone" && <PhonePreview src={frameSrc} name={data.name} />}
            {viewport === "tablet" && <TabletPreview src={frameSrc} name={data.name} />}
            {viewport === "desktop" && <DesktopPreview src={frameSrc} name={data.name} id={data.id} />}
          </div>

          {/* info panel */}
          <div className="relative flex min-h-0 flex-col overflow-y-auto border-t border-white/10 px-4 py-4 sm:border-t-0 sm:rounded-xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-4 lg:border-t lg:bg-transparent lg:p-4">
            <div className="space-y-3">
              <span className="inline-flex w-fit rounded-full border border-gold/40 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold sm:text-[10px]">
                {data.motion}
              </span>
              <p className="text-[12px] leading-relaxed text-[#F5F3EE]/75 sm:text-sm">
                Cocok untuk {data.bestFor.toLowerCase()}. Semua bagian undangan bisa dicustom: nama
                pasangan, jadwal acara, lokasi dengan Google Maps, cerita, galeri foto, angpao digital,
                dan musik latar.
              </p>

              <ul className="hidden gap-2 text-[12px] text-[#F5F3EE]/70 sm:grid sm:text-[13px]">
                {[
                  "Galeri foto + musik latar",
                  "Angpao digital & Google Maps",
                  "Mobile friendly dan cepat dibuka",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:pt-2">
                <a
                  href={whatsappLink(waMessages.template(data.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Saya mau template ini
                </a>
                <a
                  href={`/preview/${data.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[13px] text-[#F5F3EE] transition-colors hover:border-white/50 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Buka di tab baru
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* viewport tabs — mobile bottom bar */}
        <div className="relative shrink-0 border-t border-white/10 bg-[#141512]/90 px-3 py-2.5 sm:hidden">
          <div
            role="tablist"
            aria-label="Pilih tampilan preview"
            className="mx-auto grid max-w-[320px] grid-cols-3 gap-1 rounded-full border border-white/15 bg-white/5 p-1"
          >
            <ViewportTab
              label="Telepon"
              icon={<Smartphone className="h-3 w-3" />}
              selected={viewport === "phone"}
              onSelect={() => setViewport("phone")}
              className="justify-center"
            />
            <ViewportTab
              label="Tablet"
              icon={<Tablet className="h-3 w-3" />}
              selected={viewport === "tablet"}
              onSelect={() => setViewport("tablet")}
              className="justify-center"
            />
            <ViewportTab
              label="Desktop"
              icon={<MonitorSmartphone className="h-3 w-3" />}
              selected={viewport === "desktop"}
              onSelect={() => setViewport("desktop")}
              className="justify-center"
            />
          </div>
        </div>
      </animated.div>
    </div>
  );
}

/* ── Phone Preview ── */
function PhonePreview({ src, name }: { src: string; name: string }) {
  return (
    <div className="relative w-[min(240px,55vw)] overflow-hidden rounded-t-xl border-x-[5px] border-t-[5px] border-[#26261f] bg-[#26261f] shadow-[0_-10px_60px_rgba(0,0,0,0.4)] sm:w-[min(280px,35vw)]">
      <PointerGlow />
      <div className="relative h-[min(45dvh,360px)] overflow-hidden rounded-t-lg bg-[#F5F3EE] sm:h-[min(50dvh,420px)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-[6px] z-20 h-[4px] w-12 -translate-x-1/2 rounded-full bg-black/25"
        />
        <iframe
          src={src}
          title={`Preview template ${name} di telepon`}
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}

/* ── Tablet Preview ── */
function TabletPreview({ src, name }: { src: string; name: string }) {
  return (
    <div className="relative w-[min(360px,55vw)] overflow-hidden rounded-xl border-[6px] border-[#26261f] bg-[#26261f] shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:w-[min(400px,45vw)]">
      <span
        aria-hidden
        className="absolute left-1/2 top-[4px] z-20 h-[4px] w-10 -translate-x-1/2 rounded-full bg-white/20"
      />
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#F5F3EE]">
        <iframe
          src={src}
          title={`Preview template ${name} di tablet`}
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}

/* ── Desktop Preview ── */
function DesktopPreview({ src, name, id }: { src: string; name: string; id: string }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:min-h-[320px] lg:min-h-0">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-2 sm:px-4 sm:py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#FF5F57]/80 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 rounded-full bg-[#FEBC2E]/80 sm:h-2.5 sm:w-2.5" />
        <span className="h-2 w-2 rounded-full bg-[#28C840]/80 sm:h-2.5 sm:w-2.5" />
        <span className="ml-2 max-w-[60%] truncate rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] text-white/70 sm:px-2 sm:text-[10px]">
          wimah.ngundang/preview/{id}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <iframe
          src={src}
          title={`Preview template ${name} di desktop`}
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}

function PointerGlow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent"
    />
  );
}

function ViewportTab({
  label,
  icon,
  selected,
  onSelect,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [spring, springApi] = useSpring(() => ({
    scale: selected ? 1 : 0.96,
    immediate: reducedMotion,
    config: springSnappy,
  }));

  useEffect(() => {
    springApi.start({ scale: selected ? 1 : 0.96 });
  }, [selected, springApi, reducedMotion]);

  return (
    <animated.button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      style={spring}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors duration-200 sm:gap-1.5 sm:px-3 sm:text-[11px]",
        selected ? "bg-white text-[#1a1b17]" : "text-white/60 hover:text-white",
        className,
      )}
    >
      {icon}
      {label}
    </animated.button>
  );
}
