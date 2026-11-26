"use client";
import { useEffect, useRef, type ReactNode } from "react";

const PULL = 4.4; // natural frequency, rad/s
const DAMP = 0.3; // fraction of critical
const LIMIT = 0.27; // how far it can be pushed, about 15 degrees

// A name tag on a lanyard. One rigid pendulum that swings from the top of the strap: scrolling
// nudges it, and it can be pushed with a finger or a mouse.
export function Hang({ children }: { children: ReactNode }) {
  const zone = useRef<HTMLDivElement>(null);
  const bob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const at = zone.current!, tag = bob.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let angle = 0, speed = 0, raf = 0, last = 0, seen = false, met = false;
    let grab: { id: number; offset: number; target: number } | null = null;

    const paint = () => {
      tag.style.transform = `rotate(${(-angle).toFixed(4)}rad)`;
    };
    function frame(now: number) {
      raf = 0;
      let left = Math.min(0.05, (now - last) / 1000);
      last = now;
      const typing = tag.contains(document.activeElement);
      while (left > 0) {
        const dt = Math.min(left, 1 / 120);
        left -= dt;
        if (grab) speed = (grab.target - angle) * 20;
        else speed += (-PULL * PULL * Math.sin(angle) - 2 * (typing ? 1 : DAMP) * PULL * speed) * dt;
        angle += speed * dt;
      }
      const still = !grab && Math.abs(angle) < 0.0005 && Math.abs(speed) < 0.0008;
      if (still) angle = speed = 0;
      paint();
      if (seen && !still) raf = requestAnimationFrame(frame);
    }
    function wake() {
      if (raf || !seen || reduced.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    // the angle from the top of the strap to the pointer
    const bearing = (e: PointerEvent) => {
      const z = at.getBoundingClientRect();
      return Math.atan2(e.clientX - z.left - z.width / 2, Math.max(40, e.clientY - z.top));
    };
    const down = (e: PointerEvent) => {
      if (reduced.matches || e.button !== 0 || (e.target as Element).closest("input,button,a")) return;
      grab = { id: e.pointerId, offset: bearing(e) - angle, target: angle };
      tag.setPointerCapture(e.pointerId);
      tag.dataset.held = "";
      wake();
    };
    const move = (e: PointerEvent) => {
      if (grab?.id !== e.pointerId) return;
      grab.target = Math.max(-LIMIT, Math.min(LIMIT, bearing(e) - grab.offset));
      wake();
    };
    const up = (e: PointerEvent) => {
      if (grab?.id !== e.pointerId) return;
      grab = null;
      speed = Math.max(-2, Math.min(2, speed));
      delete tag.dataset.held;
    };
    let scrolled = scrollY;
    const sway = () => {
      const dy = Math.max(-50, Math.min(50, scrollY - scrolled));
      scrolled = scrollY;
      if (!seen || grab) return;
      speed += dy * 0.0011;
      wake();
    };
    const watch = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      if (seen && !met && !reduced.matches) {
        met = true;
        angle = 0.1;
      }
      if (seen) wake();
    });
    watch.observe(tag);
    tag.addEventListener("pointerdown", down);
    tag.addEventListener("pointermove", move);
    tag.addEventListener("pointerup", up);
    tag.addEventListener("pointercancel", up);
    window.addEventListener("scroll", sway, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      watch.disconnect();
      tag.removeEventListener("pointerdown", down);
      tag.removeEventListener("pointermove", move);
      tag.removeEventListener("pointerup", up);
      tag.removeEventListener("pointercancel", up);
      window.removeEventListener("scroll", sway);
    };
  }, []);

  return (
    <div className="hang" ref={zone}>
      <div className="bob" ref={bob}>
        <svg className="lanyard" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="strapEdge" d="M27 0 46 100M73 0 54 100" />
          <path className="strap" d="M27 0 46 100M73 0 54 100" />
        </svg>
        <span className="clip" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
