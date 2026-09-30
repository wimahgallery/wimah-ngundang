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
    id: "lume",
    name: "Lume",
    tagline: "Klasik hangat dengan loading nama pasangan, agenda acara, dan galeri prewedding.",
    motion: "Fade up · soft parallax",
    bestFor: "Pernikahan formal",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    isPopular: true,
    palette: { screen: "#F5F3EE", ink: "#54524D", soft: "#E8E3D8", accent: "#7C8472" },
  },
  {
    id: "chocolate-dream",
    name: "Chocolate Dream",
    tagline: "Hangat cokelat dan krem lembut, romantis seperti cokelat leleh.",
    motion: "Fade up · warm reveal",
    bestFor: "Pernikahan hangat & romantis",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#FBF6EF", ink: "#3E2C21", soft: "#F1E6DA", accent: "#8A5A3B" },
  },
  {
    id: "true-potential",
    name: "True Potential",
    tagline: "Hijau pekat dan putih bersih untuk hari penuh harapan baru.",
    motion: "Fade up · clean drift",
    bestFor: "Pernikahan modern & berkelanjutan",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#F6F8F6", ink: "#16211B", soft: "#E6EDE8", accent: "#2F6B4F" },
  },
  {
    id: "ivory-dream",
    name: "Ivory Dream",
    tagline: "Gading lembut dengan serif romantis dan aksen emas pudar.",
    motion: "Soft parallax · airy reveal",
    bestFor: "Pernikahan klasik romantis",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#FCFAF4", ink: "#4A4238", soft: "#F4EFE3", accent: "#9C7F55" },
  },
  {
    id: "milky-white",
    name: "Milky White",
    tagline: "Putih susu yang lapang, bersih, dan tenang tanpa distraksi.",
    motion: "Slow reveal · quiet drift",
    bestFor: "Pernikahan minimalis",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#FFFFFF", ink: "#2B2B29", soft: "#F4F4F2", accent: "#6E7C86" },
  },
  {
    id: "simple-black",
    name: "Simple Black",
    tagline: "Monokrom hitam putih, tegas dan tanpa ornamen berlebih.",
    motion: "Hard fade · precise reveal",
    bestFor: "Pernikahan modern & urban",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#FFFFFF", ink: "#111111", soft: "#F5F5F5", accent: "#111111" },
  },
  {
    id: "elegant-black",
    name: "Elegant Black",
    tagline: "Halaman gelap mewah dengan aksen emas yang menyala di tiap section.",
    motion: "Gold glow · cinematic reveal",
    bestFor: "Pernikahan mewah",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    isPopular: true,
    palette: { screen: "#0C0C0B", ink: "#F2EFE8", soft: "#161614", accent: "#C9A227" },
  },
  {
    id: "sora",
    name: "Sora",
    tagline: "Tipografi geometris dan aksen indigo berani untuk pasangan modern.",
    motion: "Geometric reveal · crisp slide",
    bestFor: "Pernikahan modern & kekinian",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#F7F7FB", ink: "#1A1A24", soft: "#ECECF6", accent: "#4F46E5" },
  },
  {
    id: "aka",
    name: "Aka",
    tagline: "Merah bata dan hitam dengan sentuhan oriental yang elegan.",
    motion: "Slow reveal · accent sweep",
    bestFor: "Pernikahan bertema oriental",
    features: ["Gallery", "Music", "Countdown", "Agenda", "Gift"],
    sectionCount: 11,
    palette: { screen: "#FBFAF8", ink: "#1A1614", soft: "#F2EDE7", accent: "#B3261E" },
  },
];

export const heroFeaturedTemplates: TemplateId[] = [
  "lume",
  "chocolate-dream",
  "true-potential",
  "ivory-dream",
  "milky-white",
  "simple-black",
  "elegant-black",
  "sora",
  "aka",
];


export interface BestCreation {
  id: string;
  image: string;
  title: string;
  description: string;
}

export const bestCreationsRowOne: BestCreation[] = [
  {
    id: "rina-pradipta",
    image: "/template-preview/cover.jpg",
    title: "Rina & Pradipta",
    description: "Lume dengan pembuka fullscreen, aksen emas, dan galeri prewedding.",
  },
  {
    id: "ayu-wayan",
    image: "/template-preview/gallery-1.jpg",
    title: "Ayu & Wayan",
    description: "True Potential yang cerah dengan musik latar lembut dan peta lokasi acara.",
  },
  {
    id: "diah-yogi",
    image: "/template-preview/couple-1.jpg",
    title: "Diah & Yogi",
    description: "Rangkaian Metatah dan pernikahan digabung dalam satu link undangan.",
  },
  {
    id: "intan-dewa",
    image: "/template-preview/gallery-2.jpg",
    title: "Intan & Dewa",
    description: "Milky White yang bersih, cepat dibuka, dan nyaman dibaca dari HP.",
  },
  {
    id: "nilla-rio",
    image: "/template-preview/gallery-3.jpg",
    title: "Nilla & Rio",
    description: "Elegant Black dengan countdown, save the date, dan angpao digital.",
  },
  {
    id: "sinta-bagas",
    image: "/template-preview/gallery-5.jpg",
    title: "Sinta & Bagas",
    description: "Sora yang bercerita dari pertama bertemu sampai hari bahagia.",
  },
];

export const bestCreationsRowTwo: BestCreation[] = [
  {
    id: "maya-ardi",
    image: "/example/couple-image-hug.webp",
    title: "Maya & Ardi",
    description: "Undangan romantic dengan video prewedding dan RSVP online untuk tamu.",
  },
  {
    id: "putri-kevin",
    image: "/template-preview/couple-2.jpg",
    title: "Putri & Kevin",
    description: "Simple Black berani dengan tipografi tegas dan kontras monokrom.",
  },
  {
    id: "lenny-angga",
    image: "/example/couple-image.webp",
    title: "Lenny & Angga",
    description: "Clean dan hangat, lengkap dengan love story serta buku tamu digital.",
  },
  {
    id: "kinasih-adi",
    image: "/example/couple-image-sit.webp",
    title: "Kinasih & Adi",
    description: "Klasik hangat dengan galeri foto rapi dan tombol Google Maps.",
  },
  {
    id: "maicha-rizky",
    image: "/example/couple-image-looking.webp",
    title: "Maicha & Rizky",
    description: "Outdoor celebration dengan paleta pastel dan musik pilihan pasangan.",
  },
  {
    id: "sekar-danu",
    image: "/template-preview/gallery-4.jpg",
    title: "Sekar & Danu",
    description: "Elegan sederhana yang siap dibagikan ke ribuan tamu tanpa biaya tambahan.",
  },
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
    id: "lume",
    name: "Lume",
    caption: "Pembuka fullscreen dengan entrance yang tenang dan elegan.",
    date: "15 Agustus 2026",
    venue: "Nusa Dua, Bali",
  },
];
