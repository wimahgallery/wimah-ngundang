import {
  Gift,
  Globe,
  Images,
  MapPin,
  Music4,
  Search,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { TemplateId } from "@/components/invitation/template-registry";

export const previewImages = {
  cover: "/template-preview/cover.jpg",
  couple1: "/template-preview/couple-1.jpg",
  couple2: "/template-preview/couple-2.jpg",
  venue: "/template-preview/venue.jpg",
  gallery: [
    "/template-preview/gallery-1.jpg",
    "/template-preview/gallery-2.jpg",
    "/template-preview/gallery-3.jpg",
    "/template-preview/gallery-4.jpg",
    "/template-preview/gallery-5.jpg",
  ],
} as const;

export interface TemplateShowcaseItem {
  id: TemplateId;
  name: string;
  tagline: string;
  motion: string;
  bestFor: string;
  features: string[];
  sectionCount: number;
  isPopular?: boolean;
  palette: {
    screen: string;
    ink: string;
    soft: string;
    accent: string;
  };
}

export const templateShowcase: TemplateShowcaseItem[] = [
  {
    id: "elegant-classic",
    name: "Elegant Classic",
    tagline: "Hero fullscreen dengan tipografi klasik yang tenang dan simetris.",
    motion: "Fade up · soft parallax",
    bestFor: "Pernikahan formal",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    isPopular: true,
    palette: { screen: "#F5F3EE", ink: "#54524D", soft: "#E8E3D8", accent: "#7C8472" },
  },
];

export const heroFeaturedTemplates: TemplateId[] = [
  "elegant-classic",
];


export interface ShowcaseFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const showcaseFeatures: ShowcaseFeature[] = [
  {
    icon: Globe,
    title: "Custom domain ready",
    description: "Pakai domain sendiri supaya link undangan terasa eksklusif dan mudah diingat.",
  },
  {
    icon: Music4,
    title: "Musik latar",
    description: "Pilih lagu favorit yang mengalun lembut saat tamu membuka undangan.",
  },
  {
    icon: Images,
    title: "Galeri foto",
    description: "Tampilkan foto prewedding dalam galeri rapi yang tetap ringan dibuka.",
  },
  {
    icon: MapPin,
    title: "Google Maps",
    description: "Tombol lokasi langsung membuka Google Maps agar tamu tidak tersesat.",
  },
  {
    icon: Gift,
    title: "Angpao digital",
    description: "Cantumkan rekening atau e-wallet untuk tanda kasih tanpa repot.",
  },
  {
    icon: Smartphone,
    title: "Mobile friendly",
    description: "Tampil sempurna di semua ukuran layar — mayoritas tamu membuka dari HP.",
  },
  {
    icon: Sparkles,
    title: "Animasi premium",
    description: "Motion halus dan terukur yang membuat undangan terasa hidup, bukan kaku.",
  },
  {
    icon: Search,
    title: "SEO friendly",
    description: "Judul, deskripsi, dan preview link tampil rapi saat dibagikan ke tamu.",
  },
];

export interface WorkflowStep {
  title: string;
  description: string;
  detail: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Pilih template",
    description: "Tentukan desain dari 10 template premium sesuai karakter acaramu.",
    detail: "Setiap template punya gerak dan nuansa yang berbeda.",
  },
  {
    title: "Isi data acara",
    description: "Lengkapi nama, jadwal, lokasi, galeri, dan cerita sambil melihat preview.",
    detail: "Editor dibuat sederhana, tanpa perlu keahlian teknis.",
  },
  {
    title: "Publish",
    description: "Undangan langsung aktif dengan link cantik yang siap dibagikan.",
    detail: "Bisa memakai slug nama pasangan atau custom domain.",
  },
  {
    title: "Bagikan link",
    description: "Kirim ke tamu lewat WhatsApp, Instagram, atau QR code undangan cetak.",
    detail: "Undangan tetap bisa diperbarui setelah dibagikan.",
  },
];

export interface ShowcaseFaq {
  question: string;
  answer: string;
}

export const showcaseFaqs: ShowcaseFaq[] = [
  {
    question: "Bagaimana cara memesan undangan digital Wimah Ngundang?",
    answer:
      "Pilih template favoritmu, lalu hubungi kami lewat WhatsApp. Tim kami akan menyiapkan undangan dan membantu proses pengisian data acara sampai undangan siap dibagikan.",
  },
  {
    question: "Apakah saya perlu keahlian teknis untuk mengisinya?",
    answer:
      "Tidak sama sekali. Semua dibuat sesederhana mengisi formulir: nama mempelai, jadwal, lokasi, cerita, galeri foto, dan rekening angpao digital. Kalau bingung, tim kami siap membantu.",
  },
  {
    question: "Bisakah undangan memakai domain sendiri?",
    answer:
      "Bisa. Undangan mendukung custom domain, jadi link bisa memakai nama pasangan atau domain pribadi agar terasa lebih personal dan profesional.",
  },
  {
    question: "Fitur apa saja yang sudah termasuk di dalam undangan?",
    answer:
      "Hero pembuka dengan nama pasangan, profil kedua mempelai, jadwal acara, peta lokasi lewat Google Maps, cerita perjalanan, galeri foto, angpao digital, dan musik latar yang bisa diputar tamu.",
  },
  {
    question: "Apakah data undangan masih bisa diubah setelah dipublish?",
    answer:
      "Tentu. Data acara masih bisa diperbarui setelah undangan aktif, termasuk mengganti foto atau menambah informasi baru. Kami bantu sampai semuanya pas.",
  },
  {
    question: "Bisa dipakai untuk acara selain pernikahan?",
    answer:
      "Bisa. Selain pernikahan, undangan Wimah Ngundang juga cocok untuk lamaran, aqiqah, ulang tahun, sampai acara korporat — cukup pilih template dan sesuaikan datanya.",
  },
  {
    question: "Berapa lama proses pembuatan undangannya?",
    answer:
      "Setelah data lengkap diterima, penyiapan undangan berjalan cepat. Jadwal pasti dan estimasi tercepat akan dikonfirmasi tim kami langsung melalui WhatsApp sesuai antrean saat itu.",
  },
];

export interface SampleInvitation {
  id: TemplateId;
  name: string;
  caption: string;
  date: string;
  venue: string;
}

export const sampleInvitations: SampleInvitation[] = [
  {
    id: "elegant-classic",
    name: "Elegant Classic",
    caption: "Pembuka fullscreen dengan entrance yang tenang dan elegan.",
    date: "15 Agustus 2026",
    venue: "Nusa Dua, Bali",
  },
];
