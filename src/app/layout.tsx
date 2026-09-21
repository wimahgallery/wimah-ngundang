import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Cormorant_Garamond, Inter, Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Wimah Ngundang",
    template: "%s | Wimah Ngundang",
  },
  description: "Undangan digital Wimah — elegan, hangat, dan mudah dibagikan.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", cormorant.variable, inter.variable, playfair.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full bg-background text-text-primary font-body">{children}</body>
    </html>
  );
}
