"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import {
  CharacterCount,
  Placeholder,
  type CharacterCountStorage,
} from "@tiptap/extensions";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CornerDownLeft,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TEXT_FONT_FAMILIES,
  TEXT_FONT_SIZES,
  TEXT_GAP_DEFAULT,
  TEXT_GAP_MAX,
  TEXT_GAP_MIN,
  type TextAlign,
} from "@/lib/invitation";
import { StrictOrderedList } from "./strict-order-list";
import { FontStyle, StrikeHtml, UnderlineHtml } from "./inline-marks";
import { sanitizePastedHtml } from "./paste-sanitizer";

/**
 * Editor rich text (TipTap) yang menyimpan kontennya sebagai Markdown biasa,
 * sehingga nilai di database tetap string dan bisa dibaca tanpa editor.
 *
 * Selain Markdown standar (paragraf, tebal, miring, daftar, kutipan, judul
 * H1–H3, garis pemisah, tautan), tiga gaya yang tidak punya sintaks Markdown
 * disimpan sebagai HTML inline yang sudah di-whitelist: `<u>` (garis bawah),
 * `<s>` (coretan) dan `<span style="font-…">` (font per teks) — lihat
 * `inline-marks.ts`. Halaman umum merendernya dengan `rehype-raw` +
 * `rehype-sanitize`, sementara tempelan (paste) dibersihkan lebih dulu oleh
 * `paste-sanitizer.ts` sehingga gaya Word/Google Docs tidak ikut tersimpan.
 *
 * Perataan dan jarak antar blok tidak bisa disimpan di Markdown, jadi
 * tombolnya menyimpan nilai ke `custom_settings.textAlign[field]` dan
 * `custom_settings.textGapFields[field]` lewat callback masing-masing, lalu
 * diterapkan renderer sebagai `text-align` dan `--md-gap`.
 */

const BUTTON_CLASS =
  "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-40";

const SELECT_FONT_CLASS =
  "h-7 min-w-[5.5rem] cursor-pointer rounded border border-transparent bg-transparent px-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

const ALIGNS: { value: TextAlign; title: string; Icon: typeof AlignLeft }[] = [
  { value: "left", title: "Rata kiri", Icon: AlignLeft },
  { value: "center", title: "Rata tengah", Icon: AlignCenter },
  { value: "right", title: "Rata kanan", Icon: AlignRight },
  { value: "justify", title: "Rata penuh", Icon: AlignJustify },
];

const HEADING_LEVELS = [1, 2, 3] as const;
const HEADING_ICONS = { 1: Heading1, 2: Heading2, 3: Heading3 } as const;

/** Normalisasi isi kolom URL: protokol yang dikenal dipakai apa adanya,
 *  tanpa protokol diberi `https://`, protokol asing (mis. `javascript:`)
 *  ditolak supaya tautan tidak pernah berbahaya. */
function normalizeLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("?")) {
    return trimmed;
  }
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
}

