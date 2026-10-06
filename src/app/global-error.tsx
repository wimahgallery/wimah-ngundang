"use client";

import { useEffect } from "react";

/**
 * Menangani error yang terjadi di root layout (di luar jangkauan `error.tsx`).
 * Wajib me-render `<html>` dan `<body>` sendiri karena menggantikan layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#F5F3EE",
          color: "#141512",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7C8472",
            }}
          >
            Terjadi kesalahan
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "2rem", fontWeight: 500 }}>
            Ups, ada yang tidak beres
          </h1>
          <p style={{ margin: "0.75rem auto 0", maxWidth: "28rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#6e6b64" }}>
            Aplikasi gagal dimuat. Coba muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.75rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "9999px",
              border: 0,
              background: "#141512",
              color: "#F5F3EE",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
          {error.digest ? (
            <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#6e6b64" }}>
              Kode: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
