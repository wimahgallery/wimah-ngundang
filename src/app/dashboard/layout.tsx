"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QueryProvider } from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/invitations", label: "Undangan" },
  { href: "/dashboard/music", label: "Musik" },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const horizontal = "px-[clamp(1rem,0.5rem+2vw,2rem)]";

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <header className="border-b border-border/60 bg-white/60">
        <div className={`mx-auto flex w-full max-w-[min(100%,80rem)] items-center gap-2 py-3 ${horizontal}`}>
          <nav aria-label="Menu dashboard" className="flex flex-wrap gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full border px-4 text-sm transition",
                    active
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-white text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main id="main" className={`mx-auto w-full max-w-[min(100%,80rem)] py-[clamp(1.25rem,1rem+1vw,2rem)] ${horizontal}`}>
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  );
}
