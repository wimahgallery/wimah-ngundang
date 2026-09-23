"use client";

import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";

const ROW_1 = [
  { src: "/example/couple-image.webp", alt: "Couple portrait" },
  { src: "/example/couple-image-hug.webp", alt: "Couple hug" },
  { src: "/example/couple-image-sit.webp", alt: "Couple sitting" },
  { src: "/example/couple-image-looking.webp", alt: "Couple looking" },
  { src: "/example/couple-image.webp", alt: "Couple portrait" },
  { src: "/example/couple-image-hug.webp", alt: "Couple hug" },
  { src: "/example/couple-image-sit.webp", alt: "Couple sitting" },
  { src: "/example/couple-image-looking.webp", alt: "Couple looking" },
];

const ROW_2 = [
  { src: "/example/couple-image-looking.webp", alt: "Couple looking" },
  { src: "/example/couple-image-sit.webp", alt: "Couple sitting" },
  { src: "/example/couple-image-hug.webp", alt: "Couple hug" },
  { src: "/example/couple-image.webp", alt: "Couple portrait" },
  { src: "/example/couple-image-looking.webp", alt: "Couple looking" },
  { src: "/example/couple-image-sit.webp", alt: "Couple sitting" },
  { src: "/example/couple-image-hug.webp", alt: "Couple hug" },
  { src: "/example/couple-image.webp", alt: "Couple portrait" },
];

function CarouselRow({
  images,
  direction,
  duration,
}: {
  images: typeof ROW_1;
  direction: "left" | "right";
  duration: number;
}) {
  const animationName = direction === "left" ? "scroll-left" : "scroll-right";
  const copy = (
    <div className="flex shrink-0 gap-4 pr-4">
      {images.map((img, i) => (
        <div
          key={`${img.src}-${i}`}
          className="group relative h-48 w-64 shrink-0 overflow-hidden rounded-xl sm:h-56 sm:w-72 md:h-64 md:w-80"
        >
          <img
            src={img.src}
            alt={img.alt}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f5f3ee] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5f3ee] to-transparent sm:w-24" />

      <div
        className="flex"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          width: "max-content",
        }}
      >
        {copy}
        <div aria-hidden="true">{copy}</div>
      </div>
    </div>
  );
}

export function HomeGallery() {
  return (
    <section
      id="galeri"
      className="scroll-mt-8 bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:py-28"
    >
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <SectionIntro
          tone="light"
          kicker="Galeri"
          title="Setiap momen punya tempat"
          description="Lihat bagaimana undangan digital terlihat dalam berbagai gaya — dari formal intim hingga pesta meriah."
        />

        <div className="mt-14 flex flex-col gap-4">
          <Reveal delay={0} distance={20}>
            <CarouselRow images={ROW_1} direction="left" duration={30} />
          </Reveal>
          <Reveal delay={150} distance={20}>
            <CarouselRow images={ROW_2} direction="right" duration={35} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
