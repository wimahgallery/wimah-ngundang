import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-4 font-heading text-4xl">Undangan tidak ditemukan</h1>
      <p className="mt-3 max-w-md text-text-secondary">Tautan ini tidak tersedia atau belum dipublikasikan.</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/#creation"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
        >
          Lihat karya kami
        </Link>
      </div>
    </main>
  );
}
