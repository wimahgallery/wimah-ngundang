import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import {
  navigationLinks,
  siteConfig,
  waMessages,
  whatsappDisplay,
  whatsappLink,
} from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/40 px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl min-w-0 gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <Image src="/wimah.png" alt="" width={30} height={30} className="invert" loading="lazy" />
            <span className="font-heading text-lg text-text-primary">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
            {siteConfig.tagline} Dibuat dengan bahasa desain Wimah — hangat, editorial, dan premium.
          </p>
        </div>

        <nav aria-label="Navigasi halaman" className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Navigasi</p>
          <ul className="mt-3">
            {navigationLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Hubungi Kami</p>
          <ul className="mt-3">
            <li>
              <a
                href={whatsappLink(waMessages.footer)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp {whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex min-h-11 items-center gap-2 break-all text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
              >
                <Mail className="h-3.5 w-3.5" />
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-secondary sm:flex-row">
        <p className="text-center sm:text-left">
          © {year} {siteConfig.name}. Undangan digital untuk momen yang tak terulang.
        </p>
        <div className="flex items-center gap-5">
          <span>Dibuat di Indonesia</span>
          <Link
            href="/admin/login"
            className="inline-flex min-h-11 items-center opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            Masuk Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
