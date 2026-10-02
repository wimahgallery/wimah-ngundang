import { safeHttpUrl } from "@/lib/utils";

export const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "api",
  "preview",
  "login",
  "favicon.ico",
];

export const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Aqiqah",
  "Birthday",
  "Corporate",
  "Other",
] as const;

export type Align = "left" | "center" | "right";
export type SizeToken = "sm" | "md" | "lg" | "xl";

export interface SectionSettings {
  visible: boolean;
  align: Align;
  headingSize: SizeToken;
  paragraphSize: SizeToken;
  sectionSpacing: Exclude<SizeToken, "xl">;
  imagePositionX: number;
  imagePositionY: number;
  zoom: number;
  rotate: number;
}

export type SectionKey =
  | "info"
  | "hero"
  | "greeting"
  | "couple"
  | "story"
  | "countdown"
  | "schedule"
  | "venue"
  | "gallery"
  | "video"
  | "gift"
  | "rsvp"
  | "wishes"
  | "funfacts"
  | "closing"
  | "music";

export interface FontSettings {
  heading: string | null;
  body: string | null;
  /** Font aksen opsional (mis. script untuk "The Wedding of"). Null/null string → ikut heading. */
  accent?: string | null;
}

export type CustomSettings = Record<SectionKey, SectionSettings> & { font?: FontSettings };

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  positionX: number;
  positionY: number;
  zoom: number;
  rotate: number;
}

export interface GiftAccount {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface StoryMilestone {
  id?: string;
  title: string;
  date: string;
  description: string;
  image?: string | null;
}

export interface AgendaEvent {
  id: string;
  name: string;
  date: string;
  time?: string | null;
  location?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
}

export interface FunFact {
  icon: string;
  label: string;
  value: string;
}

export interface SocialLinks {
  instagram?: string | null;
  twitter?: string | null;
}

export interface GuestWish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  user_id: string | null;
  slug: string;
  template_id: string;
  event_type: string | null;
  event_title: string | null;
  groom_name: string | null;
  bride_name: string | null;
  groom_nickname: string | null;
  bride_nickname: string | null;
  groom_photo: string | null;
  bride_photo: string | null;
  cover_image: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  google_maps_url: string | null;
  story_title: string | null;
  story_content: string | null;
  music_url: string | null;
  gallery_images: GalleryImage[];
  gift_accounts: GiftAccount[];
  custom_settings: CustomSettings;
  groom_image_position_x: number;
  groom_image_position_y: number;
  groom_image_zoom: number;
  groom_image_rotate: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;

  greeting_text?: string | null;
  recipient_name?: string | null;
  groom_parents?: string | null;
  bride_parents?: string | null;
  groom_social?: SocialLinks | null;
  bride_social?: SocialLinks | null;
  story_milestones?: StoryMilestone[] | null;
  events?: AgendaEvent[] | null;
  video_url?: string | null;
  video_poster?: string | null;
  rsvp_enabled?: boolean | null;
  fun_facts?: FunFact[] | null;
  closing_message?: string | null;
  closing_image?: string | null;
  qris_image?: string | null;
}

export function defaultSection(overrides: Partial<SectionSettings> = {}): SectionSettings {
  return {
    visible: true,
    align: "center",
    headingSize: "lg",
    paragraphSize: "md",
    sectionSpacing: "md",
    imagePositionX: 50,
    imagePositionY: 50,
    zoom: 100,
    rotate: 0,
    ...overrides,
  };
}

export function defaultCustomSettings(): CustomSettings {
  return {
    info: defaultSection(),
    hero: defaultSection({ headingSize: "xl", imagePositionY: 40 }),
    greeting: defaultSection(),
    couple: defaultSection(),
    story: defaultSection({ align: "left" }),
    countdown: defaultSection(),
    schedule: defaultSection(),
    venue: defaultSection(),
    gallery: defaultSection(),
    video: defaultSection(),
    gift: defaultSection(),
    rsvp: defaultSection(),
    wishes: defaultSection(),
    funfacts: defaultSection(),
    closing: defaultSection(),
    music: defaultSection({ headingSize: "sm" }),
    font: { heading: null, body: null, accent: null },
  };
}

