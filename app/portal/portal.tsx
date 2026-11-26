"use client";
import { useEffect, useRef, useState } from "react";
import { portal } from "../content";
import { statuses, type Kind, type Message, type SponsorFields, type Status } from "../lib/messages";
import "./portal.css";

type View = "loading" | "signin" | "inbox" | "setup" | "trouble";
type Tab = "all" | Kind;
const tabs: Tab[] = ["all", "contact", "sponsor"];
// the order a card offers its changes in
const changes: Status[] = ["replied", "archived", "new"];

// Every time here is San Francisco time: "Nov 25, 2026, 3:04 PM PST".
const pacific = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});
const when = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : pacific.format(d);
};

const sponsor = (m: Message) => (m.kind === "sponsor" ? (m as SponsorFields) : null);
// lower case and without accents, so "jose" finds "José"
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const words = (m: Message) =>
  fold(
    [m.name, sponsor(m)?.organization ?? ("role" in m ? m.role : ""), m.reach?.value, m.message, ...(sponsor(m)?.supports ?? [])].join(
      " ",
    ),
  );

type Answer = { messages?: Message[]; left?: number; retryAfter?: number };
async function call(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, {
    method,
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, data: ((await res.json().catch(() => null)) ?? {}) as Answer };
}

function SignIn({ note, signIn, setUp }: { note: string; signIn: () => Promise<boolean>; setUp: () => void }) {
  const [passcode, setPasscode] = useState(""),
    [sending, setSending] = useState(false),
    [problem, setProblem] = useState("");
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => box.current?.focus(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!passcode.trim()) {
      setProblem(portal.signIn.empty);
      return box.current?.focus();
    }
    setSending(true);
    setProblem("");
    let next = portal.signIn.trouble;
    try {
      const { status, data } = await call("/api/portal/session/", "POST", { passcode });
      if (status === 200) {
        setPasscode("");
        // the cookie works only if the browser kept it
        if (await signIn()) return;
        next = portal.signIn.noCookie;
      } else if (status === 503) return setUp();
      else if (status === 401) next = portal.signIn.wrong(Number(data.left) || 1);
      else if (status === 429) next = portal.signIn.paused(Math.max(1, Math.ceil((Number(data.retryAfter) || 900) / 60)));
      else if (status === 400) next = portal.signIn.empty;
    } catch {
      next = portal.signIn.offline;
    }
    setProblem(next);
    setSending(false);
    // back in the box, with what was typed selected, ready to type over
    requestAnimationFrame(() => {
      box.current?.focus();
      box.current?.select();
    });
  }

  const said = problem || note;
  return (
    <div className="pPanel">
      <p className="pBrand">{portal.brand}</p>
      <h1>{portal.signIn.title}</h1>
      <p>{portal.signIn.text}</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="portal-passcode">{portal.signIn.label}</label>
        <input
          ref={box}
          id="portal-passcode"
          name="passcode"
          type="password"
          autoComplete="current-password"
          required
          value={passcode}
          onChange={(e) => {
            setPasscode(e.target.value);
            setProblem("");
          }}
          aria-invalid={problem ? true : undefined}
          aria-describedby={said ? "portal-passcode-note" : undefined}
        />
        {said && (
          <p id="portal-passcode-note" className={problem ? "pProblem" : "pInfo"} role={problem ? "alert" : "status"}>
            {said}
          </p>
        )}
        <button type="submit" className="pButton" disabled={sending}>
          {sending ? portal.signIn.checking : portal.signIn.button}
        </button>
      </form>
    </div>
  );
}

// How to answer: by email, by phone or text, or by copying what they wrote.
function Reach({ message: m, say }: { message: Message; say: (text: string) => void }) {
  const method = m.reach?.method,
    value = m.reach?.value ?? "";
  const at = value.lastIndexOf("@");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      say(portal.copied);
    } catch {
      say(portal.noCopy);
    }
  }
  let reply: React.ReactNode = null;
  if (method === "email" && at > 0) {
    const to = `${encodeURIComponent(value.slice(0, at))}@${encodeURIComponent(value.slice(at + 1))}`;
    reply = (
      <a className="pAction pPrimary" href={`mailto:${to}?subject=${encodeURIComponent(portal.subject)}`}>
        {portal.replyEmail}
      </a>
    );
  } else if (method === "phone") {
    // only the number itself: a + if it had one, then its digits, without any extension
    const main = value.replace(/\s*(?:ext\.?|x)\s*\d{1,6}$/i, "").trim();
    const dial = (main.startsWith("+") ? "+" : "") + main.replace(/\D/g, "");
    reply = (
      <>
        <a className="pAction pPrimary" href={`tel:${dial}`}>
          {portal.call}
        </a>
        <a className="pAction" href={`sms:${dial}`}>
          {portal.text}
        </a>
      </>
    );
  }
  return (
    <div className="pReach">
      <p>
        <span className="pLabel">{portal.reach[method] ?? portal.reach.other}</span>
        <span className="pValue">{value}</span>
      </p>
      <div className="pReachLinks">
        {reply}
        <button type="button" className="pAction" onClick={copy}>
          {portal.copy}
        </button>
      </div>
    </div>
  );
}

