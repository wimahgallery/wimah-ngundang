"use client";

import { useReducedMotion } from "@react-spring/web";

/**
 * Normalisasi hook reduced-motion dari react-spring (boolean | null) menjadi boolean,
 * supaya nilainya aman dipakai sebagai prop `immediate` di seluruh animasi.
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}
