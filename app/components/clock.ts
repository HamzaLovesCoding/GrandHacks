import { stamps, SUNRISE, SUNSET } from "../content";

// Scroll position and sky time are not proportional: the scene rests on every stamp long enough
// to read it, then the sky runs on to the next one.
export const PHASES = stamps.length;
const HOLD = 0.4;

const ease = (k: number) => k * k * (3 - 2 * k);
const clamp = (v: number) => Math.max(0, Math.min(1, v));

// `step` is how far along the row of stamps the scroll is, from 0 to PHASES - 1.
export function readScroll(progress: number) {
  const s = clamp(progress) * PHASES;
  const phase = Math.min(PHASES - 1, Math.floor(s));
  const within = Math.min(1, s - phase);
  const k = ease(clamp((within - HOLD) / (1 - HOLD)));
  const from = stamps[phase].at;
  const to = stamps[phase + 1]?.at ?? from;
  return { time: from + (to - from) * k, phase, within, step: Math.min(PHASES - 1, phase + k) };
}

// Map a dragged position back through the same hold and easing as normal scrolling.
export function scrollFor(step: number) {
  if (step >= PHASES - 1) return 1;
  const phase = Math.floor(step);
  const fraction = step - phase;
  if (fraction === 0) return (phase + HOLD * 0.5) / PHASES;
  const within = 0.5 - Math.sin(Math.asin(1 - 2 * fraction) / 3);
  return (phase + HOLD + within * (1 - HOLD)) / PHASES;
}

function fade(time: number, start: number, end: number) {
  return ease(clamp((time - start) / (end - start)));
}

// Afternoon is the base. At dawn the morning painting is already behind the fading night.
export function cityLight(time: number) {
  const morning = time < SUNSET
    ? 1 - fade(time, 9 * 60, 13 * 60)
    : fade(time, SUNRISE - 120, SUNRISE - 90) * (1 - fade(time, SUNRISE + 75, SUNRISE + 330));
  const sunset = fade(time, SUNSET - 200, SUNSET) * (1 - fade(time, SUNRISE - 150, SUNRISE - 120));
  const night = fade(time, SUNSET, SUNSET + 100) * (1 - fade(time, SUNRISE - 75, SUNRISE + 20));
  return { morning, sunset, night };
}

export function clockAt(time: number) {
  const hour = Math.floor(time / 60) % 24;
  const digits = `${hour % 12 || 12}:${String(time % 60).padStart(2, "0")}`;
  const half = hour < 12 ? "AM" : "PM";
  const day = time < 24 * 60 ? "Saturday" : "Sunday";
  return { digits, half, day, text: `${digits} ${half}` };
}

export function stampTime(stamp: (typeof stamps)[number]) {
  const start = clockAt(stamp.at);
  if (stamp.until === undefined) return `${start.day} · ${start.text}`;
  const end = clockAt(stamp.until);
  if (start.day !== end.day) return `Sat ${start.text} – Sun ${end.text}`;
  return `${start.day} · ${start.half === end.half ? start.digits : start.text}–${end.text}`;
}
