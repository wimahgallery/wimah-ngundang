/**
 * Pembersih tempelan (paste) untuk editor rich text.
 *
 * Konten dari Word/Google Docs membawa puluhan tag gaya (`<o:p>`, `<font>`,
 * `<span style="mso-…">`) yang tidak ada gunanya di undangan. Hasil ini
 * dibersihkan di `editorProps.transformPastedHTML` sebelum ProseMirror
 * memparse-nya, sehingga yang masuk hanya tag yang didukung skema editor.
 *
 * Atribut dibuang semua kecuali `href` (protokol aman) dan `style` font
 * yang dikenal editor. Komentar (mis. kondisi MSO) dan tag non-konten
 * seperti `<style>` dibuang tanpa menyisakan teksnya.
 */

const KEEP_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "STRIKE",
  "DEL",
  "A",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "H1",
  "H2",
  "H3",
  "HR",
  "SPAN",
  "DIV",
  "CODE",
  "PRE",
]);

/** Tag yang dibuang beserta isinya (jangan di-unwrap jadi teks biasa). */
const DROP_TAGS = new Set([
  "STYLE",
  "SCRIPT",
  "META",
  "LINK",
  "TITLE",
  "HEAD",
  "NOSCRIPT",
  "XML",
  "OBJECT",
  "EMBED",
  "IFRAME",
  "SVG",
  "MATH",
]);

function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith("#") || value.startsWith("/") || value.startsWith("?")) {
    return true;
  }
  return /^(https?:|mailto:|tel:)/i.test(value);
}

export function sanitizePastedHtml(html: string): string {
  if (typeof window === "undefined" || !html.trim()) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walk = (parent: Element) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const element = child as HTMLElement;

      // Bersihkan isi lebih dulu supaya hasil unwrap tidak ikut kotor.
      walk(element);

      const tag = element.tagName.toUpperCase();
      if (DROP_TAGS.has(tag)) {
        element.remove();
        continue;
      }
      if (!KEEP_TAGS.has(tag)) {
        element.replaceWith(...Array.from(element.childNodes));
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (tag === "A" && name === "href" && isSafeHref(attribute.value)) continue;
        element.removeAttribute(attribute.name);
      }

      if (tag === "A") {
        const href = element.getAttribute("href");
        if (!href || !isSafeHref(href)) {
          element.replaceWith(...Array.from(element.childNodes));
        }
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
