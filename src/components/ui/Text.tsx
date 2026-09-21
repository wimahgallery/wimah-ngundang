import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextSize = "xs" | "sm" | "md" | "lg";
type TextAs = "p" | "span";

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
  as?: TextAs;
  variant?: "default" | "muted" | "accent";
}

const sizeStyles: Record<TextSize, string> = {
  xs: "text-[11px] sm:text-xs",
  sm: "text-xs sm:text-sm",
  md: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
};

const variantStyles: Record<string, string> = {
  default: "text-text-primary",
  muted: "text-text-secondary",
  accent: "text-accent",
};

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = "md", as = "p", variant = "default", className, ...props }, ref) => {
    const Tag = as;
    return (
      <Tag
        ref={ref}
        className={cn("leading-relaxed", sizeStyles[size], variantStyles[variant], className)}
        {...props}
      />
    );
  },
);

Text.displayName = "Text";

export { Text, type TextProps };
