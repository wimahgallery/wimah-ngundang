import Image from "next/image";
import { bestCreationsRowOne, bestCreationsRowTwo, type BestCreation } from "@/lib/homepage-content";
import { SectionIntro } from "./section-intro";
import { cn } from "@/lib/utils";

function CreationCard({ item, muted }: { item: BestCreation; muted: boolean }) {
  return (
    <figure
      className="group me-3 w-[56vw] max-w-[220px] shrink-0 md:max-w-none desk:me-5 desk:w-[330px]"
      aria-hidden={muted || undefined}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface md:rounded-xl">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 768px) 330px, 56vw"
          loading="lazy"
          decoding="async"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <figcaption className="mt-2.5 md:mt-3.5">
        <h3 className="font-heading text-base leading-snug text-text-primary md:text-lg">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary md:line-clamp-none md:text-sm">
          {item.description}
        </p>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ items, direction }: { items: BestCreation[]; direction: "right" | "left" }) {
  const copies = [...items, ...items];

  return (
    // `marquee-fade` ada di viewport (bukan di track yang digeser): mask yang
    // menempel di elemen ber-transform ikut bergeser sehingga fade-nya tidak
    // pernah terlihat di tepi layar.
    <div className="marquee-row marquee-fade relative overflow-hidden">
      <div
        className={cn(
          "flex w-max will-change-transform",
          direction === "right" ? "marquee-right" : "marquee-left",
        )}
      >
        {copies.map((item, index) => (
          <CreationCard key={`${item.id}-${index}`} item={item} muted={index >= items.length} />
        ))}
      </div>
    </div>
  );
}

export function OurBestCreation() {
  return (
    <section id="creation" className="scroll-mt-8 px-5 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
      <div className="mx-auto max-w-3xl">
        <SectionIntro
          kicker="Our Best Creation"
          title="Karya terbaik yang pernah kami buat"
          description="Deretan undangan nyata yang sudah dibagikan ke ribuan tamu — dari klasik elegan sampai cerita perjalanan cinta."
        />
      </div>

      <div className="mt-9 flex flex-col gap-4 sm:mt-14 md:gap-6">
        <MarqueeRow items={bestCreationsRowOne} direction="right" />
        <MarqueeRow items={bestCreationsRowTwo} direction="left" />
      </div>
    </section>
  );
}
