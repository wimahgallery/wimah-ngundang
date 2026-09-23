"use client";

import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { heroTrustItems, waMessages, whatsappLink } from "@/lib/site-config";
import { scrollToHash } from "@/lib/scroll";
import { springSmooth, springGentle } from "@/components/motion/springs";
import { DeviceFrame } from "./device-frame";
import { OrnamentalDivider } from "./ornamental";

export function HomeHero() {
  const reducedMotion = usePrefersReducedMotion();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const badge = useSpring({
    from: { opacity: 0, scale: 0.92, y: 12 },
    to: loaded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 },
    delay: 100,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const divider = useSpring({
    from: { opacity: 0, scaleX: 0 },
    to: loaded ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 },
    delay: 250,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const heading = useSpring({
    from: { opacity: 0, y: 24 },
    to: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    delay: 350,
    immediate: reducedMotion,
    config: springGentle,
  });

  const description = useSpring({
    from: { opacity: 0, y: 16 },
    to: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    delay: 500,
    immediate: reducedMotion,
    config: springGentle,
  });

  const cta = useSpring({
    from: { opacity: 0, y: 16 },
    to: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    delay: 600,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const trust = useSpring({
    from: { opacity: 0 },
    to: loaded ? { opacity: 1 } : { opacity: 0 },
    delay: 750,
    immediate: reducedMotion,
    config: springGentle,
  });

  const mockup = useSpring({
    from: { opacity: 0, y: 50, scale: 0.97 },
    to: loaded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.97 },
    delay: 200,
    immediate: reducedMotion,
    config: springGentle,
  });

  return (
    <section className="relative overflow-hidden bg-background px-5 pb-16 pt-14 sm:px-8 sm:pt-16 md:pt-20 lg:pb-24 lg:pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="texture-noise absolute inset-0" />
      </div>

      <div className="mx-auto flex max-w-6xl min-w-0 flex-col items-center gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        {/* text content */}
        <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <animated.span
            style={badge}
            className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-background/70 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-accent backdrop-blur will-change-transform"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
            Undangan Digital Premium
          </animated.span>

          <animated.div style={divider} className="mt-5 will-change-transform">
            <OrnamentalDivider />
          </animated.div>

          <animated.h1
            style={heading}
            className="mt-5 max-w-2xl font-heading text-[clamp(1.875rem,1.15rem+3vw,3.125rem)] leading-[1.08] text-text-primary text-balance will-change-transform"
          >
            Undangan digital yang membuat setiap tamu merasa istimewa
          </animated.h1>

          <animated.p
            style={description}
            className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base will-change-transform"
          >
            Wimah Ngundang merangkai undangan pernikahan digital dengan animasi halus, galeri foto,
            musik, peta lokasi, dan angpao digital — siap dibagikan lewat satu link dalam hitungan
            menit.
          </animated.p>

          <animated.div
            style={cta}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center will-change-transform"
          >
            <a
              href="#template"
              onClick={(event) => {
                event.preventDefault();
                scrollToHash("#template");
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-background shadow-[0_14px_34px_rgba(124,132,114,0.28)] transition-all duration-300 hover:scale-[1.02]"
            >
              Lihat Template
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href={whatsappLink(waMessages.hero)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3.5 text-sm text-text-primary backdrop-blur transition-colors duration-300 hover:border-accent/40 hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi Gratis
            </a>
          </animated.div>

          <animated.ul
            style={trust}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start will-change-transform"
          >
            {heroTrustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-text-secondary"
              >
                <span className="block h-1 w-1 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </animated.ul>
        </div>

        {/* mockup */}
        <animated.div style={mockup} className="flex min-w-0 justify-center lg:justify-end will-change-transform">
          <DeviceFrame
            size="md"
            className="w-[min(268px,65vw)]"
            screenClassName="aspect-auto h-[clamp(420px,55svh,540px)]"
          >
            <iframe
              src="/preview/elegant-classic"
              title="Preview undangan digital"
              className="h-full w-full border-0"
            />
          </DeviceFrame>
        </animated.div>
      </div>
    </section>
  );
}
