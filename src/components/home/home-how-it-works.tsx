"use client";

import { useMemo } from "react";
import { animated, useInView, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { workflowSteps } from "@/lib/homepage-content";
import { Reveal } from "@/components/motion/reveal";
import { durationCinematic } from "@/components/motion/springs";
import { SectionIntro } from "./section-intro";

export function HomeHowItWorks() {
  const reducedMotion = usePrefersReducedMotion();
  const intersection = useMemo(() => ({ once: true, amount: 0.25 }), []);
  const [ref, inView] = useInView(intersection);

  const progress = useSpring({
    from: { scaleX: 0 },
    to: inView ? { scaleX: 1 } : { scaleX: 0 },
    delay: inView ? 120 : 0,
    immediate: reducedMotion,
    config: durationCinematic(1700),
  });

  return (
    <section id="cara-kerja" className="scroll-mt-8 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          kicker="Cara Kerja"
          title="Empat langkah, undangan siap dibagikan"
          description="Tanpa perlu keahlian desain atau teknis. Kami dampingi dari pemilihan template sampai link siap dikirim ke tamu."
        />

        <div ref={ref} className="relative mt-14">
          <span
            aria-hidden
            className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] bg-border lg:block"
          />
          <animated.span
            aria-hidden
            style={progress}
            className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] origin-left bg-accent lg:block"
          />

          <ol className="grid gap-8 md:grid-cols-[repeat(2,minmax(0,1fr))] md:gap-10 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-6">
            {workflowSteps.map((step, index) => (
              <Reveal
                key={step.title}
                as="li"
                delay={index * 130}
                distance={20}
                className="relative flex min-w-0 gap-4 lg:flex-col lg:gap-5"
              >
                <span className="relative z-10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-background font-heading text-sm tracking-wide text-accent shadow-[0_10px_24px_rgba(124,132,114,0.12)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-1 lg:pr-4">
                  <h3 className="font-heading text-xl text-text-primary text-balance">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-accent">
                    {step.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
