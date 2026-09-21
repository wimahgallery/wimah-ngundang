"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Mail, ExternalLink, LogOut } from "lucide-react";

const navItems = [{ href: "/dashboard/invitations", label: "Undangan", icon: Mail }];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(() => setAuthorized(true))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EE]">
        <div className="text-sm text-[#8D8A82]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EE]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[rgba(84,82,77,0.12)] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 items-center border-b border-[rgba(84,82,77,0.12)] px-5">
          <Link href="/dashboard/invitations" className="font-heading text-lg text-[#54524D]">
            Wimah Ngundang
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-[#7C8472]/10 font-medium text-[#54524D]" : "text-[#8D8A82] hover:bg-[#F5F3EE] hover:text-[#54524D]"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[rgba(84,82,77,0.12)] px-3 py-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8D8A82] transition-colors hover:bg-[#F5F3EE] hover:text-[#54524D]"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8D8A82] transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center border-b border-[rgba(84,82,77,0.12)] bg-white/80 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 rounded-lg p-1.5 text-[#8D8A82] hover:bg-[#F5F3EE] lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-medium text-[#54524D]">
            {navItems.find((n) => pathname.startsWith(n.href))?.label || "Dashboard"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
