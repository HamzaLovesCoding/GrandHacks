"use client";

import { useEffect, useState } from "react";

// Check-in opens at 8:30 AM Pacific (PDT) on Saturday, June 19, 2027.
const KICKOFF = Date.parse("2027-06-19T08:30:00-07:00");
const UNITS = [
  ["Days", 86_400_000],
  ["Hours", 3_600_000],
  ["Minutes", 60_000],
  ["Seconds", 1000],
] as const;

export function Countdown() {
  // Null until mounted so the server render and first client render match.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const left = now === null ? null : Math.max(0, KICKOFF - now);
  if (left === 0) return <p className="countdown done">It’s hack night.</p>;
  let rest = left ?? 0;
  const values = UNITS.map(([label, ms]) => {
    const v = Math.floor(rest / ms);
    rest -= v * ms;
    return [label, v] as const;
  });
  return (
    <div
      className="countdown"
      role="timer"
      aria-label={
        left === null
          ? "Countdown to GrandHacks on June 19"
          : `${values[0][1]} days until GrandHacks`
      }
    >
      {values.map(([label, v]) => {
        const text = left === null ? "--" : String(v).padStart(2, "0");
        return (
          <div key={label} className="unit" aria-hidden="true">
            <span className="digits">
              <span key={text}>{text}</span>
            </span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}
