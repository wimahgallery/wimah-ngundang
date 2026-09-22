import { easings, type SpringConfig } from "@react-spring/web";

/** Premium feel — buttery smooth with gentle deceleration. */
export const springGentle: SpringConfig = {
  tension: 120,
  friction: 26,
  clamp: true,
  precision: 0.01,
};

/** Standard reveal — fast entry, no overshoot, crisp stop. */
export const springSmooth: SpringConfig = {
  tension: 180,
  friction: 26,
  clamp: true,
  precision: 0.01,
};

/** Snappy micro-interaction — cards, chips, buttons. */
export const springSnappy: SpringConfig = {
  tension: 300,
  friction: 30,
  clamp: true,
  precision: 0.01,
};

/** Sheet/drawer — weighted, physical, satisfying. */
export const springSheet: SpringConfig = {
  tension: 260,
  friction: 30,
  clamp: true,
  precision: 0.01,
};

/** Duration-based ease for precise timing (ms). */
export const durationEase = (duration: number): SpringConfig => ({
  duration,
  easing: easings.easeOutCubic,
  precision: 0.01,
});

/** Cinematic slow ease-in-out (ms). */
export const durationCinematic = (duration: number): SpringConfig => ({
  duration,
  easing: easings.easeInOutCubic,
  precision: 0.01,
});
