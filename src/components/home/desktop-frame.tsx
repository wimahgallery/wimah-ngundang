import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Desktop/laptop device frame — MacBook-style with keyboard base.
 */
export function DesktopFrame({
  children,
  className,
  screenClassName,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* screen lid */}
      <div
        className={cn(
          "relative rounded-t-xl border-[6px] border-[#23241f] bg-[#23241f] pb-0 pt-[3px] shadow-[0_40px_110px_rgba(46,46,40,0.32)]",
          "w-full",
        )}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[5px] z-30 h-[4px] w-8 -translate-x-1/2 rounded-full bg-white/20"
        />
        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden rounded-t-lg bg-background",
            screenClassName,
          )}
        >
          {children}
        </div>
      </div>
      {/* keyboard base */}
      <div className="relative w-[108%]">
        <div className="h-[10px] rounded-b-xl bg-[#d6d3cb] shadow-[0_4px_12px_rgba(0,0,0,0.08)]" />
        {/* trackpad notch */}
        <span className="absolute bottom-0 left-1/2 h-[3px] w-24 -translate-x-1/2 rounded-t-sm bg-[#c4c0b8]" />
      </div>
    </div>
  );
}
