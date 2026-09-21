import { forwardRef, type HTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  variant?: "default" | "accent" | "elegant";
  as?: ElementType;
}

const sizeStyles: Record<HeadingLevel, string> = {
  1: "text-[36px] sm:text-[48px] lg:text-[56px]",
  2: "text-[28px] sm:text-[36px] lg:text-[48px]",
  3: "text-[24px] sm:text-[30px] lg:text-[36px]",
  4: "text-[20px] sm:text-[24px] lg:text-[28px]",
  5: "text-[18px] sm:text-[20px] lg:text-[24px]",
  6: "text-[16px] sm:text-[18px] lg:text-[20px]",
};

const variantStyles: Record<string, string> = {
  default: "text-text-primary",
  accent: "text-accent-light",
  elegant: "font-elegant italic text-accent-light",
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, variant = "default", className, as: Tag, ...props }, ref) => {
    const Component = Tag || `h${level}`;
    return (
      <Component
        ref={ref}
        className={cn(
          "font-heading font-normal leading-[1.1]",
          sizeStyles[level],
          variantStyles[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Heading.displayName = "Heading";

export { Heading, type HeadingProps, type HeadingLevel };
