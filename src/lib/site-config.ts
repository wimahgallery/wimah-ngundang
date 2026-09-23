const rawWhatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";

export const siteConfig = {
  name: "Wimah Ngundang",
  shortName: "Wimah",
  tagline: "Undangan digital premium yang siap dibagikan dalam hitungan menit.",
  description:
    "Wimah Ngundang membuat undangan digital pernikahan yang elegan, cepat diakses, dan mudah dibagikan lewat WhatsApp — lengkap dengan galeri foto, musik, Google Maps, dan angpao digital.",
  email: "halo@wimah.id",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const whatsappNumber = rawWhatsappNumber.replace(/\D/g, "");

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
} as const;

export const navigationLinks = [
  { href: "#template", label: "Template" },
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#contoh", label: "Contoh" },
  { href: "#faq", label: "FAQ" },
] as const;

export const heroTrustItems = [
  "6 template premium",
  "Mobile first",
  "Gratis konsultasi",
] as const;
