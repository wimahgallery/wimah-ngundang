"use client";

import { useEffect } from "react";

/**
 * Error boundary level app — menangkap crash runtime di route mana pun
 * (editor, dashboard, halaman undangan) supaya pengguna mendapat tombol
 * pemulihan, bukan halaman kosong bawaan Next.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Terjadi kesalahan</p>
      <h1 className="mt-4 font-heading text-4xl text-text-primary">
        Ups, ada yang tidak beres
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
        Halaman ini gagal dimuat. Coba muat ulang, atau kembali lagi sebentar lagi.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="min-h-11 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition hover:opacity-90"
        >
          Coba lagi
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-full border border-border px-6 text-sm font-medium text-text-primary transition hover:bg-surface"
        >
          Muat ulang halaman
        </button>
      </div>
      {error.digest ? (
        <p className="mt-5 text-xs text-text-secondary">Kode: {error.digest}</p>
      ) : null}
    </div>
  );
}
