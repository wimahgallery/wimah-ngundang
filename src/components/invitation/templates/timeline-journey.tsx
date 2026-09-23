"use client";

import { type Invitation, type SectionSettings } from "@/lib/invitation";
import {
  CoupleNames,
  DecorativeDivider,
  GiftList,
  InvitationPhoto,
  MapsButton,
  SectionCopy,
  SectionHeading,
  SectionKicker,
  CountdownTimer,
  VideoPlayer,
} from "../shared";

function Section({ settings, children, className, id }: { settings: SectionSettings; className?: string; id?: string; children: React.ReactNode }) {
  if (!settings.visible) return null;
  return (
    <section id={id} className={`texture-noise relative px-[clamp(1.5rem,4vw,3rem)] py-[clamp(3.5rem,6vw,6rem)] ${className ?? ""}`}>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#8B6F5E]" />
      <div className="mx-auto max-w-4xl">{children}</div>
    </section>
  );
}

function HeroCover({ invitation }: { invitation: Invitation }) {
  const h = invitation.custom_settings.hero;
  return (
    <section className="relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden bg-[#F0EDE6] sm:min-h-[100svh]">
      <InvitationPhoto src={invitation.cover_image} alt="Cover" className="absolute inset-0 h-full w-full" positionX={h.imagePositionX} positionY={h.imagePositionY} zoom={h.zoom} rotate={h.rotate} priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0EDE6]/50 via-[#F0EDE6]/80 to-[#F0EDE6]" />
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-[clamp(1.5rem,5vw,2rem)] text-center">
        <p className="text-[10px] uppercase tracking-[clamp(0.1em,0.06rem+0.4vw,0.28em)] text-[#8B6F5E]/60 sm:text-xs">{invitation.hero_title || "The Wedding"}</p>
        <h1 className="mt-4 font-heading text-[clamp(2.25rem,1.5rem+4vw,4.5rem)] text-balance text-[#3D3228]"><CoupleNames invitation={invitation} /></h1>
        {invitation.event_date && <p className="mt-4 text-sm tracking-wide text-[#3D3228]/70 sm:text-base">{new Date(invitation.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>}
        {invitation.hero_subtitle && <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#3D3228]/65 sm:text-base">{invitation.hero_subtitle}</p>}
        <button type="button" onClick={() => document.getElementById("greeting")?.scrollIntoView({ behavior: "smooth" })} className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#8B6F5E]/40 bg-[#8B6F5E] px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#8B6F5E]/80">
          Buka Undangan
        </button>
      </div>
    </section>
  );
}

function GreetingSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.hero;
  return (
    <Section settings={s} id="greeting" className="bg-[#F0EDE6]">
      <SectionKicker>Greeting</SectionKicker>
      <SectionHeading settings={s}><span className="text-[#8B6F5E]">{invitation.bride_nickname || invitation.bride_name}</span> & <span className="text-[#8B6F5E]">{invitation.groom_nickname || invitation.groom_name}</span></SectionHeading>
      <SectionCopy settings={s}>{invitation.story_content?.split(/\n\n+/)[0] || "Kami mengundang Anda untuk hadir dalam momen bahagia ini."}</SectionCopy>
    </Section>
  );
}

function CoupleSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.couple;
  return (
    <Section settings={s} className="bg-[#EDE8E0]">
      <SectionKicker>Mempelai</SectionKicker>
      <SectionHeading settings={s}>Mempertemukan Hati</SectionHeading>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <InvitationPhoto src={invitation.bride_photo} alt={invitation.bride_name || "Mempelai wanita"} className="aspect-[3/4] rounded-xl shadow-lg" positionX={s.imagePositionX} positionY={s.imagePositionY} zoom={s.zoom} rotate={s.rotate} sizes="(max-width: 768px) 100vw, 50vw" />
        <InvitationPhoto src={invitation.groom_photo} alt={invitation.groom_name || "Mempelai pria"} className="aspect-[3/4] rounded-xl shadow-lg" positionX={invitation.groom_image_position_x} positionY={invitation.groom_image_position_y} zoom={invitation.groom_image_zoom} rotate={invitation.groom_image_rotate} sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <p className="mt-6 text-center font-heading text-xl text-[#8B6F5E]"><CoupleNames invitation={invitation} /></p>
    </Section>
  );
}

function StoryTimeline({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.story;
  const milestones = invitation.story_milestones;
  if (!(milestones?.length) || !s.visible) return null;
  return (
    <Section settings={s} id="story" className="bg-[#F0EDE6]">
      <SectionKicker>Perjalanan Cinta</SectionKicker>
      <SectionHeading settings={s}>Cerita Kami</SectionHeading>
      <div className="mt-8 space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="relative flex gap-4 pl-8 border-l-2 border-[#8B6F5E]/30">
            <div className="absolute -left-[22px] top-1 h-4 w-4 rounded-full bg-[#8B6F5E]" />
            <div>
              <p className="font-heading text-lg text-[#3D3228]">{m.title}</p>
              <p className="text-xs text-[#8B6F5E]/70">{m.date}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#3D3228]/60">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CountdownSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.schedule;
  return (
    <Section settings={s} id="countdown" className="bg-[#EDE8E0]">
      <SectionKicker>Hitung Mundur</SectionKicker>
      <SectionHeading settings={s}>Momen Bahagia</SectionHeading>
      <CountdownTimer eventDate={invitation.event_date} />
    </Section>
  );
}

function ScheduleSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.schedule;
  return (
    <Section settings={s} id="schedule" className="bg-[#F0EDE6]">
      <SectionKicker>Jadwal</SectionKicker>
      <SectionHeading settings={s}>Acara Kami</SectionHeading>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {invitation.event_date && <div className="rounded-xl border border-[#8B6F5E]/20 bg-white p-5"><p className="text-xs uppercase tracking-wider text-[#8B6F5E]/70">Tanggal</p><p className="mt-1 font-heading text-lg text-[#3D3228]">{new Date(invitation.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>}
        {invitation.event_time && <div className="rounded-xl border border-[#8B6F5E]/20 bg-white p-5"><p className="text-xs uppercase tracking-wider text-[#8B6F5E]/70">Waktu</p><p className="mt-1 font-heading text-lg text-[#3D3228]">{invitation.event_time}</p></div>}
      </div>
    </Section>
  );
}

function VenueSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.venue;
  return (
    <Section settings={s} id="venue" className="bg-[#F0EDE6]">
      <SectionKicker>Lokasi</SectionKicker>
      <SectionHeading settings={s}>Tempat Acara</SectionHeading>
      <div className="mt-6 space-y-4">
        {invitation.venue_name && <p className="font-heading text-xl text-[#3D3228]">{invitation.venue_name}</p>}
        {invitation.venue_address && <p className="text-sm leading-relaxed text-[#3D3228]/60">{invitation.venue_address}</p>}
        <MapsButton invitation={invitation} />
      </div>
    </Section>
  );
}

function GallerySection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.gallery;
  const images = invitation.gallery_images;
  if (!images.length || !s.visible) return null;
  return (
    <Section settings={s} id="gallery" className="bg-[#EDE8E0]">
      <SectionKicker>Galeri</SectionKicker>
      <SectionHeading settings={s}>Momen Terindah</SectionHeading>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.slice(0, 6).map((img) => (
          <InvitationPhoto key={img.id} src={img.url} alt={img.alt || ""} className="aspect-square rounded-xl object-cover" positionX={img.positionX} positionY={img.positionY} zoom={img.zoom} rotate={img.rotate} sizes="(max-width: 640px) 50vw, 33vw" />
        ))}
      </div>
    </Section>
  );
}

function VideoSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.video;
  return (
    <Section settings={s} id="video" className="bg-[#F0EDE6]">
      <SectionKicker>Video</SectionKicker>
      <SectionHeading settings={s}>Tayangan</SectionHeading>
      <VideoPlayer url={invitation.video_url} poster={invitation.video_poster} className="mt-6" />
    </Section>
  );
}

function GiftSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.gift;
  return (
    <Section settings={s} id="gift" className="bg-[#EDE8E0]">
      <SectionKicker>Amal</SectionKicker>
      <SectionHeading settings={s}>Angpao Digital</SectionHeading>
      <GiftList invitation={invitation} />
    </Section>
  );
}

