import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Content, Parents, Root } from "mdast";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  parseTextStyleDeclaration,
  textAlignClass,
  textStyleDeclaration,
  type TextAlign,
} from "@/lib/invitation";

/**
 * Renderer teks panjang pada halaman undangan.
 *
 * Nilai field disimpan sebagai Markdown (lihat RichTextEditor di dashboard),
 * sehingga baris baru, tebal, miring, daftar, kutipan, judul H1–H3, garis
 * pemisah, dan tautan ikut tampil.
 *
 * Selain Markdown, editor menyimpan tiga gaya sebagai HTML inline yang sudah
 * di-whitelist: `<u>` (garis bawah), `<s>` (coretan) dan
 * `<span style="font-…">` (font per teks). Tag itu dirender dengan
 * `rehype-raw`, lalu dibatasi dua lapis: `restrictInlineStyles` hanya
 * melepasan `font-family`/`font-size` dari daftar `TEXT_FONT_FAMILIES` dan
 * `TEXT_FONT_SIZES`, sedangkan `rehype-sanitize` membuang tag/atribut di
 * luar daftar aman (skrip, event handler, dll). Teks yang diketik user
 * sendiri di-escape editor (`encodeHtmlEntities`), jadi HTML mentah tidak
 * pernah berasal dari input bebas.
 *
 * react-markdown tidak lagi menyediakan opsi `breaks`, jadi baris baru di
 * dalam paragraf diubah sendiri menjadi node `break` (<br>) sebelum dirender —
 * sama seperti tampilannya ketika teks masih disimpan sebagai teks biasa.
 */
function remarkLineBreaks() {
  const walk = (node: Parents) => {
    const children = node.children;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i] as Content & { value?: string };
      if ("children" in child) {
        walk(child as Parents);
        continue;
      }
      if (child.type !== "text" || !child.value?.includes("\n")) continue;

      const parts = child.value.split("\n");
      const nodes: Content[] = [];
      parts.forEach((part, index) => {
        if (index > 0) nodes.push({ type: "break" });
        if (part) nodes.push({ type: "text", value: part });
      });
      children.splice(i, 1, ...nodes);
      i += nodes.length - 1;
    }
  };
  return (tree: Root) => walk(tree);
}

/** Daftar tag yang boleh tampil dari HTML inline editor. */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    span: ["style"],
  },
};

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/**
 * Batasi atribut `style` hanya pada `span` dengan font yang dikenal editor.
 * Dipasang sebelum `rehype-sanitize` supaya yang sampai ke sanitiser memang
 * sudah deklarasi yang dinormalkan ulang dari daftar putih.
 */
function restrictInlineStyles() {
  return (tree: unknown) => {
    const walk = (node: HastNode) => {
      const properties = node.properties;
      if (node.type === "element" && properties) {
        const raw = properties.style;
        if (node.tagName === "span" && typeof raw === "string") {
          const parsed = parseTextStyleDeclaration(raw);
          const style = parsed ? textStyleDeclaration(parsed.family, parsed.size) : "";
          if (style) properties.style = style;
          else delete properties.style;
        } else if ("style" in properties) {
          delete properties.style;
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree as HastNode);
  };
}

/** Tautan yang aman ditampilkan: http(s), mailto, tel, atau jangkar lokal. */
function safeLinkHref(href: string | null | undefined): string | null {
  const value = href?.trim();
  if (!value) return null;
  if (value.startsWith("#") || value.startsWith("/")) return value;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return null;
}

/**
 * @param align Perataan konten (disimpan per field di `custom_settings.textAlign`).
 *   Tanpa nilai → teks mengikuti perataan bawaan wadahnya.
 * @param gap Jarak antar blok dalam px (disimpan di `custom_settings.textGap` /
 *   `textGapFields`). Tanpa nilai → wadah memakai `space-y` bawaannya.
 */
export function RichText({
  text,
  className,
  align,
  gap,
}: {
  text?: string | null;
  className?: string;
  align?: TextAlign | null;
  gap?: number | null;
}) {
  if (!text) return null;
  const hasGap = typeof gap === "number";
  return (
    <div
      // `md-content` jadi jangkar gaya blok Markdown (judul, garis pemisah)
      // sehingga berlaku baik saat jarak diatur maupun tidak.
      className={cn("md-content", className, textAlignClass(align), hasGap && ["md-gap", "space-y-0"])}
      style={hasGap ? ({ "--md-gap": `${gap}px` } as CSSProperties) : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkLineBreaks]}
        rehypePlugins={[
          rehypeRaw,
          restrictInlineStyles,
          [rehypeSanitize, sanitizeSchema],
        ]}
        components={{
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-current pl-4">{children}</blockquote>,
          a: ({ children, href }) => {
            const safe = safeLinkHref(href);
            if (!safe) return <>{children}</>;
            const external = /^https?:/i.test(safe);
            return (
              <a
                href={safe}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
