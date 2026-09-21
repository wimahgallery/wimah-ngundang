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

export type CustomSettings = Record<SectionKey, SectionSettings>;

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
  title: string;
  date: string;
  description: string;
  image?: string | null;
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

  return {
    ...(row as unknown as Invitation),
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
    video_url: (row.video_url as string) ?? null,
    video_poster: (row.video_poster as string) ?? null,
    rsvp_enabled: row.rsvp_enabled === true,
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

export function headingClass(size: SizeToken) {
  switch (size) {
    case "sm":
      return "text-2xl sm:text-3xl";
    case "md":
      return "text-3xl sm:text-4xl";
    case "lg":
      return "text-4xl sm:text-5xl lg:text-6xl";
    case "xl":
      return "text-5xl sm:text-6xl lg:text-7xl";
  }
}

export function paragraphClass(size: SizeToken) {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
  }
}

export function spacingClass(size: Exclude<SizeToken, "xl">) {
  switch (size) {
    case "sm":
      return "py-10 sm:py-14";
    case "md":
      return "py-16 sm:py-24";
    case "lg":
      return "py-24 sm:py-36";
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
