/**
 * Nomor WhatsApp resmi Wimah.
 *
 * Sengaja tidak dibaca dari `NEXT_PUBLIC_WHATSAPP_NUMBER`: variabel itu di
 * proyek Vercel masih menyimpan angka contoh (`6281234567890`), sehingga nomor
 * placeholder bocor ke production (footer, CTA, dan tombol mengambang).
 * Ubah di sini bila nomor berganti.
 */
export const siteConfig = {
  name: "Wimah Ngundang",
  shortName: "Wimah",
  tagline: "Undangan digital premium yang siap dibagikan dalam hitungan menit.",
  description:
    "Wimah Ngundang membuat undangan digital pernikahan yang elegan, cepat diakses, dan mudah dibagikan lewat WhatsApp — lengkap dengan galeri foto, musik, Google Maps, dan angpao digital.",
  email: "wimahgallery@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const whatsappNumber = "6287740812765";

export const whatsappDisplay = `+${whatsappNumber}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const waMessages = {
  hero: "Halo Wimah Ngundang, saya ingin membuat undangan digital. Boleh dibantu info paket dan prosesnya?",
  order: "Halo Wimah Ngundang, saya siap pesan undangan digital. Mohon info langkah selanjutnya ya.",
  template: (name: string) =>
    `Halo Wimah Ngundang, saya tertarik dengan template "${name}". Mohon info paket dan contoh undangannya ya.`,
  footer: "Halo Wimah Ngundang, saya ingin bertanya tentang layanan undangan digital.",
  features:
    "Halo Wimah Ngundang, saya ingin konsultasi fitur undangan (misal RSVP, buku tamu digital, atau fitur khusus lainnya).",
  photobooth:
    "Halo WIMAH Photobooth, saya tertarik untuk booking Photobooth / Mingle Booth untuk acara saya.\n\nTanggal Acara: \nVenue / Lokasi: \nJenis Acara: (Wedding/ Birthday/ Corporate/ dll)\n\nApakah tanggal tersebut masih tersedia?",
} as const;

/** Sosial media resmi Wimah — dipakai di footer dan tombol mengambang. */
export const socials = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/wimah.photobooth" },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@wimah.photobooth" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1ErSHgv2nu/" },
  { id: "threads", label: "Threads", href: "https://www.threads.com/@wimah.photobooth" },
] as const;

/** Tautan WhatsApp tanpa pesan — dipakai tombol mengambang. */
export const whatsappChatUrl = `https://wa.me/${whatsappNumber}`;

export const navigationLinks = [
  { href: "#creation", label: "Best Creation" },
  { href: "#template", label: "Template" },
  { href: "#fitur", label: "Fitur" },
  { href: "#faq", label: "FAQ" },
] as const;

export const heroTrustItems = [
  "9 template premium",
  "Mobile first",
  "Gratis konsultasi",
] as const;
