"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useInView, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { ChevronDown } from "lucide-react";
import { showcaseFaqs } from "@/lib/homepage-content";
import { Reveal } from "@/components/motion/reveal";
import { springSmooth } from "@/components/motion/springs";
import { SectionIntro } from "./section-intro";
import { cn } from "@/lib/utils";

function FaqItem({
  question,
  answer,
  index,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInView({ once: true, amount: 0.3 });
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  const entrance = useSpring({
    from: { opacity: 0, y: 16 },
    to: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    delay: inView ? index * 70 : 0,
    immediate: reducedMotion,
    config: springSmooth,
  });

  useEffect(() => {
    const element = bodyRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const body = useSpring({
    height: open ? height : 0,
    opacity: open ? 1 : 0,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const chevron = useSpring({
    rotate: open ? 180 : 0,
    immediate: reducedMotion,
    config: springSmooth,
  });

  return (
    <animated.li ref={ref} style={entrance} className="border-b border-border">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-panel-${index}`}
          id={`faq-trigger-${index}`}
          className="flex w-full items-center justify-between gap-5 py-5 text-left"
        >
          <span
            className={cn(
              "font-heading text-lg leading-snug transition-colors duration-300",
              open ? "text-accent" : "text-text-primary",
            )}
          >
            {question}
          </span>
          <animated.span
            style={chevron}
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
              open ? "border-accent/40 text-accent" : "border-border text-text-secondary",
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </animated.span>
        </button>
      </h3>

      <animated.div
        style={body}
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-trigger-${index}`}
        className="overflow-hidden"
      >
        <div ref={bodyRef} className="pb-6 pr-10 text-sm leading-relaxed text-text-secondary">
          {answer}
        </div>
      </animated.div>
    </animated.li>
  );
}

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionIntro
          kicker="FAQ"
          title="Pertanyaan yang sering ditanyakan"
          description="Kalau masih ada yang mengganjal, tanyakan langsung lewat WhatsApp — kami balas dengan bahasa manusia, bukan template."
        />

        <Reveal delay={80}>
          <ul className="mt-10 border-t border-border">
            {showcaseFaqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                index={index}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
