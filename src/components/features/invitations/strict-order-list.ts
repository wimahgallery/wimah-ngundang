import { OrderedList, parsePlainTextOrderedListPaste } from "@tiptap/extension-list";
import { Plugin } from "@tiptap/pm/state";

/**
 * Varian `OrderedList` TipTap yang pola penanda daftarnya dibatasi pada
 * penanda numerik CommonMark.
 *
 * `OrderedList` bawaan punya dua jalur teks-mentah dengan pola terlalu longgar:
 * `d+[.)]` ditambah `i.`/`a.`/`A.` (`[ivxlcdmIVXLCDM]+` dan `[a-zA-Z]{1,2}`),
 * yaitu tokenizer markdown (dipakai saat nilai diset ke editor) dan handlePaste
 * untuk tempelan teks biasa. Keduanya membuat baris biasa seperti
 * "Jl. Contoh No. 1" atau "Dr. Budi" diparse jadi daftar bernomor dan
 * sebagian teksnya hilang — pada markdown biasa pola itu memang bukan daftar.
 *
 * Pembatasan ini membuat editor sejalan dengan renderer `react-markdown`
 * (yang juga hanya mengenali penanda `1.`) sehingga teks alamat/kontak tidak
 * pernah korup, sementara daftar bernomor sungguhan tetap berfungsi.
 */
const NUMERIC_LIST_MARKER = /^\s*\d{1,9}[.)]\s+\S/;

const baseTokenizer = OrderedList.config.markdownTokenizer;

export const StrictOrderedList = OrderedList.extend({
  markdownTokenizer: baseTokenizer
    ? {
        name: baseTokenizer.name,
        level: baseTokenizer.level,
        start: baseTokenizer.start,
        tokenize: (src, tokens, lexer) => {
          const firstLine = src.split("\n", 1)[0] ?? "";
          if (!NUMERIC_LIST_MARKER.test(firstLine)) return undefined;
          return baseTokenizer.tokenize(src, tokens, lexer);
        },
      }
    : undefined,
  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? [];
    const plugins = parentPlugins.filter((plugin) => !plugin.spec.props?.handlePaste);

    plugins.push(
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const html = event.clipboardData?.getData("text/html");
            if (html?.trim()) return false;
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;
            const firstLine = text.split("\n", 1)[0] ?? "";
            if (!NUMERIC_LIST_MARKER.test(firstLine)) return false;

            const content = parsePlainTextOrderedListPaste(text);
            if (!content) return false;
            try {
              const node = view.state.schema.nodeFromJSON(content);
              view.dispatch(view.state.tr.replaceSelectionWith(node));
              return true;
            } catch {
              return false;
            }
          },
        },
      }),
    );

    return plugins;
  },
});