function RsvpSection({ invitation }: { invitation: Invitation }) {
  const s = invitation.custom_settings.closing;
  return (
    <Section settings={s} id="rsvp" className="bg-[#F0EDE6]">
      <SectionKicker>Konfirmasi</SectionKicker>
      <SectionHeading settings={s}>Kehadiran Anda</SectionHeading>
      <p className="mt-2 text-sm leading-relaxed text-[#3D3228]/60">Konfirmasi kehadiran Anda melalui tombol di bawah ini.</p>
      <a href={`/${invitation.slug}`} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#8B6F5E] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#8B6F5E]/80">Konfirmasi Kehadiran</a>
    </Section>
  );
}

function WishesSection({ invitation }: { invitation: Invitation }) {
  return (
    <Section settings={invitation.custom_settings.wishes} id="wishes" className="bg-[#EDE8E0]">
      <SectionKicker>Doa & Harapan</SectionKicker>
      <SectionHeading settings={invitation.custom_settings.wishes}>Harapan Kami</SectionHeading>
      <p className="mt-2 text-sm leading-relaxed text-[#3D3228]/60">Doa dan harapan terbaik dari keluarga.</p>
    </Section>
  );
}

function FunFactsSection({ invitation }: { invitation: Invitation }) {
  return (
    <Section settings={invitation.custom_settings.funfacts} className="bg-[#F0EDE6]">
      <SectionKicker>Trivia</SectionKicker>
      <SectionHeading settings={invitation.custom_settings.funfacts}>Tentang Kami</SectionHeading>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#8B6F5E]/20 bg-white p-4 text-center"><p className="text-2xl">🗺️</p><p className="mt-2 text-xs text-[#3D3228]/60">First Meeting</p></div>
        <div className="rounded-xl border border-[#8B6F5E]/20 bg-white p-4 text-center"><p className="text-2xl">🎀</p><p className="mt-2 text-xs text-[#3D3228]/60">Proposal</p></div>
        <div className="rounded-xl border border-[#8B6F5E]/20 bg-white p-4 text-center"><p className="text-2xl">💍</p><p className="mt-2 text-xs text-[#3D3228]/60">Wedding Day</p></div>
      </div>
    </Section>
  );
}

