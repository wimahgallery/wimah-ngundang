/** Smooth scroll untuk anchor di landing page, otomatis nonaktif saat reduced motion. */
export function scrollToHash(hash: string) {
  if (typeof document === "undefined") return;
  const target = document.querySelector(hash);
  if (!target) return;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
