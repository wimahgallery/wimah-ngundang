"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Sparkles, X } from "lucide-react";
import {
  PERSONALITY_LABELS,
  TEMPLATE_TYPOGRAPHY,
  rankFontsForTemplate,
  findFont,
  type FontRole,
  type FontMeta,
} from "@/lib/font-library";
import {
  DEFAULT_ACCENT,
  DEFAULT_BODY,
  DEFAULT_HEADING,
  findOption,
  fontStack,
  loadFontSpecimen,
  loadFontSpecimens,
} from "@/lib/wedding-fonts";
import type { FontSettings } from "@/lib/invitation";
import { cn } from "@/lib/utils";

/* ── Util kecil ───────────────────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<FontMeta["category"], string> = {
  serif: "Serif",
  sans: "Sans",
  display: "Display",
  script: "Script",
  handwriting: "Handwriting",
  mono: "Mono",
};

const RECENT_KEY = (role: FontRole) => `wimah-font-recent-${role}`;
const MAX_RECENT = 5;

function readRecent(role: FontRole): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY(role));
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids.filter((id) => findFont(id));
  } catch {
    return [];
  }
}

function pushRecent(role: FontRole, id: string | null) {
  if (!id) return;
  try {
    const next = [id, ...readRecent(role).filter((x) => x !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY(role), JSON.stringify(next));
  } catch {
    /* storage penuh / private mode → abaikan */
  }
}

