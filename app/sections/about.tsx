import { Hang } from "../components/hang";
import { NameTag } from "../components/name-tag";
import { Pixel } from "../components/pixel";
import { about, type Story, type Tell } from "../content";
import "./about.css";

// One screen: what it is, then what happens, with the name tag beside them and the numbers along the bottom.
export function About({ story, tell }: { story: Story; tell: Tell }) {
  return (
    <section id="about" className="room about" data-tone="fog" aria-labelledby="about-title">
      <div className="fogbank" aria-hidden="true" />
      <div className="wrap aboutGrid">
        <div className="aboutHead">
          <h2 className="head" id="about-title">
            {about.title}
          </h2>
          <p className="lead">{about.lead}</p>
        </div>

        <div className="aboutTag">
          <Hang>
            <NameTag id="tag-in" story={story} tell={tell} />
          </Hang>
        </div>

        <ol className="steps">
          {about.steps.map((s) => (
            <li key={s.title} className="step">
              <span className="stepIcon">
                <Pixel name={s.icon} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.line}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="statsBar">
        <ul className="wrap stats">
          {about.stats.map(([n, label]) => (
            <li key={label}>
              <strong>{n}</strong> {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
