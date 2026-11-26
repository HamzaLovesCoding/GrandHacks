import { useId } from "react";

// The GrandHacks monogram for the bar and menu: a gold G on an ink tile, with a spark at its open end.
export function Monogram() {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--pale)" />
          <stop offset="0.5" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--deep)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="var(--ink)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="none" stroke="var(--gold)" strokeOpacity="0.28" />
      <path d="M29.2 12.3A11 11 0 1 0 31 20H20.5" fill="none" stroke={`url(#${id})`} strokeWidth="4.2" />
      <path d="M30.5 4.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="var(--cream)" />
    </svg>
  );
}
