"use client";
import { useEffect, useRef, useState } from "react";

export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const film = video.current!;
    const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (connection?.saveData) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = matchMedia("(max-width: 720px) and (orientation: portrait)");
    let visible = false;

    function sync() {
      if (paused || reduced.matches || !visible || document.hidden) {
        film.pause();
        return;
      }
      const asset = portrait.matches ? "golden-gate-mobile" : "golden-gate";
      const src = `/media/${asset}.mp4`;
      if (film.getAttribute("src") !== src) film.src = src;
      // Browsers that restrict autoplay keep the poster visible.
      void film.play().catch(() => {});
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(film);
    portrait.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      portrait.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      film.pause();
    };
  }, [paused]);

  return (
    <>
      <video
        ref={video}
        className="heroFilm"
        aria-hidden="true"
        tabIndex={-1}
        muted
        playsInline
        loop
        preload="none"
        onPlaying={() => setHasPlayed(true)}
        onError={() => setHasPlayed(false)}
        style={{ opacity: hasPlayed ? 1 : 0 }}
      />
      {hasPlayed && (
        <button
          type="button"
          className="filmToggle"
          aria-label={paused ? "Play background video" : "Pause background video"}
          onClick={() => setPaused(!paused)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            <path d={paused ? "M4 2.5 13 8l-9 5.5z" : "M3 2.5h3.5v11H3zm6.5 0H13v11H9.5z"} />
          </svg>
        </button>
      )}
    </>
  );
}
