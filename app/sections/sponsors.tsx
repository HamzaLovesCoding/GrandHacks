import { Accent } from "../components/accent";
import { Pixel, type IconName } from "../components/pixel";
import { sponsors, type Panel } from "../content";
import "./sponsors.css";

// the stand-in logos that drop into the open spots
const marks: IconName[] = ["bulb", "chip", "rocket", "heart", "game", "star"];

export const listOf = (items: string[]) => new Intl.ListFormat("en", { type: "conjunction" }).format(items);

export function Sponsors({
  picks,
  setPicks,
  open,
}: {
  picks: string[];
  setPicks: (next: (was: string[]) => string[]) => void;
  open: (panel: Panel) => void;
}) {
  const toggle = (chip: string) =>
    // kept in the order the chips are shown, whatever order they were pressed in
    setPicks((was) => sponsors.chips.filter((c) => (c === chip ? !was.includes(c) : was.includes(c))));
  return (
    <section id="sponsors" className="room sponsors" data-tone="steel" aria-labelledby="sponsors-title">
      <div className="wrap sponsorsGrid">
        <div className="sponsorsHead">
          <h2 className="head" id="sponsors-title">
            <Accent parts={sponsors.title} />
          </h2>
          <p className="text">{sponsors.text}</p>
        </div>

        <div className="sponsorPick">
          <div role="group" aria-labelledby="sponsor-ask">
            <h3 className="subhead" id="sponsor-ask">
              {sponsors.ask}
            </h3>
            <div className="chips">
              {sponsors.chips.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={picks.includes(c)} onClick={() => toggle(c)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path className="chipPlus" d="M8 3v10M3 8h10" />
                    <path className="chipTick" d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <p className="chipSum" role="status">
            {sponsors.picked}
            <strong>{picks.length ? listOf(picks) : sponsors.none}</strong>
          </p>
          <button type="button" className="btn sponsorCta" onClick={() => open("Sponsorship")}>
            {sponsors.cta}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <ul className="slots" aria-label={sponsors.slots}>
          {marks.map((m, i) => (
            <li key={m} style={{ "--i": i } as React.CSSProperties}>
              <span className="slotText">{sponsors.slot}</span>
              <span className="slotLogo" aria-hidden="true">
                <Pixel name={m} />
                <i />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
