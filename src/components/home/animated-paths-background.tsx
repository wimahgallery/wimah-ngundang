"use client";

import { useMemo, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

/* ── Types ── */

interface AnimatedPathsBackgroundProps {
  lineCount?: number;
  speed?: number;
  opacity?: number;
  className?: string;
}

interface PathData {
  d: string;
  opacity: number;
  strokeWidth: number;
  color: string;
}

interface LayerConfig {
  paths: PathData[];
  speed: number;
  opacity: number;
  blur: number;
  direction: 1 | -1;
}

/* ── Palette ── */

const PALETTE = [
  "#54524d", // warm dark
  "#7c8472", // sage green
  "#8d8a82", // muted
  "#d4a853", // gold (rare)
];

/* ── Path Generation ── */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateBezierPath(
  rand: () => number,
  width: number,
  height: number,
): string {
  const startX = -width * 0.15 + rand() * width * 0.35;
  const startY = rand() * height;
  const endX = width * 0.65 + rand() * width * 0.5;
  const endY = rand() * height;

  const cp1x = startX + (endX - startX) * (0.15 + rand() * 0.35);
  const cp1y = startY + (rand() - 0.5) * height * 0.7;
  const cp2x = startX + (endX - startX) * (0.55 + rand() * 0.25);
  const cp2y = endY + (rand() - 0.5) * height * 0.7;

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

function generatePaths(
  count: number,
  width: number,
  height: number,
  seed: number,
): PathData[] {
  const rand = seededRandom(seed);
  const paths: PathData[] = [];

  for (let i = 0; i < count; i++) {
    const colorIndex = rand() < 0.85 ? Math.floor(rand() * 3) : 3;
    paths.push({
      d: generateBezierPath(rand, width, height),
      opacity: 0.08 + rand() * 0.15,
      strokeWidth: 1 + rand() * 2,
      color: PALETTE[colorIndex],
    });
  }

  return paths;
}

/* ── Animated Layer ── */

function AnimatedLayer({
  layer,
  globalSpeed,
  reducedMotion,
}: {
  layer: LayerConfig;
  globalSpeed: number;
  reducedMotion: boolean;
}) {
  const distance = 400;
  const duration = Math.round((25000 + (1 - layer.speed) * 40000) / globalSpeed);

  const [styles, api] = useSpring(() => ({
    x: layer.direction === 1 ? -distance : distance,
  }));

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;

    async function run() {
      while (!cancelled) {
        const target = layer.direction === 1 ? distance : -distance;
        const start = layer.direction === 1 ? -distance : distance;
        await new Promise<void>((resolve) => {
          api.start({
            x: target,
            config: { duration, precision: 0.5 },
            onRest: () => resolve(),
          });
        });
        if (cancelled) break;
        await new Promise<void>((resolve) => {
          api.start({
            x: start,
            config: { duration, precision: 0.5 },
            onRest: () => resolve(),
          });
        });
      }
    }

    run();
    return () => { cancelled = true; };
  }, [api, distance, duration, layer.direction, reducedMotion]);

  return (
    <animated.div
      style={{
        transform: styles.x.to((v) => `translate3d(${v}px,0,0)`),
        opacity: layer.opacity,
        filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
        position: "absolute",
        inset: 0,
        willChange: "transform",
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {layer.paths.map((path, j) => (
          <path
            key={j}
            d={path.d}
            fill="none"
            stroke={path.color}
            strokeWidth={path.strokeWidth}
            opacity={path.opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </animated.div>
  );
}

/* ── Main Component ── */

export function AnimatedPathsBackground({
  lineCount = 40,
  speed = 1,
  opacity = 1,
  className,
}: AnimatedPathsBackgroundProps) {
  const reducedMotion = usePrefersReducedMotion();

  const layers: LayerConfig[] = useMemo(() => {
    const bgCount = Math.floor(lineCount * 0.35);
    const midCount = Math.floor(lineCount * 0.35);
    const fgCount = lineCount - bgCount - midCount;

    return [
      {
        paths: generatePaths(bgCount, 1920, 1080, 42),
        speed: speed * 0.4,
        opacity: 0.35,
        blur: 2.5,
        direction: 1,
      },
      {
        paths: generatePaths(midCount, 1920, 1080, 137),
        speed: speed * 0.7,
        opacity: 0.6,
        blur: 1,
        direction: -1,
      },
      {
        paths: generatePaths(fgCount, 1920, 1080, 256),
        speed: speed,
        opacity: 0.9,
        blur: 0,
        direction: 1,
      },
    ];
  }, [lineCount, speed]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
      style={{ opacity }}
    >
      {layers.map((layer, i) => (
        <AnimatedLayer
          key={i}
          layer={layer}
          globalSpeed={speed}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
