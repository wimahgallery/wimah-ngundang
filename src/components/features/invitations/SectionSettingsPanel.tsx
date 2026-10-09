"use client";

import type { SectionSettings } from "@/lib/invitation";

/**
 * Pengaturan tampilan section — hanya sakelar "Tampilkan section".
 *
 * Pengaturan tipografi/ruang yang dulu ada di panel ini (alignment, ukuran
 * heading/paragraf, jarak section) dihapus dari form sesuai permintaan;
 * nilai lama di `custom_settings` tetap dipakai renderer sehingga undangan
 * yang sudah dibuat tidak berubah tampilannya.
 */
export default function SectionSettingsPanel({
  value,
  onChange,
  label,
}: {
  value: SectionSettings;
  onChange: (next: SectionSettings) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border/60 bg-muted/40 px-3 py-2">
      {label && (
        <p className="text-xs font-medium text-foreground">{label}</p>
      )}
      <label className="flex min-h-8 cursor-pointer items-center gap-2 text-xs text-foreground">
        <input
          type="checkbox"
          checked={value.visible}
          onChange={(e) => onChange({ ...value, visible: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        Tampilkan section
      </label>
    </div>
  );
}