function toMarkdown(editor: Editor): string {
  try {
    return editor.getMarkdown() ?? "";
  } catch {
    return "";
  }
}

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      data-active={active ? "true" : undefined}
      disabled={disabled}
      className={cn(BUTTON_CLASS, active && "bg-accent text-accent-foreground")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 112,
  ariaLabel,
  align,
  onAlignChange,
  gap,
  onGapChange,
  gapOverride,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel?: string;
  align?: TextAlign | null;
  onAlignChange?: (align: TextAlign | undefined) => void;
  gap?: number | null;
  onGapChange?: (gap: number | undefined) => void;
  /** True bila field ini punya jarak sendiri (menimpa jarak dokumen). */
  gapOverride?: boolean;
}) {
  const [gapOpen, setGapOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState("");
  /** Nilai terakhir yang dikirim ke parent — dipakai supaya efek sinkronisasi
   *  tidak memanggil `setContent` (dan menggulung kursor) tiap render. */
  const lastEmitted = useRef(value ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        horizontalRule: {},
        link: { openOnClick: false, autolink: false, linkOnPaste: false },
        orderedList: false,
        strike: false,
        underline: false,
      }),
      StrictOrderedList,
      UnderlineHtml,
      StrikeHtml,
      FontStyle,
      Markdown,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      CharacterCount,
    ],
    content: value ?? "",
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "rt-editor w-full text-base text-foreground outline-none md:text-sm",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
      // Tempelan dari Word/Google Docs dibersihkan dari tag & gaya asing
      // sebelum ProseMirror mem-parsenya.
      transformPastedHTML: sanitizePastedHtml,
    },
    onUpdate: ({ editor: current }) => {
      const markdown = toMarkdown(current);
      lastEmitted.current = markdown;
      onChange(markdown);
    },
  });

  // Sinkronisasi nilai dari luar (reset form, data dimuat ulang, dsb.).
  useEffect(() => {
    if (!editor) return;
    const next = value ?? "";
    if (next === lastEmitted.current) return;
    if (next === toMarkdown(editor)) {
      lastEmitted.current = next;
      return;
    }
    lastEmitted.current = next;
    editor.commands.setContent(next, { contentType: "markdown" });
  }, [value, editor]);

  if (!editor) {
    return <div className="h-24 w-full max-w-[65ch] animate-pulse rounded-md border border-border bg-muted/40" />;
  }

  const run = (chain: () => ReturnType<Editor["chain"]>) => chain().run();

  const fontAttrs = editor.getAttributes("fontStyle") as {
    family?: string;
    size?: string;
  };
  const fontActive = Boolean(fontAttrs.family || fontAttrs.size);
  const inList = editor.isActive("bulletList") || editor.isActive("orderedList");
  const count = editor.storage.characterCount as CharacterCountStorage | undefined;

  const applyFont = (family: string, size: string) => {
    if (!family && !size) {
      run(() => editor.chain().focus().unsetMark("fontStyle"));
      return;
    }
    run(() => editor.chain().focus().setMark("fontStyle", { family, size }));
  };

  const openLinkPanel = () => {
    const href = (editor.getAttributes("link").href as string | undefined) ?? "";
    setLinkValue(href);
    setLinkError("");
    setLinkOpen((open) => !open);
  };

  const applyLink = () => {
    const href = normalizeLink(linkValue);
    if (!href) {
      setLinkError("URL tidak valid. Gunakan https://, mailto: atau tel:.");
      return;
    }
    if (editor.isActive("link")) {
      run(() => editor.chain().focus().extendMarkRange("link").setLink({ href }));
    } else {
      run(() => editor.chain().focus().setLink({ href }));
    }
    setLinkError("");
    setLinkOpen(false);
  };

  const removeLink = () => {
    run(() => editor.chain().focus().extendMarkRange("link").unsetLink());
    setLinkValue("");
    setLinkError("");
    setLinkOpen(false);
  };

  return (
    <div className="w-full max-w-[65ch] overflow-hidden rounded-md border border-border bg-white focus-within:ring-2 focus-within:ring-ring/60">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 px-1.5 py-1">
        {/* Font per teks */}
        <select
          title="Keluarga font"
          aria-label="Keluarga font"
          value={fontAttrs.family ?? ""}
          onChange={(event) => applyFont(event.target.value, fontAttrs.size ?? "")}
          className={cn(SELECT_FONT_CLASS, fontActive && "bg-accent text-accent-foreground")}
        >
          {TEXT_FONT_FAMILIES.map((family) => (
            <option key={family.key} value={family.key}>
              {family.label}
            </option>
          ))}
        </select>
        <select
          title="Ukuran font"
          aria-label="Ukuran font"
          value={fontAttrs.size ?? ""}
          onChange={(event) => applyFont(fontAttrs.family ?? "", event.target.value)}
          className={cn(SELECT_FONT_CLASS, fontActive && "bg-accent text-accent-foreground")}
        >
          {TEXT_FONT_SIZES.map((size) => (
            <option key={size.key} value={size.key}>
              {size.label}
            </option>
          ))}
        </select>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ToolbarButton
          title="Tebal"
          active={editor.isActive("bold")}
          onClick={() => run(() => editor.chain().focus().toggleBold())}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Miring"
          active={editor.isActive("italic")}
          onClick={() => run(() => editor.chain().focus().toggleItalic())}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Garis bawah"
          active={editor.isActive("underline")}
          onClick={() => run(() => editor.chain().focus().toggleUnderline())}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Coret"
          active={editor.isActive("strike")}
          onClick={() => run(() => editor.chain().focus().toggleStrike())}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        {HEADING_LEVELS.map((level) => {
          const Icon = HEADING_ICONS[level];
          return (
            <ToolbarButton
              key={level}
              title={`Judul ${level}`}
              active={editor.isActive("heading", { level })}
              onClick={() => run(() => editor.chain().focus().toggleHeading({ level }))}
            >
              <Icon className="h-3.5 w-3.5" />
            </ToolbarButton>
          );
        })}
        <ToolbarButton
          title="Kutipan"
          active={editor.isActive("blockquote")}
          onClick={() => run(() => editor.chain().focus().toggleBlockquote())}
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ToolbarButton
          title="Daftar berbutir"
          active={editor.isActive("bulletList")}
          onClick={() => run(() => editor.chain().focus().toggleBulletList())}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Daftar bernomor"
          active={editor.isActive("orderedList")}
          onClick={() => run(() => editor.chain().focus().toggleOrderedList())}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Perdalam daftar"
          disabled={!inList}
          onClick={() => run(() => editor.chain().focus().sinkListItem("listItem"))}
        >
          <IndentIncrease className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Keluarkan dari daftar"
          disabled={!inList}
          onClick={() => run(() => editor.chain().focus().liftListItem("listItem"))}
        >
          <IndentDecrease className="h-3.5 w-3.5" />
        </ToolbarButton>
        {onAlignChange && (
          <>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
            {ALIGNS.map(({ value, title, Icon }) => (
              <ToolbarButton
                key={value}
                title={title}
                active={align === value}
                onClick={() => onAlignChange(align === value ? undefined : value)}
              >
                <Icon className="h-3.5 w-3.5" />
              </ToolbarButton>
            ))}
          </>
        )}
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        {onGapChange && (
          <ToolbarButton
            title="Jarak antar blok"
            active={gapOpen}
            onClick={() => setGapOpen((open) => !open)}
          >
            <Rows3 className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}
        <ToolbarButton
          title="Tautan"
          active={linkOpen || editor.isActive("link")}
          onClick={openLinkPanel}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Garis pemisah"
          onClick={() => run(() => editor.chain().focus().setHorizontalRule())}
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ToolbarButton
          title="Baris baru di dalam paragraf"
          onClick={() => run(() => editor.chain().focus().setHardBreak())}
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Hapus format"
          onClick={() => run(() => editor.chain().focus().unsetAllMarks().clearNodes())}
        >
          <Eraser className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ToolbarButton
          title="Batalkan"
          disabled={!editor.can().undo()}
          onClick={() => run(() => editor.chain().focus().undo())}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Ulangi"
          disabled={!editor.can().redo()}
          onClick={() => run(() => editor.chain().focus().redo())}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      {onGapChange && gapOpen && (
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-background px-3 py-2">
          <label className="min-w-[12rem] flex-1 text-xs text-muted-foreground">
            Jarak antar blok{" "}
            <span className="font-medium text-foreground">
              {typeof gap === "number" ? gap : TEXT_GAP_DEFAULT}px
            </span>
            <span className={`ml-1 text-[10px] ${gapOverride ? "text-primary" : "text-muted-foreground"}`}>
              {gapOverride ? "• ditimpa" : "• ikut dokumen"}
            </span>
            <input
              type="range"
              min={TEXT_GAP_MIN}
              max={TEXT_GAP_MAX}
              step={1}
              value={typeof gap === "number" ? gap : TEXT_GAP_DEFAULT}
              onChange={(e) => onGapChange(Number(e.target.value))}
              className="mt-1 w-full"
              aria-label="Jarak antar blok dalam piksel"
            />
          </label>
          <button
            type="button"
            onClick={() => onGapChange(undefined)}
            disabled={typeof gap !== "number"}
            className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
          >
            Ikuti pengaturan dokumen
          </button>
        </div>
      )}
      {linkOpen && (
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-background px-3 py-2">
          <label className="min-w-[14rem] flex-1 text-xs text-muted-foreground">
            Tautan
            <input
              type="url"
              value={linkValue}
              onChange={(event) => {
                setLinkValue(event.target.value);
                setLinkError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://… atau mailto:someone@example.com"
              className="mt-1 w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label="Alamat tautan"
            />
          </label>
          <button
            type="button"
            onClick={applyLink}
            title="Terapkan"
            className="min-h-9 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            Terapkan
          </button>
          <button
            type="button"
            onClick={removeLink}
            title="Hapus tautan"
            disabled={!editor.isActive("link")}
            className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
          >
            Hapus tautan
          </button>
          {linkError && (
            <p role="alert" className="w-full text-xs text-red-600">
              {linkError}
            </p>
          )}
        </div>
      )}
      <div
        className="px-3 py-2 md:py-1.5"
        style={
          {
            minHeight,
            ...(typeof gap === "number" ? { "--md-gap": `${gap}px` } : {}),
          } as React.CSSProperties
        }
      >
        <EditorContent editor={editor} />
      </div>
      <div className="rt-counts border-t border-border bg-muted/40 px-3 py-1 text-right text-[11px] text-muted-foreground">
        {count?.words() ?? 0} kata · {count?.characters() ?? 0} karakter
      </div>
    </div>
  );
}
