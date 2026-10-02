"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { templateMeta, type TemplateId } from "@/components/invitation/template-registry";

type TemplatePickerProps = {
  value: string | null | undefined;
  onChange: (id: TemplateId) => void;
  className?: string;
  name?: string;
};

export function TemplatePicker({ value, onChange, className, name = "template-picker" }: TemplatePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih template undangan"
      className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}
    >
      {templateMeta.map((t) => {
        const selected = value === t.id;
        return (
          <label
            key={t.id}
            className={cn(
              "group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-2.5 transition-all duration-200 hover:border-accent/60 hover:bg-accent/5",
              "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              selected && "border-primary bg-primary/5 ring-2 ring-primary/40",
            )}
          >
            <input
              type="radio"
              name={name}
              value={t.id}
              checked={selected}
              onChange={() => onChange(t.id)}
              className="sr-only"
            />

            <div
              aria-hidden
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg ring-1 ring-black/10"
              style={{ background: t.colors.background }}
            >
              <span className="absolute inset-x-0 top-0 h-[58%]" style={{ background: t.colors.hero }} />
              <span
                className="absolute left-1/2 top-[26%] h-1 w-7 -translate-x-1/2 rounded-full"
                style={{ background: t.colors.gold }}
              />
              <span
                className="absolute left-1/2 top-[38%] h-[3px] w-4 -translate-x-1/2 rounded-full opacity-70"
                style={{ background: t.colors.background }}
              />
              <span
                className="absolute bottom-2 left-1/2 h-2 w-11 -translate-x-1/2 rounded-full"
                style={{ background: t.colors.accent }}
              />
              {selected && (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{t.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {t.description}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
