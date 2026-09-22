"use client";

import { cn } from "@/lib/utils";

export function OrnamentalDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-40 text-gold", className)}
      aria-hidden
    >
      <path
        d="M0 12h80"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <path
        d="M120 12h80"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <circle cx="100" cy="12" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="88" cy="12" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="112" cy="12" r="1" fill="currentColor" opacity="0.3" />
      <path
        d="M92 12c2-3 6-4 8-2s6 1 8 2c-2 3-6 4-8 2s-6-1-8-2z"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

export function OrnamentalCorner({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-16 w-16 text-gold", className, flip && "scale-x-[-1]")}
      aria-hidden
    >
      <path
        d="M4 4c0 20 16 36 36 36"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <path
        d="M4 4c0 28 24 52 52 52"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="40" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
