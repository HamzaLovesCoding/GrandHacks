import { Accent } from "../components/accent";
import { questions, type Panel } from "../content";
import "./faq.css";

// Four questions a first-timer asks, plus the way to the other answers: /parents and the organizers.
export function FAQ({ open }: { open: (panel: Panel) => void }) {
  return (
    <section id="faq" className="room faq" data-tone="fog" aria-labelledby="faq-title">
      <div className="wrap faqGrid">
        <div className="faqSide">
          <h2 className="head" id="faq-title">
            <Accent parts={questions.title} />
          </h2>
          <p className="text">{questions.text}</p>
          <p className="faqActions">
            <a className="btn" href="/parents/">
              {questions.parents}
            </a>
            <button type="button" className="btn btnLine" onClick={() => open("Contact")}>
              {questions.contact}
            </button>
          </p>
        </div>
        <Asks rows={questions.rows} />
      </div>
    </section>
  );
}

// Plain <details>, so every answer opens with the keyboard and without any script.
export function Asks({ rows, className = "" }: { rows: [string, string][]; className?: string }) {
  return (
    <div className={"asks " + className}>
      {rows.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
