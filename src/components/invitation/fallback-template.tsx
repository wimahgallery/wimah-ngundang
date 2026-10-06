"use client";

import { useEffect } from "react";
import type { Invitation } from "@/lib/invitation";

export function FallbackTemplate({ invitation }: { invitation: Invitation }) {
  // Halaman undangan memasang `data-invitation-locked` lewat inline script sebelum
  // React jalan. Kalau chunk template gagal dimuat, tidak ada template sama sekali
  // yang melepasnya — lepas di sini supaya halaman tidak terkunci selamanya.
  useEffect(() => {
    document.documentElement.removeAttribute("data-invitation-locked");
  }, []);

  return (
    <div className="min-h-[100svh] bg-background px-[clamp(1.5rem,5vw,2rem)] py-20 text-center">
      <p className="text-sm text-text-secondary">Template tidak dapat dimuat. Menggunakan template default.</p>
      <h1 className="mt-4 font-heading text-4xl">{invitation.event_title || invitation.slug}</h1>
    </div>
  );
}
