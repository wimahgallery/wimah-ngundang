"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryProvider } from "@/components/providers/query-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(() => setAuthorized(true))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EE]">
        <div className="text-sm text-[#6e6b64]" role="status">Memuat…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <main className="mx-auto w-full max-w-[min(100%,80rem)] px-[clamp(1rem,0.5rem+2vw,2rem)] py-[clamp(1.25rem,1rem+1vw,2rem)]">
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  );
}
