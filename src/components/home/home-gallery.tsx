"use client";

import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "./section-intro";

const ROW_1 = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop", alt: "Wedding couple" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop", alt: "Wedding ceremony" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=400&fit=crop", alt: "Outdoor venue" },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=400&fit=crop", alt: "Wedding rings" },
  { src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop", alt: "Flowers" },
  { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop", alt: "Reception" },
  { src: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=600&h=400&fit=crop", alt: "Couple portrait" },
  { src: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop", alt: "Garden party" },
];

const ROW_2 = [
  { src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=400&fit=crop", alt: "Dance" },
  { src: "https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?w=600&h=400&fit=crop", alt: "Cake" },
  { src: "https://images.unsplash.com/photo-1521316730702-829a8e30dfd0?w=600&h=400&fit=crop", alt: "Bouquet toss" },
  { src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=400&fit=crop", alt: "Table setting" },
  { src: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&h=400&fit=crop", alt: "Candles" },
  { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop", alt: "Venue decor" },
  { src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&h=400&fit=crop", alt: "Guests" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=400&fit=crop", alt: "First dance" },
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
  const doubled = [...images, ...images];
  const animationName = direction === "left" ? "scroll-left" : "scroll-right";

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f5f3ee] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5f3ee] to-transparent sm:w-24" />

      <div
        className="flex gap-4"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          width: "max-content",
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="group relative h-48 w-64 shrink-0 overflow-hidden rounded-xl sm:h-56 sm:w-72 md:h-64 md:w-80"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeGallery() {
  return (
    <section
      id="galeri"
      className="scroll-mt-24 bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:py-28"
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