/** Muat specimen untuk daftar font yang sedang terlihat (on-demand, tak pernah semua). */
function useSpecimenLoader(fonts: Array<FontMeta | null>) {
  const key = fonts
    .map((f) => f?.id ?? "-")
    .join("|");
  useEffect(() => {
    fonts.forEach((f) => f && loadFontSpecimen(f.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/* ── Baris pilihan font ───────────────────────────────────────────────────── */

type Tier = "recommended" | "compatible" | "rest";

function FontRow({
  option,
  selected,
  tier,
  note,
  onSelect,
}: {
  option: { id: string; name: string; family: string };
  selected: boolean;
  tier?: Tier;
  note?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
        selected ? "border-primary bg-primary/5 ring-2 ring-ring/40" : "border-border hover:border-primary/40",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-lg leading-snug text-foreground" style={{ fontFamily: `"${option.family}", serif` }}>
          {option.name}
        </span>
        {note && <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{note}</span>}
      </span>
      {tier === "recommended" && <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold" aria-label="Direkomendasikan" />}
      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}

/* ── Picker per peran ─────────────────────────────────────────────────────── */

function FontPicker({
  role,
  label,
  templateId,
  value,
  onChange,
  advanced,
}: {
  role: FontRole;
  label: string;
  templateId: keyof typeof TEMPLATE_TYPOGRAPHY;
  value: string | null;
  onChange: (id: string | null) => void;
  advanced: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(advanced);
  const [recent, setRecent] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setRecent(readRecent(role)));
    return () => cancelAnimationFrame(id);
  }, [open, role]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const defaultOption = role === "body" ? DEFAULT_BODY : role === "accent" ? DEFAULT_ACCENT : DEFAULT_HEADING;
  const current = findOption(value) ?? defaultOption;

  const ranked = useMemo(() => rankFontsForTemplate(templateId, role), [templateId, role]);
  const recommended = useMemo(() => ranked.filter((r) => r.tier === "recommended"), [ranked]);

  // Group Recommended berdasarkan kepribadian yang paling cocok.
  const recommendedGroups = useMemo(() => {
    const dna = TEMPLATE_TYPOGRAPHY[templateId];
    const groups = new Map<string, FontMeta[]>();
    for (const { font } of recommended) {
      const shared = font.personality.filter((p) => dna.personality.includes(p));
      const key = shared[0] ?? "editorial";
      const list = groups.get(key) ?? [];
      list.push(font);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [recommended, templateId]);

  const listFontIds = useMemo(() => {
    const base = showAll || advanced ? ranked.map((r) => r.font.id) : recommended.map((r) => r.font.id);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return ranked.filter((r) => r.font.name.toLowerCase().includes(q) || r.font.category.includes(q)).map((r) => r.font.id);
  }, [ranked, recommended, showAll, advanced, query]);

  const visibleFonts = useMemo(
    () => listFontIds.map((id) => findFont(id)).filter((f): f is FontMeta => Boolean(f)),
    [listFontIds],
  );
  useSpecimenLoader(visibleFonts);

  const select = (id: string | null) => {
    onChange(id);
    pushRecent(role, id);
    setOpen(false);
    setQuery("");
  };

  const recentFonts = recent.map((id) => findFont(id)).filter((f): f is FontMeta => Boolean(f));

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-left transition hover:border-primary/40"
      >
        <span className="min-w-0">
          <span className="block truncate text-lg leading-snug text-foreground" style={{ fontFamily: `"${current.family}", serif` }}>
            {current.name}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {CATEGORY_LABELS[value ? findFont(value)?.category ?? "serif" : role === "body" ? "sans" : "serif"]}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute z-30 mt-1.5 max-h-[26rem] w-full overflow-y-auto rounded-xl border border-border bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
        >
          <div className="sticky top-0 z-10 bg-white pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari font…"
                className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Bersihkan pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {!query && recentFonts.length > 0 && (
            <>
              <p className="px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Baru dipakai</p>
              <div className="grid gap-1 pb-1">
                {recentFonts.map((f) => (
                  <FontRow key={`recent-${f.id}`} option={f} selected={value === f.id} onSelect={() => select(f.id)} />
                ))}
              </div>
            </>
          )}

          {!showAll && !advanced && !query && (
            <>
              {recommendedGroups.map(([personality, fonts]) => (
                <div key={personality}>
                  <p className="px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Direkomendasikan · {PERSONALITY_LABELS[personality] ?? personality}
                  </p>
                  <div className="grid gap-1">
                    {fonts.map((f) => (
                      <FontRow key={f.id} option={f} selected={value === f.id} tier="recommended" onSelect={() => select(f.id)} />
                    ))}
                  </div>
                </div>
              ))}
              {ranked.some((r) => r.tier === "compatible") && (
                <div>
                  <p className="px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Kompatibel</p>
                  <div className="grid gap-1">
                    {ranked
                      .filter((r) => r.tier === "compatible")
                      .slice(0, 6)
                      .map(({ font }) => (
                        <FontRow key={font.id} option={font} selected={value === font.id} onSelect={() => select(font.id)} />
                      ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-2 w-full rounded-md border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                Lihat semua font →
              </button>
            </>
          )}

          {(showAll || advanced || query) && (
            <>
              <p className="px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {advanced ? "Semua font (mode lanjutan)" : "Semua font"}
              </p>
              <div className="grid gap-1">
                {visibleFonts.map((f) => {
                  const rank = ranked.find((r) => r.font.id === f.id);
                  return (
                    <FontRow
                      key={f.id}
                      option={f}
                      selected={value === f.id}
                      tier={!advanced && rank?.tier === "recommended" ? "recommended" : undefined}
                      note={CATEGORY_LABELS[f.category]}
                      onSelect={() => select(f.id)}
                    />
                  );
                })}
                {visibleFonts.length === 0 && <p className="px-1 py-3 text-xs text-muted-foreground">Tidak ada font yang cocok.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Kartu pairing ────────────────────────────────────────────────────────── */

function PairingCard({
  pairing,
  selected,
  onApply,
}: {
  pairing: { id: string; label: string; preset: { heading: string | null; body: string | null; accent?: string | null } };
  selected: boolean;
  onApply: () => void;
}) {
  const heading = findOption(pairing.preset.heading) ?? DEFAULT_HEADING;
  const body = findOption(pairing.preset.body) ?? DEFAULT_BODY;
  useEffect(() => {
    loadFontSpecimens([pairing.preset.heading, pairing.preset.body]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairing.id]);

  return (
    <button
      type="button"
      onClick={onApply}
      aria-pressed={selected}
      className={cn(
        "rounded-xl border p-3 text-left transition",
        selected ? "border-primary bg-primary/5 ring-2 ring-ring/40" : "border-border hover:border-primary/40",
      )}
    >
      <span className="block truncate text-xl leading-snug text-foreground" style={{ fontFamily: `"${heading.family}", serif` }}>
        {heading.name}
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted-foreground" style={{ fontFamily: `"${body.family}", sans-serif` }}>
        dengan {body.name}
      </span>
      <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-dark">{pairing.label}</span>
    </button>
  );
}

/* ── Step utama ───────────────────────────────────────────────────────────── */

export function TypographyStep({
  templateId,
  font,
  onChange,
}: {
  templateId: keyof typeof TEMPLATE_TYPOGRAPHY;
  font: FontSettings;
  onChange: (font: FontSettings) => void;
}) {
  const dna = TEMPLATE_TYPOGRAPHY[templateId];
  const [advanced, setAdvanced] = useState(false);

  const accent = findFont(font.accent);
  useSpecimenLoader([findFont(font.heading), findFont(font.body), accent]);

  const isDefaultPreset =
    (font.heading ?? null) === dna.default.heading && (font.body ?? null) === dna.default.body;

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Tipografi dikurasi khusus untuk template ini. Ganti template akan otomatis memakai
        pasangan font bawaan template baru — kamu tetap bebas mengubahnya kapan saja.
      </p>

      {/* Pratinjau kombinasi aktif */}
      <div className="rounded-xl border border-border bg-background p-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Contoh tampilan</p>
        {accent && accent.family && (
          <p className="mt-1 text-2xl text-accent-dark" style={{ fontFamily: `"${accent.family}", cursive` }}>
            The Wedding of
          </p>
        )}
        <p className="mt-2 text-3xl md:text-4xl" style={{ fontFamily: fontStack(findOption(font.heading), "heading") }}>
          Wisnu &amp; Nilam
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: fontStack(findOption(font.body), "body") }}>
          Sabtu, 12 Desember 2026 — Dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i
          untuk hadir di hari pernikahan kami.
        </p>
      </div>

      {/* Pairing kurasi per template */}
      <div>
        <p className="mb-2 text-xs font-semibold text-foreground">Preset pasangan font</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dna.pairings.map((pairing) => (
            <PairingCard
              key={pairing.id}
              pairing={pairing}
              selected={font.heading === pairing.preset.heading && font.body === pairing.preset.body}
              onApply={() => onChange({ heading: pairing.preset.heading, body: pairing.preset.body, accent: pairing.preset.accent ?? null })}
            />
          ))}
        </div>
      </div>

      {/* Per-font */}
      <div className="grid gap-3 sm:grid-cols-2">
        <FontPicker role="heading" label="Font judul & nama" templateId={templateId} value={font.heading} onChange={(id) => onChange({ ...font, heading: id })} advanced={advanced} />
        <FontPicker role="body" label="Font teks & paragraf" templateId={templateId} value={font.body} onChange={(id) => onChange({ ...font, body: id })} advanced={advanced} />
        <FontPicker role="accent" label="Font aksen (opsional)" templateId={templateId} value={font.accent ?? null} onChange={(id) => onChange({ ...font, accent: id })} advanced={advanced} />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onChange({ heading: dna.default.heading, body: dna.default.body, accent: dna.default.accent ?? null })}
            disabled={isDefaultPreset}
            className="min-h-11 rounded-lg border border-border px-4 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
          >
            Kembalikan ke bawaan template
          </button>
        </div>
      </div>

      {/* Mode lanjutan */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-dashed border-border bg-muted/30 p-3">
        <input
          type="checkbox"
          checked={advanced}
          onChange={(e) => setAdvanced(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
        />
        <span>
          <span className="block text-xs font-semibold text-foreground">Gunakan font kustom (lanjutan)</span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            Lepaskan kurasi template — seluruh library font terbuka untuk semua peran.
          </span>
        </span>
      </label>
    </div>
  );
}
