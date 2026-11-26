"use client";
import { useEffect, useRef, useState } from "react";
import { forms, links, overlay, panels, sponsors } from "../content";
import { check, limits, methods, type Kind, type Method, type Problems } from "../lib/messages";
import "./message-form.css";

// What a visitor has typed so far. The page holds it for the visit, so closing the form by mistake
// loses nothing, and it's never stored anywhere.
export type Draft = {
  name: string;
  role: string;
  organization: string;
  method: Method;
  reach: Record<Method, string>;
  message: string;
};
export const blankDraft: Draft = {
  name: "",
  role: "",
  organization: "",
  method: "email",
  reach: { email: "", phone: "", other: "" },
  message: "",
};

const inputType = { email: "email", phone: "tel", other: "text" } as const;
const autoFill = { email: "email", phone: "tel", other: "off" } as const;
// the order of the fields, so the cursor goes to the first one that needs a fix
const order = ["name", "organization", "role", "reach", "supports", "message"] as const;

function Field({
  id,
  label,
  note,
  problem,
  children,
}: {
  id: string;
  label: string;
  note?: string;
  problem?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="msgField">
      <label htmlFor={id}>
        {label}
        {note && <span className="msgNote"> {note}</span>}
      </label>
      {children}
      {problem && (
        <p className="msgProblem" id={id + "-problem"}>
          {problem}
        </p>
      )}
    </div>
  );
}

