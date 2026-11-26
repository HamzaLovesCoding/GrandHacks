"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Accent } from "../components/accent";
import { Pixel } from "../components/pixel";
import { parents, parentTopics, type Panel } from "../content";
import "./parents.css";

// What the questions and the search box are compared in: lowercase, without accents.
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

// Words that don't narrow anything down, so "is my kid safe?" looks for "safe".
const filler = new Set(
  (
    "a about all also am an and any are as at be been can could did do does for from get got has have how i " +
    "if in into is it its just me more much my need needs of on or our out please really should so some " +
    "still the their there they this to too us very was we were what when where which who why will with " +
    "would you your child children kid kids son daughter teen teens student students"
  ).split(" "),
);

// The words to look for: two letters or more, no bare numbers, filler left out, and a plural s
// dropped, so "laptops" finds "laptop". They're only ever letters and digits.
function termsOf(query: string) {
  return fold(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !/^\p{N}+$/u.test(w) && !filler.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

// Everything the search box looks through for each question (its topic, the question, the answer
// with its list, and the extra words in `keys`), as words with a space before each one. A searched word has to
// start a word in here, so "sleep" finds "sleeping" but "age" doesn't find "message".
const hay = new Map(
  parentTopics.flatMap((t) =>
    t.asks.map((a): [string, string] => [
      a.id,
      " " + fold([t.title, a.q, a.a, ...(a.list ?? []), a.keys ?? ""].join(" ")).replace(/[^\p{L}\p{N}]+/gu, " "),
    ]),
  ),
);

// The question, with each word that a searched word starts marked.
function marked(text: string, terms: string[]) {
  if (!terms.length) return text;
  return text
    .match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu)!
    .map((part, i) => (terms.some((w) => fold(part).startsWith(w)) ? <mark key={i}>{part}</mark> : part));
}

// /parents: the event told plainly for families. Questions to search or browse by topic, one answer
// open at a time, and a way to reach the organizers for anything that isn't here.
export function Parents({ open }: { open: (panel: Panel) => void }) {
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState(""),
    [shown, setShown] = useState("");
  const search = useRef<HTMLInputElement>(null),
    guide = useRef<HTMLDivElement>(null),
    list = useRef<HTMLDivElement>(null);
  const terms = useMemo(() => termsOf(query), [query]);
  const fits = (id: string) => terms.every((w) => hay.get(id)!.includes(" " + w));
  const groups = parentTopics
    .filter((t) => !topic || t.id === topic)
    .map((t) => ({ ...t, asks: t.asks.filter((a) => fits(a.id)) }))
    .filter((t) => t.asks.length > 0);
  const found = groups.reduce((n, t) => n + t.asks.length, 0);
  // nothing in the chosen topic, but something in another one
  const elsewhere = !found && !!topic && parentTopics.some((t) => t.asks.some((a) => fits(a.id)));
  // A query of only filler ("who?") narrows nothing, so the count doesn't claim it matched.
  const status = parents.count(
    found,
    terms.length ? query.trim() : "",
    parentTopics.find((t) => t.id === topic)?.title,
  );

  // Screen readers hear the count once typing pauses, not after every letter.
  const [said, setSaid] = useState(status);
  useEffect(() => {
    const wait = setTimeout(() => setSaid(status), 700);
    return () => clearTimeout(wait);
  }, [status]);

  // When the filter changes while you're scrolled down the list, go back up to its first answer.
  const filter = topic + "|" + terms.join(" ");
  const was = useRef(filter);
  useEffect(() => {
    if (was.current === filter) return;
    was.current = filter;
    const el = list.current;
    if (el && el.getBoundingClientRect().top < 66) el.scrollIntoView({ block: "start", behavior: "instant" });
  }, [filter]);

  // A link to one answer, like /parents/#sleeping, opens it. The browser has already scrolled there.
  useEffect(() => {
    const id = location.hash.slice(1);
    if (hay.has(id)) setShown(id);
  }, []);

  // A topic button always shows its questions: it drops any search, which might match none of them,
  // and brings the list up if it starts too low on the screen to see.
  const pick = (id: string) => {
    setTopic(id);
    setQuery("");
    if (list.current!.getBoundingClientRect().top > innerHeight * 0.5)
      guide.current!.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
  };

  // Up and down (and Home and End) move between the questions, as in any accordion.
  const step = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const by = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!by && e.key !== "Home" && e.key !== "End") return;
    const all = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("h3 button")];
    const at = all.indexOf(e.target as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    all[by ? (at + by + all.length) % all.length : e.key === "Home" ? 0 : all.length - 1].focus();
  };

  return (
    <section id="parents" className="room parentsPage" data-tone="fog" aria-labelledby="parents-title">
      <div className="wrap parentsGrid">
        <div className="parentsHead">
          <small>{parents.label}</small>
          <h1 className="head" id="parents-title">
            <Accent parts={parents.title} />
          </h1>
          <p className="lead">{parents.intro}</p>
          <p className="text">{parents.why}</p>
        </div>

        <div className="parentsGlance">
          <div className="poster">
            <picture aria-hidden="true">
              <source media="(min-width: 601px) and (max-width: 1100px)" srcSet="/media/bridge-gold.webp" />
              <img src="/media/bridge-gold-tall.webp" alt="" />
            </picture>
            <picture className="posterNight" aria-hidden="true">
              <source media="(min-width: 601px) and (max-width: 1100px)" srcSet="/media/bridge-night.webp" />
              <img src="/media/bridge-night-tall.webp" alt="" />
            </picture>
            <dl>
              {parents.facts.map((f, i) => (
                <div key={f.label}>
                  <dt className={i < 2 ? "srOnly" : undefined}>{f.label}</dt>
                  <dd>
                    {i ? (
                      <strong>{f.value}</strong>
                    ) : (
                      <strong className="posterDate">
                        <span>{parents.poster[0]}</span> {parents.poster[1]}
                        <span className="srOnly">, 2027</span>
                      </strong>
                    )}
                    <span>{f.line}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="parentsPending">{parents.pending}</p>
        </div>

        <div className="parentsGuide" ref={guide}>
          <div className="parentsTools">
            <div className="parentsSearch" role="search">
              <label htmlFor="parents-search">
                <small>{parents.search}</small>
              </label>
              <div className="parentsField">
                <Pixel name="search" />
                <input
                  ref={search}
                  id="parents-search"
                  type="search"
                  value={query}
                  placeholder={parents.hint}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && query) {
                      e.preventDefault();
                      setQuery("");
                    }
                    // Enter goes to the first result
                    if (e.key === "Enter") {
                      e.preventDefault();
                      list.current?.querySelector("button")?.focus();
                    }
                  }}
                />
                {query && (
                  <button
                    type="button"
                    className="parentsClear"
                    aria-label={parents.clear}
                    onClick={() => {
                      setQuery("");
                      search.current?.focus();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <p className="parentsCount" aria-hidden="true">
              {status}
            </p>
            <p className="srOnly" role="status">
              {said}
            </p>
            <small id="parents-topics">{parents.topicsLabel}</small>
            <div className="parentsChips" role="group" aria-labelledby="parents-topics">
              <button type="button" aria-pressed={!topic} onClick={() => pick("")}>
                {parents.all}
              </button>
              {parentTopics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={topic === t.id}
                  onClick={() => pick(topic === t.id ? "" : t.id)}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          <div className="parentsList" ref={list} onKeyDown={step}>
            {groups.map((t) => (
              <div key={t.id} className="parentsTopic">
                <h2 id={"topic-" + t.id}>
                  <Pixel name={t.icon} />
                  {t.title}
                </h2>
                <ul>
                  {t.asks.map((a) => {
                    const on = shown === a.id;
                    return (
                      <li key={a.id} id={a.id} className="parentsAsk" data-open={on || undefined}>
                        <h3>
                          <button
                            type="button"
                            id={a.id + "-q"}
                            aria-expanded={on}
                            aria-controls={a.id + "-a"}
                            onClick={() => setShown(on ? "" : a.id)}
                          >
                            <span>{marked(a.q, terms)}</span>
                          </button>
                        </h3>
                        <div
                          className="parentsAnswer"
                          id={a.id + "-a"}
                          role="region"
                          aria-labelledby={a.id + "-q"}
                          inert={!on}
                        >
                          <div>
                            <p>{a.a}</p>
                            {a.list && (
                              <ul className="parentsPoints">
                                {a.list.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            )}
                            {a.tbc && (
                              <p className="parentsTbc">
                                <b>{parents.tbc}</b> {a.tbc}
                              </p>
                            )}
                            {a.ask && (
                              <button type="button" className="textLink" onClick={() => open("Contact")}>
                                {parents.contact}
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {!found && (
              <div className="parentsEmpty">
                <p className="subhead">{parents.none}</p>
                <p className="text">{parents.noneText}</p>
                <p className="faqActions">
                  {elsewhere && (
                    <button type="button" className="btn" onClick={() => setTopic("")}>
                      {parents.everywhere}
                    </button>
                  )}
                  <button
                    type="button"
                    className={elsewhere ? "btn btnLine" : "btn"}
                    onClick={() => open("Contact")}
                  >
                    {parents.contact}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="parentsContact">
          <Pixel name="team" className="parentsContactIcon" />
          <h2 className="subhead">{parents.contactTitle}</h2>
          <p className="text">{parents.contactText}</p>
          <p className="faqActions">
            <button type="button" className="btn" onClick={() => open("Contact")}>
              {parents.contact}
            </button>
            <a className="textLink" href="/">
              {parents.back}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
