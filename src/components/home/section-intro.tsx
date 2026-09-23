"use client";

import type { ReactNode } from "react";
import { Reveal, TextReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface SectionIntroProps {
  kicker: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

/** Header section yang konsisten: kicker, judul dengan text reveal, dan deskripsi. */
export function SectionIntro({
  kicker,
  title,
  description,
  align = "center",
  tone = "light",
  className,
}: SectionIntroProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal distance={16} className="w-full">
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.28em]",
            tone === "dark" ? "text-gold" : "text-accent",
          )}
        >
          {kicker}
        </p>
      </Reveal>

      <h2
        className={cn(
          "w-full max-w-3xl font-heading text-[clamp(1.75rem,1.1rem+2.6vw,3.125rem)] leading-[1.08] text-balance",
          tone === "dark" ? "text-[#F5F3EE]" : "text-text-primary",
        )}
      >
        <TextReveal text={title} stagger={60} />
      </h2>

      {description ? (
        <Reveal delay={120} distance={20} className="w-full">
          <p
            className={cn(
              "max-w-2xl text-sm leading-relaxed sm:text-base",
              isCenter && "mx-auto",
              tone === "dark" ? "text-[#F5F3EE]/65" : "text-text-secondary",
            )}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
