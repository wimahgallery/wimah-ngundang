"use client";

import { animated, useSpring } from "@react-spring/web";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { previewImages } from "@/lib/homepage-content";
import { durationCinematic, durationEase } from "@/components/motion/springs";
import { MockGrain, MockPhoto, MockScreen, type PreviewMotionProps } from "./shared";

const MARQUEE_HALF = "FOREVER ✳ TOGETHER ✳ LOVE ✳ 15.08.2026 ✳ ";

export default function NeoBrutalismPreview({ play, active }: PreviewMotionProps) {
  const reducedMotion = usePrefersReducedMotion();

  const pop = useSpring({
    from: { opacity: 0, y: 30 },
    to: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    immediate: reducedMotion,
    config: durationCinematic(1100),
  });

  const namePop = useSpring({
    from: { opacity: 0, y: 24 },
    to: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    delay: play ? 280 : 0,
    immediate: reducedMotion,
    config: durationCinematic(1000),
  });

  const card = useSpring({
    from: { x: 0, y: 0 },
    to: { x: active ? -4 : 0, y: active ? -4 : 0 },
    immediate: reducedMotion,
    config: durationEase(280),
  });

  const rule = useSpring({
    from: { scaleX: 0 },
    to: play ? { scaleX: 1 } : { scaleX: 0 },
    delay: play ? 560 : 0,
    immediate: reducedMotion,
    config: durationEase(900),
  });

  return (
    <MockScreen className="bg-[#F4EFE6] text-[#101010]">
      <MockGrain />

      {/* photo card */}
      <animated.div style={pop} className="absolute left-1/2 top-[14%] w-[60%] -translate-x-1/2">
        <animated.div style={card} className="relative">
          <div className="rotate-2 border-2 border-[#101010] bg-white p-1.5 shadow-[5px_5px_0_#101010]">
            <MockPhoto
              src={previewImages.couple1}
              alt="Preview template Neo Brutalism"
              className="aspect-[4/5] w-full border-2 border-[#101010]"
            />
          </div>
          <span className="absolute -right-3 -top-3 rotate-6 border-2 border-[#101010] bg-[#F7C8D4] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-[#101010] shadow-[2px_2px_0_#101010]">
            We&apos;re getting married
          </span>
        </animated.div>
      </animated.div>

      {/* giant couple name */}
      <animated.div style={namePop} className="absolute inset-x-0 bottom-9 px-3 text-center">
        <p className="font-sans text-[19px] font-black uppercase leading-[0.92] tracking-[-0.03em]">
          Rina
          <span className="mx-0.5 text-[#FF4D2E]">×</span>
          Budi
        </p>
        <animated.span
          style={rule}
          className="mx-auto mt-2 block h-1 w-14 bg-[#FF4D2E]"
        />
      </animated.div>

      {/* mini marquee */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t-2 border-[#101010] bg-[#101010] py-1.5 text-[#F4EFE6]">
        <div className="marquee-track flex w-max whitespace-nowrap text-[7px] font-black uppercase tracking-[0.2em]">
          <span className="pr-4">{MARQUEE_HALF}</span>
          <span className="pr-4">{MARQUEE_HALF}</span>
        </div>
      </div>
    </MockScreen>
  );
}
