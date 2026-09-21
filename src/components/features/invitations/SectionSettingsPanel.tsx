"use client";

import type { Align, SectionSettings, SizeToken } from "@/lib/invitation";

const aligns: Align[] = ["left", "center", "right"];
const sizes: SizeToken[] = ["sm", "md", "lg", "xl"];
const spacings: SectionSettings["sectionSpacing"][] = ["sm", "md", "lg"];

export default function SectionSettingsPanel({
  value,
  onChange,
}: {
  value: SectionSettings;
  onChange: (next: SectionSettings) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={value.visible}
          onChange={(e) => onChange({ ...value, visible: e.target.checked })}
        />
        Tampilkan section
      </label>
      <label className="text-xs text-muted-foreground">
        Alignment
        <select
          value={value.align}
          onChange={(e) => onChange({ ...value, align: e.target.value as Align })}
          className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
        >
          {aligns.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">
        Heading size
        <select
          value={value.headingSize}
          onChange={(e) => onChange({ ...value, headingSize: e.target.value as SizeToken })}
          className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">
        Paragraph size
        <select
          value={value.paragraphSize}
          onChange={(e) => onChange({ ...value, paragraphSize: e.target.value as SizeToken })}
          className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">
        Section spacing
        <select
          value={value.sectionSpacing}
          onChange={(e) => onChange({ ...value, sectionSpacing: e.target.value as SectionSettings["sectionSpacing"] })}
          className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
        >
          {spacings.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