// The Contact form, or the Sponsor form. The sponsor chips are the Sponsors section's own picks, so
// what a visitor chose there is already chosen here, and a change here shows there too.
export function MessageForm({
  kind,
  draft,
  setDraft,
  picks,
  setPicks,
  onDone,
}: {
  kind: Kind;
  draft: Draft;
  setDraft: (next: (was: Draft) => Draft) => void;
  picks: string[];
  setPicks: (next: (was: string[]) => string[]) => void;
  onDone: () => void;
}) {
  const panel = kind === "contact" ? panels.Contact : panels.Sponsorship;
  const [phase, setPhase] = useState<"editing" | "sending" | "sent" | "failed">("editing"),
    [tried, setTried] = useState(false),
    // what the server said needs a fix, until the next edit
    [told, setTold] = useState<Problems>({}),
    [failure, setFailure] = useState(""),
    [by, setBy] = useState("");
  const form = useRef<HTMLFormElement>(null),
    trap = useRef<HTMLInputElement>(null),
    send = useRef<HTMLButtonElement>(null),
    thanks = useRef<HTMLHeadingElement>(null);

  const id = (field: string) => `${kind}-${field}`;
  const reach = { method: draft.method, value: draft.reach[draft.method] };
  const { value, problems: found } = check(
    kind === "contact"
      ? { kind, name: draft.name, role: draft.role, reach, message: draft.message }
      : { kind, name: draft.name, organization: draft.organization, reach, supports: picks, message: draft.message },
  );
  // Fixes show once a send has been tried, and each one goes as soon as its answer is right.
  const problems: Problems = { ...told, ...(tried ? found : {}) };
  const flag = (field: keyof Problems, also?: string) => ({
    "aria-invalid": problems[field] ? true : undefined,
    "aria-describedby": [problems[field] && id(field) + "-problem", also].filter(Boolean).join(" ") || undefined,
  });
  const edit = (change: Partial<Draft>) => {
    setTold({});
    setDraft((was) => ({ ...was, ...change }));
  };
  const toggle = (chip: string) =>
    setPicks((was) => sponsors.chips.filter((c) => (c === chip ? !was.includes(c) : was.includes(c))));
  const count = draft.message.trim().length;

  // A disabled button loses focus, so it gets it back when a send fails; the thanks take it when one goes.
  useEffect(() => {
    if (phase === "failed") send.current?.focus();
    if (phase === "sent") thanks.current?.focus();
  }, [phase]);

  function focusFirst(p: Problems) {
    const first = order.find((f) => p[f]);
    form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phase === "sending") return;
    setTried(true);
    if (!value) return focusFirst(found);
    setPhase("sending");
    try {
      const res = await fetch("/api/messages/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...value, website: trap.current?.value ?? "" }),
      });
      if (res.ok) {
        setBy(value.reach.method === "other" ? value.reach.value : forms.by[value.reach.method]);
        setPhase("sent");
        setDraft(() => blankDraft);
        return;
      }
      const answer = await res.json().catch(() => null);
      if (res.status === 400 && answer?.problems) {
        setTold(answer.problems);
        setPhase("editing");
        return focusFirst(answer.problems);
      }
      setFailure(res.status === 503 ? forms.failed.setup : res.status === 429 ? forms.failed.busy : forms.failed.server);
    } catch {
      setFailure(forms.failed.network);
    }
    setPhase("failed");
  }

  if (phase === "sent")
    return (
      <div className="msgThanks">
        <svg className="msgCheck" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 24.5 21 31.5 34.5 17" />
        </svg>
        <h2 id="dialog-title" ref={thanks} tabIndex={-1}>
          {forms.thanks}
        </h2>
        <p>{forms.back(by)}</p>
        <p className="dialogActions">
          <button type="button" className="btn" onClick={onDone}>
            {forms.done}
          </button>
        </p>
      </div>
    );

  return (
    <form ref={form} className="msgForm" noValidate onSubmit={submit} aria-busy={phase === "sending"}>
      <div className="msgHead">
        <h2 id="dialog-title">{panel.title}</h2>
        <p>{panel.text}</p>
        {kind === "contact" && links.contact && (
          <a className="textLink" href={links.contact}>
            {overlay.email}
          </a>
        )}
      </div>

      <Field
        id={id("name")}
        label={kind === "contact" ? forms.name : forms.yourName}
        note={kind === "contact" ? forms.optional : undefined}
        problem={problems.name}
      >
        <input
          id={id("name")}
          data-field="name"
          type="text"
          autoComplete="name"
          maxLength={limits.name}
          required={kind === "sponsor"}
          value={draft.name}
          onChange={(e) => edit({ name: e.target.value })}
          {...flag("name")}
        />
      </Field>

      {kind === "sponsor" && (
        <Field id={id("organization")} label={forms.organization} problem={problems.organization}>
          <input
            id={id("organization")}
            data-field="organization"
            type="text"
            autoComplete="organization"
            maxLength={limits.organization}
            required
            value={draft.organization}
            onChange={(e) => edit({ organization: e.target.value })}
            {...flag("organization")}
          />
        </Field>
      )}

      {kind === "contact" && (
        <fieldset className="msgGroup">
          <legend>{forms.role}</legend>
          <div className="msgChips">
            {forms.roles.map((role, i) => (
              <label key={role} className="msgChip">
                <input
                  type="radio"
                  name={id("role")}
                  data-field={i === 0 ? "role" : undefined}
                  required
                  checked={draft.role === role}
                  onChange={() => edit({ role })}
                  {...flag("role")}
                />
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" />
                  <circle className="msgDotOn" cx="8" cy="8" r="2.75" />
                </svg>
                {role}
              </label>
            ))}
          </div>
          {problems.role && (
            <p className="msgProblem" id={id("role") + "-problem"}>
              {problems.role}
            </p>
          )}
        </fieldset>
      )}

      <fieldset className="msgGroup">
        <legend>{forms.reach}</legend>
        <div className="msgChips">
          {methods.map((method) => (
            <label key={method} className="msgChip">
              <input
                type="radio"
                name={id("method")}
                checked={draft.method === method}
                onChange={() => edit({ method })}
              />
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <circle className="msgDotOn" cx="8" cy="8" r="2.75" />
              </svg>
              {forms.methods[method]}
            </label>
          ))}
        </div>
        <Field id={id("reach")} label={forms.reachLabel[draft.method]} problem={problems.reach}>
          <input
            key={draft.method}
            id={id("reach")}
            data-field="reach"
            type={inputType[draft.method]}
            inputMode={draft.method === "phone" ? "tel" : draft.method === "email" ? "email" : undefined}
            autoComplete={autoFill[draft.method]}
            spellCheck={false}
            placeholder={forms.reachHint[draft.method]}
            maxLength={limits[draft.method]}
            required
            value={draft.reach[draft.method]}
            onChange={(e) => edit({ reach: { ...draft.reach, [draft.method]: e.target.value } })}
            {...flag("reach")}
          />
        </Field>
      </fieldset>

      {kind === "sponsor" && (
        <fieldset className="msgGroup">
          <legend>
            {forms.supports}
            <span className="msgNote"> {forms.optional}</span>
          </legend>
          <div className="msgChips">
            {sponsors.chips.map((chip) => (
              <label key={chip} className="msgChip">
                <input type="checkbox" checked={picks.includes(chip)} onChange={() => toggle(chip)} {...flag("supports")} />
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path className="msgPlusBar" d="M8 3v10M3 8h10" />
                  <path className="msgPlusTick" d="M3 8.5 6.5 12 13 4.5" />
                </svg>
                {chip}
              </label>
            ))}
          </div>
          {problems.supports && (
            <p className="msgProblem" id={id("supports") + "-problem"}>
              {problems.supports}
            </p>
          )}
        </fieldset>
      )}

      <Field
        id={id("message")}
        label={forms.message}
        note={kind === "sponsor" ? forms.optional : undefined}
        problem={problems.message}
      >
        <textarea
          id={id("message")}
          data-field="message"
          rows={5}
          required={kind === "contact"}
          value={draft.message}
          onChange={(e) => edit({ message: e.target.value })}
          {...flag("message", id("count"))}
        />
        <p className="msgCount" id={id("count")}>
          {kind === "contact" && <span>{forms.shortest}</span>}
          <span data-over={count > limits.message || undefined}>
            {count.toLocaleString("en-US")} / {limits.message.toLocaleString("en-US")}
          </span>
        </p>
      </Field>

      {/* Hidden from people, and from screen readers. A bot that fills in every box fills in this one. */}
      <div className="msgTrap" aria-hidden="true">
        <label htmlFor={id("website")}>{forms.trap}</label>
        <input ref={trap} id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {phase === "failed" && (
        <p className="msgFailed" role="alert">
          {failure}
        </p>
      )}
      <div className="msgSend">
        <button ref={send} type="submit" className="btn" disabled={phase === "sending"}>
          {phase === "sending" ? forms.sending : phase === "failed" ? forms.retry : forms.send}
        </button>
        <p className="msgPrivacy">{forms.privacy}</p>
      </div>
    </form>
  );
}
