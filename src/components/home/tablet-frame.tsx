import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tablet device frame — iPad-like proportions (3:4).
 */
export function TabletFrame({
  children,
  className,
  screenClassName,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[22px] border-[8px] border-[#23241f] bg-[#23241f] p-[3px] shadow-[0_40px_110px_rgba(46,46,40,0.32)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-[6px] z-30 h-[5px] w-10 -translate-x-1/2 rounded-full bg-white/20"
      />
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-[14px] bg-background",
          screenClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
