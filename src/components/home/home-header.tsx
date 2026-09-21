"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { navigationLinks, waMessages, whatsappLink } from "@/lib/site-config";
import { scrollToHash } from "@/lib/scroll";
import { springSmooth } from "@/components/motion/springs";
import { cn } from "@/lib/utils";

export function HomeHeader() {
  const reducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const shell = useSpring({
    from: { opacity: 0, y: -16 },
    to: { opacity: 1, y: 0 },
    immediate: reducedMotion,
    config: springSmooth,
  });

  const panel = useSpring({
    from: { opacity: 0, y: -12 },
    to: menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 },
    immediate: reducedMotion,
    config: springSmooth,
  });

  const go = useCallback((hash: string) => {
    setMenuOpen(false);
    scrollToHash(hash);
  }, []);

  const navItems = useMemo(() => navigationLinks, []);

  return (
    <animated.header
      style={shell}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || menuOpen
          ? "border-b border-border bg-glass/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Wimah Ngundang">
          <Image src="/wimah.png" alt="" width={34} height={34} className="invert" priority />
          <span className="font-heading text-lg text-text-primary">Wimah Ngundang</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => go(item.href)}
              className="text-xs uppercase tracking-[0.18em] text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(waMessages.footer)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-medium text-background transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="rounded-full border border-border p-2 text-text-primary lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <animated.nav
          style={panel}
          className="border-t border-border bg-background/95 px-5 pb-5 pt-2 backdrop-blur-md lg:hidden"
        >
          <div className="flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className="border-b border-border/60 py-3 text-left text-sm text-text-primary"
              >
                {item.label}
              </button>
            ))}
            <a
              href={whatsappLink(waMessages.footer)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-background"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp
            </a>
          </div>
        </animated.nav>
      ) : null}
    </animated.header>
  );
}
