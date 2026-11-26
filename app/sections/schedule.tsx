"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CityMotion } from "../components/city-motion";
import { Accent } from "../components/accent";
import { cityLight, clockAt, PHASES, readScroll, scrollFor, stampTime } from "../components/clock";
import { building, schedule, stamps } from "../content";
import "./schedule.css";

const last = PHASES - 1;

export function Schedule() {
  const track = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const run = track.current!, frame = scene.current!;
    const staticList = matchMedia("(prefers-reduced-motion: reduce), (max-height: 480px)");
    let raf = 0;
    function paint() {
      raf = 0;
      if (staticList.matches) return;
      const box = run.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      setProgress(Math.max(0, Math.min(1, -box.top / (box.height - frame.offsetHeight))));
    }
    function queue() {
      raf ||= requestAnimationFrame(paint);
    }
    paint();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    staticList.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      staticList.removeEventListener("change", queue);
    };
  }, []);

  function seek(step: number) {
    const run = track.current!, frame = scene.current!;
    const position = scrollFor(Math.max(0, Math.min(last, step)));
    const top = run.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + position * (run.offsetHeight - frame.offsetHeight), behavior: "instant" });
    setProgress(position);
  }

  const { time, step } = readScroll(progress);
  const minute = Math.floor(time);
  const clock = clockAt(minute);
  const light = cityLight(time);
  const index = stamps.findLastIndex((stamp) => stamp.at <= minute);
  const stop = stamps[index];
  // A meal or office hour has a start only. Between scheduled activities the build continues.
  const active = minute < (stop.until ?? stop.at + 1) ? stop : building;
  const inBuild = minute >= building.at && minute < building.until;
  const next = stamps[index + 1];
  const nextClock = next && clockAt(next.at);
  const previousIndex = minute > stop.at ? index : index - 1;

  return (
    <section id="schedule" className="schedule" data-tone="fog" aria-labelledby="schedule-title">
      <div className="run" ref={track} data-tone="scene">
        <div className="scene" ref={scene}>
          <div className="plate" aria-hidden="true">
            {(["afternoon", "morning", "sunset", "night"] as const).map((period) => (
              <picture key={period} className={`city-${period}`} style={{ opacity: period === "afternoon" ? 1 : light[period] }}>
                <source media="(max-aspect-ratio: 4/5)" srcSet={`/media/chinatown/${period}-portrait.webp`} />
                <img src={`/media/chinatown/${period}.webp`} alt="" loading="lazy" decoding="async" />
              </picture>
            ))}
            <CityMotion time={time} light={light} paused={paused} />
          </div>
          <div className="sceneShade" />
          <div className="sceneHead">
            <div className="sceneTitleRow">
              <h2 className="head" id="schedule-title"><Accent parts={schedule.title} /></h2>
              <button type="button" className="cityMotionToggle" onClick={() => setPaused(!paused)}
                aria-label={paused ? "Play city animation" : "Pause city animation"}
                title={paused ? "Play city animation" : "Pause city animation"}>
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                  <path d={paused ? "M4 2.5 13 8l-9 5.5z" : "M3 2.5h3.5v11H3zm6.5 0H13v11H9.5z"} />
                </svg>
              </button>
            </div>
            <p className="sceneCare">
              {schedule.care} <a className="textLink" href="/parents/">{schedule.careLink}</a>
            </p>
          </div>
          <div className="clock" aria-hidden="true">
            <b className="clockDigits">{clock.digits}</b>
            <span><b className="clockHalf">{clock.half}</b><i className="clockDay">{clock.day} · PT</i></span>
          </div>
          <div className="timeline">
            <div className="agendaFocus">
              <div className="agendaCurrent">
                <small>{stampTime(active)}</small>
                <strong>{active.what}</strong>
                {inBuild && <p>{active === building ? "24 hours to build" : "During the 24-hour project build"}</p>}
              </div>
              <div className="agendaControls">
                {next && nextClock && <div className="agendaNext">
                  <small>Up next · {nextClock.day !== clock.day && "Sun "}{nextClock.text}</small>
                  <span>{next.what}</span>
                </div>}
                <div className="agendaArrows">
                  <button type="button" aria-label="Previous schedule item" disabled={previousIndex < 0} onClick={() => seek(previousIndex)}>←</button>
                  <button type="button" aria-label="Next schedule item" disabled={!next} onClick={() => seek(index + 1)}>→</button>
                </div>
              </div>
            </div>
            <div className="ruler" style={{ "--fill": step / last } as CSSProperties}>
              <div className="ticks" aria-hidden="true">
                {stamps.map((stamp, i) => <i key={stamp.at} style={{ left: `${100 * i / last}%` }} data-past={i <= index || undefined} />)}
                <em />
              </div>
              <input type="range" min="0" max={last} step="0.01" value={step.toFixed(2)}
                aria-label={schedule.ruler} aria-valuetext={`${clock.day}, ${clock.text} Pacific. ${active.what}`}
                onChange={(event) => seek(Number(event.target.value))}
                onKeyDown={(event) => {
                  if (["ArrowRight", "ArrowUp"].includes(event.key)) seek(index + 1);
                  else if (["ArrowLeft", "ArrowDown"].includes(event.key)) seek(previousIndex);
                  else return;
                  event.preventDefault();
                }}
              />
            </div>
            <div className="rulerEnds" aria-hidden="true"><span>Sat · {clockAt(stamps[0].at).text}</span><span>Sun · {clockAt(stamps[last].at).text}</span></div>
          </div>
          <ol className="agendaList" aria-label="Full schedule, Pacific time">
            {stamps.map((stamp) => <li key={stamp.at}><small>{stampTime(stamp)}</small><strong>{stamp.what}</strong></li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
