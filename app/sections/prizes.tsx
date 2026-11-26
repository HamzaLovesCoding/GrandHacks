import { Pixel } from "../components/pixel";
import { awards, places, prizes } from "../content";
import "./prizes.css";

// Read like a prize board: the headline, the top three on a podium beside the category awards, each
// with its prize, then a rule and the total, so the pool is the sum of what's above it.
export function Prizes() {
  const prize = (p: string) => p || prizes.tba;
  return (
    <section id="prizes" className="room prizes" data-tone="graphite" aria-labelledby="prizes-title">
      <div className="wrap prizesGrid">
        <div className="prizesHead">
          <h2 className="beat" id="prizes-title">
            {prizes.title}
          </h2>
          <p className="text">{prizes.text}</p>
          {prizes.examples && <p className="prizesExample">{prizes.examplesNote}</p>}
        </div>

        <div className="prizesTop">
          <h3 className="prizesLabel">{prizes.top}</h3>
          <ol className="podium">
            {places.map((p) => (
              <li key={p.place} data-place={p.place}>
                <span className="podiumNum" aria-hidden="true">
                  {p.place}
                </span>
                <span className="podiumWin">
                  <strong>{prize(p.prize)}</strong>
                  {p.title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="prizesAwards">
          <h3 className="prizesLabel">{prizes.categories}</h3>
          <ul className="awardList">
            {awards.map((a) => (
              <li key={a.title}>
                <span className="awardIcon">
                  <Pixel name={a.icon} />
                </span>
                <span className="awardText">
                  <h4>{a.title}</h4>
                  <p>{a.line}</p>
                </span>
                <strong className="awardPrize">{prize(a.prize)}</strong>
              </li>
            ))}
          </ul>
        </div>

        <p className="prizesTotal">
          <span>{prizes.total}</span>
          <strong>{prizes.pool}</strong>
        </p>
      </div>
    </section>
  );
}
