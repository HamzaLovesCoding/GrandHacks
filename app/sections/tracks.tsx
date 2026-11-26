"use client";
import { useState } from "react";
import { Accent } from "../components/accent";
import { Pixel } from "../components/pixel";
import { tracks } from "../content";
import "./tracks.css";

// Eight rows. Pointing at one, or picking it with the keyboard, shows it large beside the list.
export function Tracks() {
  const [picked, setPicked] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);
  const shown = tracks.rows[peek ?? picked];
  return (
    <section id="tracks" className="room tracks" data-tone="sky" aria-labelledby="tracks-title">
      <div className="wrap tracksGrid">
        <div className="tracksHead">
          <h2 className="head" id="tracks-title">
            <Accent parts={tracks.title} />
          </h2>
          <p className="tracksTheme">
            <small>{tracks.label}</small> <strong>{tracks.theme}</strong>
          </p>
        </div>
        <div className="trackRows" role="radiogroup" aria-label={tracks.group} onPointerLeave={() => setPeek(null)}>
          {tracks.rows.map((t, i) => (
            <label key={t.name} className="trackRow" onPointerEnter={(e) => e.pointerType === "mouse" && setPeek(i)}>
              <input type="radio" name="track" checked={picked === i} onChange={() => setPicked(i)} />
              <span className="trackNum" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Pixel name={t.icon} className="trackIcon" />
              <strong>{t.name}</strong>
              <span className="trackLine">{t.line}</span>
            </label>
          ))}
        </div>
        {/* the same words as the row, drawn large; screen readers already have them */}
        <div className="trackPeek" aria-hidden="true">
          <div className="peekCard" key={shown.name}>
            <Pixel name={shown.icon} className="peekIcon" animate />
            <strong>{shown.name}</strong>
            <p>{shown.line}</p>
            {shown.also && <small>{shown.also}</small>}
          </div>
        </div>
      </div>
    </section>
  );
}
