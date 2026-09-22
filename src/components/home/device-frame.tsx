import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Frame perangkat untuk menampilkan mockup undangan.
 * Rasio 9/19.5 dikunci lewat aspect-ratio supaya tidak ada layout shift.
 */
export function DeviceFrame({
  children,
  className,
  screenClassName,
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  size?: "sm" | "md" | "lg";
}) {
  const frameStyles = {
    sm: "rounded-[20px] border-[7px] p-[3px]",
    md: "rounded-[26px] border-[9px] p-[3px]",
    lg: "rounded-[32px] border-[10px] p-1",
  }[size];

  const screenRadius = {
    sm: "rounded-[14px]",
    md: "rounded-[18px]",
    lg: "rounded-[22px]",
  }[size];

  return (
    <div
      className={cn(
        "relative border-[#23241f] bg-[#23241f] shadow-[0_40px_110px_rgba(46,46,40,0.32)]",
        frameStyles,
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-[10px] z-30 h-[6px] w-16 -translate-x-1/2 rounded-full bg-white/20"
      />
      <div
        className={cn(
          "relative aspect-[9/19.5] w-full overflow-hidden bg-background",
          screenRadius,
          screenClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
