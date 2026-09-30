"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";

const EXIT_AT_MS = 2400;
const UNMOUNT_AT_MS = 3500;
const SKIP_UNMOUNT_MS = 800;

type Phase = "intro" | "exit" | "done";

function SpacedWord({
  text,
  startAtMs,
  stepMs,
}: {
  text: string;
  startAtMs: number;
  stepMs: number;
}) {
  return (
    <span aria-hidden="true">
      {text.split("").map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="opening-letter"
          style={{ animationDelay: `${startAtMs + index * stepMs}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

export function OpeningAnimation() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");
  const exitTimer = useRef<number | null>(null);
  const unmountTimer = useRef<number | null>(null);

  const handleSkip = useCallback(() => {
    if (exitTimer.current) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
    setPhase((current) => (current === "done" ? current : "exit"));
    unmountTimer.current = window.setTimeout(() => setPhase("done"), SKIP_UNMOUNT_MS);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    exitTimer.current = window.setTimeout(() => setPhase("exit"), EXIT_AT_MS);
    unmountTimer.current = window.setTimeout(() => setPhase("done"), UNMOUNT_AT_MS);

    return () => {
      body.style.overflow = previousOverflow;
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
      if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
    };
  }, [reducedMotion]);

  if (reducedMotion || phase === "done") return null;

  return (
    <div
      className="opening"
      data-exiting={phase === "exit"}
      onClick={handleSkip}
      aria-hidden="true"
    >
      <span className="opening-panel opening-panel-top" />
      <span className="opening-panel opening-panel-bottom" />

      <div className="opening-content">
        <p className="opening-kicker opening-fade" style={{ animationDelay: "150ms" }}>
          Undangan Digital Premium
        </p>

        <p className="opening-word">
          <SpacedWord text="Wimah" startAtMs={250} stepMs={85} />
        </p>

        <span className="opening-rule" style={{ animationDelay: "700ms" }} />

        <p className="opening-word">
          <SpacedWord text="Ngundang" startAtMs={900} stepMs={70} />
        </p>

        <p className="opening-tagline opening-fade" style={{ animationDelay: "1800ms" }}>
          Undangan digital yang membuat setiap tamu merasa istimewa
        </p>
      </div>

      <button type="button" className="opening-skip" onClick={handleSkip}>
        Lewati
      </button>
    </div>
  );
}
