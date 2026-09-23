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
  cover: "/example/couple-image-hug.webp",
  couple1: "/example/couple-image.webp",
  couple2: "/example/couple-image-looking.webp",
  venue: "/example/couple-image-sit.webp",
  gallery: [
    "/example/couple-image.webp",
    "/example/couple-image-hug.webp",
    "/example/couple-image-sit.webp",
    "/example/couple-image-looking.webp",
    "/example/couple-image.webp",
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
    tagline: "Klasik mewah dengan noise texture lembut dan aksen emas.",
    motion: "Fade up · soft parallax",
    bestFor: "Pernikahan formal",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    isPopular: true,
    palette: { screen: "#F5F3EE", ink: "#54524D", soft: "#E8E3D8", accent: "#7C8472" },
  },
  {
    id: "neo-brutalism",
    name: "Neo Brutalism",
    tagline: "Editorial berani dengan border tebal, bayangan keras, dan tekstur kertas.",
    motion: "Marquee · offset reveal · hard-shadow micro",
    bestFor: "Pernikahan modern & berani",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    palette: { screen: "#F4EFE6", ink: "#101010", soft: "#FFFFFF", accent: "#FF4D2E" },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    tagline: "Bersih, kontemporer dengan garis halus dan desain minimalis.",
    motion: "Fade · clean reveal",
    bestFor: "Pernikahan modern",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    palette: { screen: "#FFFFFF", ink: "#2D2D2D", soft: "#F5F5F5", accent: "#2D2D2D" },
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    tagline: "Gelap mewah dengan tekstur halus dan aksen emas royal.",
    motion: "Gold glow · dramatic reveal",
    bestFor: "Pernikahan mewah",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    palette: { screen: "#0F0F0F", ink: "#F5F3EE", soft: "#1A1A1A", accent: "#D4A853" },
  },
  {
    id: "garden-party",
    name: "Garden Party",
    tagline: "Cerah, lembut dengan tekstur natural dan warna pastel hijau.",
    motion: "Soft float · garden drift",
    bestFor: "Pernikahan outdoor",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    palette: { screen: "#FDF8F0", ink: "#4A5D4A", soft: "#F8F4EC", accent: "#A8C5A0" },
  },
  {
    id: "timeline-journey",
    name: "Timeline Journey",
    tagline: "Naratif hangat dengan tekstur lembut dan visual timeline personal.",
    motion: "Timeline scroll · story reveal",
    bestFor: "Pernikahan personal",
    features: ["Gallery", "Music", "RSVP", "Countdown", "Gift"],
    sectionCount: 14,
    palette: { screen: "#F0EDE6", ink: "#3D3228", soft: "#EDE8E0", accent: "#8B6F5E" },
  },
];

export const heroFeaturedTemplates: TemplateId[] = [
  "elegant-classic",
  "neo-brutalism",
  "modern-minimal",
  "dark-premium",
  "garden-party",
  "timeline-journey",
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
  description: "Tentukan desain dari 6 template premium dengan tekstur dan gaya unik.",
  detail: "Setiap template punya pola, tekstur, dan nuansa yang berbeda.",
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
  steps?: string[];
}

export const showcaseFaqs: ShowcaseFaq[] = [
  {
    question: "Bagaimana cara melakukan pemesanan?",
    answer:
      "Proses pemesanan sangat mudah. Setelah menentukan tema yang sesuai, ikuti langkah berikut:",
    steps: [
      "Pilih paket “Premium” pada katalog.",
      "Lengkapi data akun yang diperlukan.",
      "Lakukan pembayaran sesuai paket yang dipilih.",
      "Invoice akan dikirim secara otomatis ke email. Pastikan menggunakan alamat email yang masih aktif.",
      "Tentukan tema undangan yang ingin digunakan.",
      "Lengkapi formulir dan data acara yang dibutuhkan.",
      "Setelah data lengkap, undangan siap digunakan dan dibagikan kepada tamu.",
    ],
  },
  {
    question: "Apakah undangan bisa digabung dengan acara Metatah?",
    answer:
      "Tentu bisa. Undangan pernikahan dan acara Metatah dapat dibuat dalam satu link undangan, selama kedua acara masih berada dalam satu rangkaian atau waktu pelaksanaan yang berkaitan.",
  },
  {
    question: "Apakah undangan digital memiliki masa berlaku?",
    answer:
      "Ya. Undangan digital aktif hingga 1 tahun setelah tanggal pelaksanaan acara (hari-H).",
  },
  {
    question: "Apakah bisa menggunakan lokasi dan waktu acara yang berbeda?",
    answer:
      "Bisa. Jika memiliki beberapa rangkaian acara dengan lokasi maupun waktu yang berbeda, detail masing-masing acara dapat dicantumkan secara terpisah di dalam satu undangan.",
  },
  {
    question: "Apakah ada batasan jumlah nama tamu?",
    answer:
      "Tidak ada. Kamu dapat menambahkan dan membagikan undangan kepada sebanyak mungkin tamu tanpa biaya tambahan.",
  },
  {
    question: "Berapa banyak foto yang sebaiknya disiapkan?",
    answer:
      "Kami menyarankan sekitar 10-20 foto agar tampilan undangan tetap menarik sekaligus nyaman saat dibuka. Jumlah foto yang terlalu banyak dapat membuat ukuran undangan menjadi lebih besar sehingga waktu loading bisa lebih lama.",
  },
  {
    question: "Apakah sudah termasuk edit foto prewedding?",
    answer:
      "Belum. Foto yang digunakan pada undangan diharapkan sudah dalam kondisi final/edit dari fotografer.",
  },
  {
    question: "Bagaimana jika foto prewedding belum selesai diedit?",
    answer:
      "Tidak masalah. Kamu tetap dapat melakukan booking dan menyelesaikan proses pemesanan terlebih dahulu. Foto dapat ditambahkan atau diperbarui setelah hasil edit dari fotografer sudah selesai.",
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
  {
    id: "neo-brutalism",
    name: "Neo Brutalism",
    caption: "Editorial berani dengan border tebal dan bayangan keras.",
    date: "20 Agustus 2026",
    venue: "Ubud, Bali",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    caption: "Bersih, luas, dan fokus pada foto dengan desain kontemporer.",
    date: "25 Agustus 2026",
    venue: "Seminyak, Bali",
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    caption: "Gelap mewah dengan aksen emas yang megah.",
    date: "1 September 2026",
    venue: "Nusa Dua, Bali",
  },
  {
    id: "garden-party",
    name: "Garden Party",
    caption: "Cerah, lembut, dan penuh warna alam.",
    date: "5 September 2026",
    venue: "Uluwatu, Bali",
  },
  {
    id: "timeline-journey",
    name: "Timeline Journey",
    caption: "Cerita perjalanan cinta interaktif dengan timeline.",
    date: "10 September 2026",
    venue: "Canggu, Bali",
  },
];