export function normalizeInvitation(row: Record<string, unknown>): Invitation {
  const gallery = Array.isArray(row.gallery_images) ? row.gallery_images : [];
  const gifts = Array.isArray(row.gift_accounts) ? row.gift_accounts : [];
  const settings = {
    ...defaultCustomSettings(),
    ...((row.custom_settings as CustomSettings | null) ?? {}),
  };
  const milestones = Array.isArray(row.story_milestones) ? row.story_milestones : [];
  const facts = Array.isArray(row.fun_facts) ? row.fun_facts : [];
  const events = Array.isArray(row.events)
    ? (row.events as AgendaEvent[]).map((event, index) => ({
        ...event,
        id: event.id || `event-${index}`,
        mapsUrl: safeHttpUrl(event.mapsUrl),
      }))
    : [];

  return {
    ...(row as unknown as Invitation),
    slug: typeof row.slug === "string" ? row.slug : "",
    user_id: (row.user_id as string) ?? null,
    gallery_images: gallery as GalleryImage[],
    gift_accounts: gifts as GiftAccount[],
    custom_settings: settings,
    groom_image_position_x: Number(row.groom_image_position_x) || 50,
    groom_image_position_y: Number(row.groom_image_position_y) || 50,
    groom_image_zoom: Number(row.groom_image_zoom) || 100,
    groom_image_rotate: Number(row.groom_image_rotate) || 0,
    greeting_text: (row.greeting_text as string) ?? null,
    recipient_name: (row.recipient_name as string) ?? null,
    groom_parents: (row.groom_parents as string) ?? null,
    bride_parents: (row.bride_parents as string) ?? null,
    groom_social: (row.groom_social as SocialLinks) ?? null,
    bride_social: (row.bride_social as SocialLinks) ?? null,
    story_milestones: milestones as StoryMilestone[],
    events,
    google_maps_url: safeHttpUrl(row.google_maps_url),
    music_url: safeHttpUrl(row.music_url),
    video_url: safeHttpUrl(row.video_url),
    video_poster: (row.video_poster as string) ?? null,
    rsvp_enabled: row.rsvp_enabled === true || row.rsvp_enabled === "true",
    fun_facts: facts as FunFact[],
    closing_message: (row.closing_message as string) ?? null,
    closing_image: (row.closing_image as string) ?? null,
    qris_image: (row.qris_image as string) ?? null,
  };
}

export function coupleLabel(invitation: Invitation) {
  const bride = invitation.bride_name?.trim();
  const groom = invitation.groom_name?.trim();
  if (bride && groom) return `${bride} & ${groom}`;
  return invitation.event_title || invitation.slug;
}

/** Daftar agenda acara. Kalau `events` kosong, fallback ke tanggal/venue utama. */
export function agendaEvents(invitation: Invitation): AgendaEvent[] {
  const custom = (invitation.events ?? []).filter((event) => event.name || event.date);
  if (custom.length) return custom;

  if (!invitation.event_date && !invitation.event_time) return [];

  return [
    {
      id: "main-event",
      name: invitation.event_title || "Acara",
      date: invitation.event_date ?? "",
      time: invitation.event_time,
      location: invitation.venue_name,
      address: invitation.venue_address,
      mapsUrl: invitation.google_maps_url,
    },
  ];
}

function parseTimes(input?: string | null): Array<{ hours: number; minutes: number }> {
  if (!input) return [];
  const matches = input.matchAll(/(\d{1,2})[:.](\d{2})/g);
  const result: Array<{ hours: number; minutes: number }> = [];
  for (const match of matches) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours <= 23 && minutes <= 59) result.push({ hours, minutes });
    if (result.length === 2) break;
  }
  return result;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Link "Tambahkan ke Google Calendar".
 * `time` didukung format bebas seperti "15.00 WITA – Selesai".
 */
export function googleCalendarLink({
  title,
  date,
  time,
  location,
  details,
}: {
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  details?: string | null;
}): string {
  if (!date) return "";

  const params = new URLSearchParams();
  params.set("text", title);

  const [start, end] = parseTimes(time);
  if (start) {
    const finish = end ?? {
      hours: (start.hours + 3) % 24,
      minutes: start.minutes,
    };
    params.set(
      "dates",
      `${date}T${pad(start.hours)}${pad(start.minutes)}00/${date}T${pad(finish.hours)}${pad(finish.minutes)}00`,
    );
    params.set("ctz", "Asia/Makassar");
  } else {
    const next = new Date(`${date}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const nextDay = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
    params.set("dates", `${date}/${nextDay}`);
  }

  if (location) params.set("location", location);
  if (details) params.set("details", details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function headingClass(size: SizeToken) {
  switch (size) {
    case "sm":
      return "text-[clamp(1.5rem,1.25rem+1vw,1.875rem)]";
    case "md":
      return "text-[clamp(1.875rem,1.5rem+1.5vw,2.5rem)]";
    case "lg":
      return "text-[clamp(2.25rem,1.5rem+3vw,3.75rem)]";
    case "xl":
      return "text-[clamp(2.75rem,1.75rem+4vw,4.5rem)]";
  }
}

export function paragraphClass(size: SizeToken) {
  switch (size) {
    case "sm":
      return "text-[0.9375rem] leading-[1.7]";
    case "md":
      return "text-base leading-[1.7]";
    case "lg":
      return "text-[clamp(1.0625rem,1rem+0.3vw,1.25rem)] leading-[1.7]";
    case "xl":
      return "text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-[1.7]";
  }
}

export function spacingClass(size: Exclude<SizeToken, "xl">) {
  switch (size) {
    case "sm":
      return "py-[clamp(2.5rem,5vw,3.5rem)]";
    case "md":
      return "py-[clamp(3.5rem,7vw,6rem)]";
    case "lg":
      return "py-[clamp(5rem,10vw,9rem)]";
  }
}

export function alignClass(align: Align) {
  switch (align) {
    case "left":
      return "text-left items-start";
    case "right":
      return "text-right items-end";
    default:
      return "text-center items-center";
  }
}

export function objectPosition(x: number, y: number) {
  return `${x}% ${y}%`;
}