function ClosingSection({ invitation }: { invitation: Invitation }) {
  return (
    <Section settings={invitation.custom_settings.closing} className="bg-[#EDE8E0]">
      <div className="mx-auto max-w-md text-center">
        <DecorativeDivider className="mb-8" />
        <h2 className="font-heading text-[clamp(1.5rem,1.25rem+1.2vw,2rem)] text-[#8B6F5E]">Terima Kasih</h2>
        <p className="mt-4 text-sm leading-relaxed text-[#3D3228]/60">{invitation.closing_message || "Atas kehadiran dan doa restu Anda."}</p>
        <div className="mt-8 font-heading text-xl text-[#3D3228]"><CoupleNames invitation={invitation} /></div>
        <DecorativeDivider className="mt-8" />
      </div>
    </Section>
  );
}

export default function TimelineJourney({ invitation }: { invitation: Invitation }) {
  return (
    <div className="relative bg-blob-6 text-[#3D3228]">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 60% 40%, rgba(139,111,94,0.05) 0%, transparent 40%)" }} />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B6F5E]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B6F5E]/40 to-transparent" />
      <HeroCover invitation={invitation} />
      <div className="mx-auto max-w-4xl">
        <GreetingSection invitation={invitation} />
        <CoupleSection invitation={invitation} />
        <StoryTimeline invitation={invitation} />
        <CountdownSection invitation={invitation} />
        <ScheduleSection invitation={invitation} />
        <VenueSection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <VideoSection invitation={invitation} />
        <GiftSection invitation={invitation} />
        <RsvpSection invitation={invitation} />
        <WishesSection invitation={invitation} />
        <FunFactsSection invitation={invitation} />
        <ClosingSection invitation={invitation} />
        <div className="mt-16 text-center relative">
          <div className="inline-block w-4 h-4 rounded-full bg-[#8B6F5E] mb-4" />
          <DecorativeDivider />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#3D3228]/60">Perjalanan cinta</p>
        </div>
      </div>
    </div>
  );
}
