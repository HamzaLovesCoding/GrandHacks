"use client";
import { useState } from "react";
import { Countdown } from "../components/countdown";
import { HeroFilm } from "../components/hero-film";
export function Pill({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pill" onClick={onClick}>
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
export function Hero({ open }: { open: (panel: "Registration") => void }) {
  const [card, show] = useState(true);
  return (
    <section id="top" className="hero">
      <HeroFilm />
      <div className="heroLock">
        <h1 aria-label="GrandHacks">
          <span aria-hidden="true">GRAND</span><span aria-hidden="true">HACKS</span>
        </h1>
        <p>
          Overnight Hackathon
          <br />
          June 19–20, 2027
          <br />
          San Francisco
        </p>
        <Countdown />
      </div>
      {card && (
        <aside className="heroCard">
          <strong>Registration opens soon on Luma</strong>
          <button
            className="cross"
            aria-label="Dismiss registration card"
            onClick={() => show(false)}
          >
            ×
          </button>
          <Pill onClick={() => open("Registration")}>Register</Pill>
        </aside>
      )}
    </section>
  );
}
