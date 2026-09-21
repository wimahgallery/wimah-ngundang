"use client";

import { useMemo, type ReactNode } from "react";
import { animated, useInView, useSpring, useTrail } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";
import { springGentle, springSmooth } from "./springs";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

const defaultRootMargin = "0px 0px -12% 0px";

function offsetFor(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
      return {};
    default:
      return { y: distance };
  }
}

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay dalam ms, dipakai untuk membuat urutan antar elemen. */
  delay?: number;
  distance?: number;
  direction?: RevealDirection;
  fromScale?: number;
  amount?: number;
  once?: boolean;
  /** Tag pembungkus, mis. "li" saat dipakai di dalam list. */
  as?: "div" | "li";
}

/**
 * Reveal saat masuk viewport: fade + translate (GPU friendly), hanya berjalan sekali
 * sehingga animasi tidak restart ketika user menggulir naik-turun.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 26,
  direction = "up",
  fromScale,
  amount = 0.2,
  once = true,
  as = "div",
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const intersection = useMemo(
    () => ({ once, amount, rootMargin: defaultRootMargin }),
    [once, amount],
  );
  const [ref, inView] = useInView(intersection);
  const offset = offsetFor(direction, distance);

  const styles = useSpring({
    from: { opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0, scale: fromScale ?? 1 },
    to: { opacity: inView ? 1 : 0, x: 0, y: 0, scale: 1 },
    delay: inView ? delay : 0,
    immediate: reducedMotion,
    config: springSmooth,
  });

  const Component = as === "li" ? animated.li : animated.div;

  return (
    <Component ref={ref} style={styles} className={className}>
      {children}
    </Component>
  );
}

export interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
  once?: boolean;
}

/**
 * Text reveal per kata dengan stagger. Menggunakan translate + opacity saja
 * supaya tetap ringan dan tidak menyebabkan layout shift.
 */
export function TextReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 70,
  amount = 0.3,
  once = true,
}: TextRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const intersection = useMemo(
    () => ({ once, amount, rootMargin: "0px 0px -10% 0px" }),
    [once, amount],
  );
  const [ref, inView] = useInView(intersection);

  const trail = useTrail(words.length, {
    from: { opacity: 0, y: 22 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 22 },
    delay: inView ? delay : 0,
    trail: stagger,
    immediate: reducedMotion,
    config: springGentle,
  });

  return (
    <span ref={ref} className={cn("inline", className)}>
      {trail.map((style, index) => (
        <animated.span
          key={`${words[index]}-${index}`}
          style={style}
          className={cn("inline-block", wordClassName)}
        >
          {words[index]}
          {index < words.length - 1 ? "\u00A0" : ""}
        </animated.span>
      ))}
    </span>
  );
}
