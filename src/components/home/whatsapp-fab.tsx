import { whatsappChatUrl } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/home/social-icons";

/**
 * Tombol WhatsApp mengambang (pojok kanan bawah) di halaman utama.
 * Membuka chat langsung tanpa pesan bawaan.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappChatUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Wimah Ngundang"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
