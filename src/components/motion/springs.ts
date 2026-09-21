import { easings, type SpringConfig } from "@react-spring/web";

/** Halus dan tenang — dipakai untuk hero dan section besar. */
export const springGentle: SpringConfig = { tension: 90, friction: 22, clamp: true };

/** Standar untuk reveal section: cepat masuk, tanpa overshoot. */
export const springSmooth: SpringConfig = { tension: 130, friction: 26, clamp: true };

/** Untuk elemen kecil seperti kartu dan chip. */
export const springSnappy: SpringConfig = { tension: 240, friction: 28, clamp: true };

/** Durasi tetap untuk animasi yang butuh tempo presisi (dalam ms). */
export const durationEase = (duration: number): SpringConfig => ({
  duration,
  easing: easings.easeOutCubic,
});

/** Durasi untuk gerak sinematik yang lambat (dalam ms). */
export const durationCinematic = (duration: number): SpringConfig => ({
  duration,
  easing: easings.easeInOutCubic,
});
