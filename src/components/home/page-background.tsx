"use client";

import { AnimatedPathsBackground } from "./animated-paths-background";

export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <AnimatedPathsBackground
        lineCount={45}
        speed={0.5}
        opacity={0.4}
        className="absolute inset-0"
      />
    </div>
  );
}
