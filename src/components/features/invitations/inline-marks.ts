import { Mark } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import {
  parseTextStyleDeclaration,
  textStyleDeclaration,
} from "@/lib/invitation";

/**
 * Mark inline editor yang diserialisasi sebagai HTML di Markdown.
 *
 * Markdown tidak punya representasi untuk garis bawah, coretan, dan font,
 * jadi ketiga mark di bawah ini menulis tag HTML inline (`<u>`, `<s>`,
 * `<span style="…">`). Parser `@tiptap/markdown` mengenali tag itu lewat
 * aturan `parseHTML` masing-masing mark, dan halaman undangan merendernya
 * dengan `rehype-raw` + `rehype-sanitize` (daftar tag & style di-whitelist).
 *
 * Nilai family/size font dibatasi daftar `TEXT_FONT_FAMILIES` /
 * `TEXT_FONT_SIZES` (variabel CSS & ukuran em) sehingga tidak pernah
 * menyuntikkan nilai bebas ke halaman undangan.
 */

export const UnderlineHtml = Underline.extend({
  renderMarkdown(node, helpers) {
    return `<u>${helpers.renderChildren(node)}</u>`;
  },
});

export const StrikeHtml = Strike.extend({
  renderMarkdown(node, helpers) {
    return `<s>${helpers.renderChildren(node)}</s>`;
  },
});

export const FontStyle = Mark.create({
  name: "fontStyle",

  addAttributes() {
    return {
      family: { default: "" },
      size: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const style = element.getAttribute("style") ?? "";
          const parsed = parseTextStyleDeclaration(style);
          return parsed ? { ...parsed } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const style = textStyleDeclaration(
      HTMLAttributes.family ?? "",
      HTMLAttributes.size ?? "",
    );
    return ["span", { ...HTMLAttributes, style }, 0];
  },

  renderMarkdown(node, helpers) {
    const style = textStyleDeclaration(
      node.attrs?.family ?? "",
      node.attrs?.size ?? "",
    );
    if (!style) return helpers.renderChildren(node);
    return `<span style="${style}">${helpers.renderChildren(node)}</span>`;
  },
});
