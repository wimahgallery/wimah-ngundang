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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className={`mx-auto flex w-full max-w-[min(100%,80rem)] items-center gap-3 py-2.5 ${horizontal}`}>
          <Link
            href="/dashboard"
            className="font-heading text-base tracking-wide text-foreground"
          >
            Wimah<span className="text-primary">.</span>
          </Link>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <nav aria-label="Menu dashboard" className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-md px-3 text-sm transition",
                    active
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
