"use client";
import { useEffect, useRef, useState } from "react";
import { Foot } from "./components/foot";
import { blankDraft, MessageForm, type Draft } from "./components/message-form";
import { Mark, Pixel } from "./components/pixel";
import { About } from "./sections/about";
import { FAQ } from "./sections/faq";
import "./sections/finale.css";
import { Hero } from "./sections/hero";
import { Parents } from "./sections/parents";
import { Prizes } from "./sections/prizes";
import { Schedule } from "./sections/schedule";
import { Sponsors } from "./sections/sponsors";
import { Tracks } from "./sections/tracks";
import {
  bar,
  calendar,
  firstStory,
  links,
  overlay,
  panels,
  parents,
  sections,
  type Panel,
  type Story,
  type Tell,
} from "./content";
type Modal = Panel | "menu" | null;
const modified = (e: React.MouseEvent) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
function Brand({ expanded = false }: { expanded?: boolean }) {
  return (
    <>
      <Mark />
      {expanded ? (
        <strong>{bar.brand}</strong>
      ) : (
        <span className="iconCycle">
          {(["sun", "moon", "star", "chip"] as const).map((name, i) => (
            <Pixel key={name} name={name} className={"cycle" + i} />
          ))}
        </span>
      )}
    </>
  );
}
// The bar, the overlays and the footer, around either page: the event itself, or /parents.
export default function Event({ page = "home" }: { page?: "home" | "parents" }) {
  const home = page === "home";
  const [modal, setModal] = useState<Modal>(null),
    [at, setAt] = useState(home ? { id: "top", tone: "hero" } : { id: "", tone: "fog" }),
    [story, setStory] = useState<Story>(firstStory),
    [picks, setPicks] = useState<string[]>([]),
    // What's been typed into each form, kept while the page is open so closing one loses nothing.
    [drafts, setDrafts] = useState<{ contact: Draft; sponsor: Draft }>({ contact: blankDraft, sponsor: blankDraft });
  const dialog = useRef<HTMLDialogElement>(null),
    // where the last press on the overlay began, so a drag out of a text box doesn't close it
    pressed = useRef<EventTarget | null>(null),
    opener = useRef<HTMLElement | null>(null),
    afterClose = useRef<(() => void) | undefined>(undefined),
    closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tell: Tell = (next) => setStory((s) => ({ ...s, ...next }));
  const open = (m: Modal) => {
    if (m === "Registration" && links.register) {
      window.open(links.register, "_blank", "noreferrer");
      return;
    }
    if (modal === null) opener.current = document.activeElement as HTMLElement;
    setModal(m);
  };
  function close(after?: () => void) {
    if (closeTimer.current) return;
    dialog.current?.setAttribute("data-closing", "true");
    closeTimer.current = setTimeout(
      () => {
        closeTimer.current = null;
        dialog.current?.removeAttribute("data-closing");
        afterClose.current = after;
        setModal(null);
      },
      matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : 230,
    );
  }
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  const locked = modal !== null;
  useEffect(() => {
    if (!locked) return;
    const d = dialog.current!;
    const position = window.scrollY;
    d.showModal();
    return () => {
      d.close();
      if (window.scrollY !== position) window.scrollTo(0, position);
      opener.current?.focus({ preventScroll: true });
      const navigate = afterClose.current;
      afterClose.current = undefined;
      if (navigate) requestAnimationFrame(navigate);
    };
  }, [locked]);
  useEffect(() => {
    if (locked) {
      dialog.current?.scrollTo(0, 0);
      dialog.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
    }
  }, [modal, locked]);
  // The bar takes the colour of whatever is under it, and the nav marks where you are.
  useEffect(() => {
    const zones = [...document.querySelectorAll<HTMLElement>("main [data-tone], footer")];
    let raf = 0;
    const look = () => {
      raf = 0;
      const zone = zones.findLast((z) => z.getBoundingClientRect().top <= 40);
      // the last section can be too short to ever reach the bar
      const ended = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      const here = ended ? zones.findLast((z) => z.tagName !== "FOOTER") : zone;
      const id = here?.closest("section[id]")?.id ?? (here ? "" : "top"),
        tone = zone?.dataset.tone ?? "hero";
      setAt((was) => (was.id === id && was.tone === tone ? was : { id, tone }));
    };
    const queue = () => {
      raf ||= requestAnimationFrame(look);
    };
    look();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Far jumps land instantly, so the night never plays on fast forward on the way past.
    const far = Math.abs(el.getBoundingClientRect().top) > innerHeight * 2.5;
    el.scrollIntoView({
      behavior: far || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    // carry on from here with the keyboard, instead of from the link that was pressed
    if (el.tabIndex < 0) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  };
  // Links sent around before /parents existed pointed at /#parents.
  useEffect(() => {
    if (home && location.hash === "#parents") location.replace("/parents/");
  }, [home]);
  // A link to the other page is a plain link, so the browser loads that page in full and it works
  // wherever the site is hosted. From the menu it also closes the menu, so Back doesn't reopen it.
  const leave = (e: React.MouseEvent) => {
    if (!modified(e)) close();
  };
  const nav = (menu = false) => [
    ...sections.map((n) => {
      const id = n.toLowerCase();
      return home ? (
        <a
          key={n}
          href={"#" + id}
          aria-current={at.id === id ? "true" : undefined}
          onClick={(e) => {
            if (modified(e)) return;
            e.preventDefault();
            if (menu) close(() => go(id));
            else go(id);
          }}
        >
          {n}
        </a>
      ) : (
        <a key={n} href={"/#" + id} onClick={menu ? leave : undefined}>
          {n}
        </a>
      );
    }),
    <a
      key="parents"
      href="/parents/"
      aria-current={home ? undefined : "page"}
      onClick={(e) => {
        if (home) {
          if (menu) leave(e);
          return;
        }
        if (modified(e)) return;
        e.preventDefault();
        if (menu) close(() => go("parents"));
        else go("parents");
      }}
    >
      {parents.nav}
    </a>,
  ];
  const isMenu = modal === "menu",
    panel = modal && modal !== "menu" ? modal : null,
    kind = panel === "Contact" ? "contact" : panel === "Sponsorship" ? "sponsor" : null,
    past = at.tone !== "hero";
  return (
    <>
      <a className="skip" href={home ? "#about" : "#parents"}>
        {home ? overlay.skip : parents.skip}
      </a>
      <header className={past ? "compact" : ""} data-tone={at.tone}>
        {home ? (
          <a
            className="logo"
            href="#top"
            aria-label={bar.home}
            onClick={(e) => {
              e.preventDefault();
              go("top");
            }}
          >
            <Brand expanded={past} />
          </a>
        ) : (
          <a className="logo" href="/" aria-label={bar.home}>
            <Brand expanded={past} />
          </a>
        )}
        <nav aria-label={bar.nav}>{nav()}</nav>
        {/* always in reach, so registering never depends on the hero card still being open */}
        <button type="button" className="barRegister" onClick={() => open("Registration")}>
          {bar.register}
        </button>
        <button
          className="hamb"
          aria-label={bar.open}
          aria-expanded={isMenu}
          onClick={() => open("menu")}
        >
          <span />
        </button>
      </header>
      <main>
        {home ? (
          <>
            <Hero open={open} />
            <About story={story} tell={tell} />
            <Tracks />
            <Schedule />
            <Prizes />
            <Sponsors picks={picks} setPicks={setPicks} open={open} />
            <FAQ open={open} />
          </>
        ) : (
          <Parents open={open} />
        )}
      </main>
      <footer className="finale" data-tone="deep">
        <Foot open={open} />
      </footer>
      <dialog
        ref={dialog}
        className={isMenu ? "menuDialog" : kind ? "infoDialog formDialog" : "infoDialog"}
        aria-label={isMenu ? bar.dialog : undefined}
        aria-labelledby={panel ? "dialog-title" : undefined}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onPointerDown={(e) => {
          pressed.current = e.target;
        }}
        onClick={(e) => {
          if (!isMenu && e.target === dialog.current && pressed.current === dialog.current) close();
        }}
      >
        {locked && (
          <div className="dialogBody">
            <button
              className="modalClose"
              aria-label={overlay.close}
              onClick={() => close()}
            >
              ×
            </button>
            {isMenu ? (
              <>
                {home ? (
                  <a
                    className="logo menuLogo"
                    href="#top"
                    aria-label={bar.home}
                    onClick={(e) => {
                      e.preventDefault();
                      close(() => go("top"));
                    }}
                  >
                    <Brand />
                  </a>
                ) : (
                  <a className="logo menuLogo" href="/" aria-label={bar.home} onClick={leave}>
                    <Brand />
                  </a>
                )}
                <nav aria-label={bar.menu}>{nav(true)}</nav>
              </>
            ) : (
              panel &&
              (kind ? (
                <MessageForm
                  key={kind}
                  kind={kind}
                  draft={drafts[kind]}
                  setDraft={(next) => setDrafts((was) => ({ ...was, [kind]: next(was[kind]) }))}
                  picks={picks}
                  setPicks={setPicks}
                  onDone={() => close()}
                />
              ) : (
                <>
                  <h2 id="dialog-title">{panels[panel].title}</h2>
                  <p>{panels[panel].text}</p>
                  <p className="dialogActions">
                    <a className="btn" href={calendar.file} download>
                      {overlay.calendar}
                    </a>
                    <a className="textLink" href={calendar.google} target="_blank" rel="noreferrer">
                      {overlay.google}
                    </a>
                  </p>
                </>
              ))
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