function Card({
  message: m,
  busy,
  change,
  remove,
  say,
}: {
  message: Message;
  busy: boolean;
  change: (m: Message, status: Status) => void;
  remove: (m: Message) => void;
  say: (text: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const keep = useRef<HTMLButtonElement>(null),
    ask = useRef<HTMLButtonElement>(null),
    asked = useRef(false);
  // The question takes the focus on its safe answer, and Keep it gives it back to Delete.
  useEffect(() => {
    if (confirming) keep.current?.focus();
    else if (asked.current) ask.current?.focus();
    asked.current = confirming;
  }, [confirming]);
  const title = `message-${m.id}`,
    s = sponsor(m);
  return (
    <article className="pCard" aria-labelledby={title}>
      <div className="pCardTop">
        <span className="pKind" data-kind={m.kind}>
          {portal.kinds[m.kind] ?? m.kind}
        </span>
        <time dateTime={m.createdAt}>{when(m.createdAt)}</time>
      </div>
      <h3 id={title}>{m.name || portal.noName}</h3>
      <p className="pWho">{s ? s.organization : "role" in m ? m.role : ""}</p>
      <Reach message={m} say={say} />
      <p className={m.message ? "pText" : "pText pNone"}>{m.message || portal.noMessage}</p>
      {s?.supports?.length > 0 && (
        <div className="pSupports">
          <span className="pLabel">{portal.supports}</span>
          <ul>
            {s.supports.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>
      )}
      {confirming ? (
        <div
          className="pActions pConfirm"
          role="group"
          aria-labelledby={title + "-confirm"}
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirming(false);
          }}
        >
          <p id={title + "-confirm"}>{portal.confirm}</p>
          <button ref={keep} type="button" className="pAction" onClick={() => setConfirming(false)}>
            {portal.no}
          </button>
          <button type="button" className="pAction pDanger" disabled={busy} onClick={() => remove(m)}>
            {portal.yes}
          </button>
        </div>
      ) : (
        <div className="pActions">
          {changes
            .filter((next) => next !== m.status)
            .map((next) => (
              <button
                key={next}
                type="button"
                className="pAction"
                disabled={busy}
                aria-describedby={title}
                onClick={() => change(m, next)}
              >
                {portal.mark[next]}
              </button>
            ))}
          <button
            ref={ask}
            type="button"
            className="pAction pDelete"
            disabled={busy}
            aria-describedby={title}
            onClick={() => setConfirming(true)}
          >
            {portal.remove}
          </button>
        </div>
      )}
    </article>
  );
}

// The organizers' inbox for the Contact and Sponsor forms.
export function Portal() {
  const [view, setView] = useState<View>("loading"),
    [messages, setMessages] = useState<Message[]>([]),
    [tab, setTab] = useState<Tab>("all"),
    [status, setStatus] = useState<Status>("new"),
    [query, setQuery] = useState(""),
    [note, setNote] = useState(""),
    [signInNote, setSignInNote] = useState(""),
    [trouble, setTrouble] = useState(""),
    [refreshing, setRefreshing] = useState(false),
    [busy, setBusy] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    summary = useRef<HTMLParagraphElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Read out by screen readers and shown for a moment at the foot of the window.
  function say(text: string) {
    clearTimeout(timer.current);
    setNote("");
    timer.current = setTimeout(() => {
      setNote(text);
      timer.current = setTimeout(() => setNote(""), 5000);
    }, 50);
  }
  function signedOut(why: string) {
    setMessages([]);
    setQuery("");
    setSignInNote(why);
    setView("signin");
  }
  // true once the inbox is showing
  async function load(again = false) {
    try {
      const { status, data } = await call("/api/portal/messages/");
      if (status === 200 && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setView("inbox");
        return true;
      }
      if (status === 401) signedOut(again ? portal.signIn.ended : "");
      else if (status === 503) setView("setup");
      else if (again) say(portal.trouble.server);
      else {
        setTrouble(portal.trouble.server);
        setView("trouble");
      }
    } catch {
      if (again) say(portal.trouble.offline);
      else {
        setTrouble(portal.trouble.offline);
        setView("trouble");
      }
    }
    return false;
  }
  useEffect(() => {
    load();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (view === "inbox") heading.current?.focus();
  }, [view]);

  async function refresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }
  async function signOut() {
    try {
      if ((await call("/api/portal/session/", "DELETE")).status === 200) return signedOut(portal.signIn.out);
    } catch {}
    say(portal.signOutFailed);
  }
  // After a change the card usually leaves this list, so the focus waits on the line above it.
  async function send(m: Message, method: "PATCH" | "DELETE", next?: Status) {
    setBusy(m.id);
    try {
      const { status: code } = await call(
        `/api/portal/messages/${encodeURIComponent(m.id)}/`,
        method,
        next ? { status: next } : undefined,
      );
      if (code === 200 && next) setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
      if ((code === 200 && !next) || code === 404) setMessages((all) => all.filter((x) => x.id !== m.id));
      if (code === 200 || code === 404) {
        say(code === 404 ? portal.gone : next ? portal.done[next] : portal.done.deleted);
        summary.current?.focus();
      } else if (code === 401) signedOut(portal.signIn.ended);
      else if (code === 503) setView("setup");
      else say(portal.failed);
    } catch {
      say(portal.failed);
    }
    setBusy("");
  }

  if (view !== "inbox")
    return (
      <div className="portal portalAlone">
        {view === "loading" && (
          <p className="pInfo" role="status">
            {portal.loading}
          </p>
        )}
        {view === "signin" && <SignIn note={signInNote} signIn={() => load()} setUp={() => setView("setup")} />}
        {view === "setup" && (
          <div className="pPanel">
            <p className="pBrand">{portal.brand}</p>
            <h1>{portal.setup.title}</h1>
            <p>{portal.setup.text}</p>
          </div>
        )}
        {view === "trouble" && (
          <div className="pPanel">
            <p className="pBrand">{portal.brand}</p>
            <h1>{portal.trouble.title}</h1>
            <p>{trouble}</p>
            <button type="button" className="pButton" onClick={() => load()}>
              {portal.trouble.retry}
            </button>
          </div>
        )}
      </div>
    );

  const q = fold(query.trim());
  const found = q ? messages.filter((m) => words(m).includes(q)) : messages;
  // what a button would show if it were pressed, given the other row and the search
  const count = (t: Tab, s: Status) => found.filter((m) => (t === "all" || m.kind === t) && m.status === s).length;
  const shown = found.filter((m) => (tab === "all" || m.kind === tab) && m.status === status);
  const fresh = messages.filter((m) => m.status === "new").length;

  return (
    <div className="portal">
      <div className="pBar">
        <p className="pBrand">{portal.brand}</p>
        <h1 ref={heading} tabIndex={-1}>
          {portal.heading}
          {fresh > 0 && <span className="pFresh">{portal.fresh(fresh)}</span>}
        </h1>
        <div className="pBarActions">
          <button type="button" className="pAction" onClick={refresh} disabled={refreshing}>
            {refreshing ? portal.refreshing : portal.refresh}
          </button>
          <button type="button" className="pAction" onClick={signOut}>
            {portal.signOut}
          </button>
        </div>
      </div>
      <main className="pMain">
        <div className="pFilters">
          <div className="pSegments" role="group" aria-label={portal.kindLabel}>
            {tabs.map((t) => (
              <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
                {portal.kinds[t]}
                <span className="pCount">{count(t, status)}</span>
              </button>
            ))}
          </div>
          <div className="pSegments" role="group" aria-label={portal.statusLabel}>
            {statuses.map((s) => (
              <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {portal.statuses[s]}
                <span className="pCount">{count(tab, s)}</span>
              </button>
            ))}
          </div>
          <div className="pSearch">
            <label htmlFor="portal-search">{portal.search}</label>
            <input
              id="portal-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder={portal.searchHint}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p ref={summary} tabIndex={-1} className="pSummary">
          {portal.shown(shown.length, portal.statuses[status], query.trim())}
        </p>
        {shown.length ? (
          <ol className="pList">
            {shown.map((m) => (
              <li key={m.id}>
                <Card
                  message={m}
                  busy={busy === m.id}
                  change={(x, next) => send(x, "PATCH", next)}
                  remove={(x) => send(x, "DELETE")}
                  say={say}
                />
              </li>
            ))}
          </ol>
        ) : (
          !q && <p className="pEmpty">{portal.empty[status]}</p>
        )}
      </main>
      <p className="pNote" role="status">
        {note}
      </p>
    </div>
  );
}
