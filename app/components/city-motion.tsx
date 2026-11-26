"use client";
import { useEffect, useRef } from "react";
import { cityLight } from "./clock";

type Light = ReturnType<typeof cityLight>;
type Rect = readonly [x: number, y: number, width: number, height: number];
const W = 1672, H = 941;

// Coordinates in the original painting. Each crop contains one room or a small bank of offices.
const windows: Rect[] = [
  [334, 321, 28, 48], [334, 439, 31, 63], [331, 543, 32, 65], [378, 548, 22, 59],
  [292, 645, 28, 66], [333, 649, 31, 65], [379, 755, 24, 64],
  [765, 455, 23, 19], [786, 482, 30, 20], [770, 517, 29, 21], [794, 539, 26, 16],
  [763, 554, 30, 24], [788, 575, 34, 15], [779, 375, 20, 25], [777, 411, 28, 24],
  [617, 486, 42, 25], [674, 522, 39, 13], [706, 469, 28, 29], [615, 549, 45, 31],
  [901, 410, 37, 30], [981, 379, 32, 28], [989, 418, 25, 26], [1029, 403, 16, 20],
  [1080, 333, 48, 24], [1082, 366, 49, 23], [1098, 417, 35, 21], [1146, 410, 24, 25],
  [1060, 471, 24, 41], [930, 510, 44, 26], [889, 552, 39, 28], [1242, 410, 31, 27],
  [1310, 653, 26, 83], [1356, 652, 31, 90], [1402, 660, 30, 83], [1302, 808, 35, 90],
  [1589, 476, 43, 124], [1482, 493, 20, 81],
];

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Extract the lit panes themselves, retaining the painting's curtains, mullions and silhouettes.
function windowSprites(image: HTMLImageElement) {
  const crop = (W - image.naturalWidth) / 2;
  return windows.flatMap(([x, y, w, h], i) => {
    if (x < crop || x + w > W - crop) return [];
    const mask = surface(w, h), ctx = mask.getContext("2d")!;
    ctx.drawImage(image, x - crop, y, w, h, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h);
    for (let p = 0; p < pixels.data.length; p += 4) {
      const [r, g, b] = [pixels.data[p], pixels.data[p + 1], pixels.data[p + 2]];
      pixels.data[p + 3] = Math.max(0, Math.min(255, (r - b - 20) * 3, (g - 22) * 5, (r - 65) * 4));
    }
    ctx.putImageData(pixels, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#0b2036";
    ctx.fillRect(0, 0, w, h);
    const glow = surface(w + 16, h + 16), g = glow.getContext("2d")!;
    g.drawImage(mask, 8, 8);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#ffda8c";
    g.fillRect(0, 0, glow.width, glow.height);
    g.globalCompositeOperation = "destination-over";
    g.shadowColor = "#ffa32b";
    g.shadowBlur = 5;
    g.drawImage(mask, 8, 8);
    return [{ x, y, mask, glow, i }];
  });
}

// A soft, irregular bank of fog. Only its position changes during playback.
function fogSprite() {
  const mist = surface(340, 58), g = mist.getContext("2d")!;
  g.scale(1, 0.27);
  for (let i = 0; i < 21; i++) {
    const x = 35 + i * 13.4, y = 105 + Math.sin(i * 1.8) * 26, r = 30 + 14 * Math.sin(i * 0.8);
    const light = g.createRadialGradient(x, y, 0, x, y, r);
    light.addColorStop(0, "rgba(239,229,233,.52)");
    light.addColorStop(1, "rgba(230,228,238,0)");
    g.fillStyle = light;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return mist;
}

function drawDay(ctx: CanvasRenderingContext2D, t: number, light: Light, fog: HTMLCanvasElement) {
  const daylight = (1 - light.night) * (1 - 0.82 * light.sunset);
  if (daylight < 0.01) return;
  if (light.morning > 0.01) {
    ctx.globalAlpha = light.morning * daylight * 0.68;
    ctx.drawImage(fog, 451 + 80 * Math.sin(t / 17), 476, 490, 57);
    ctx.globalAlpha *= 0.78;
    ctx.drawImage(fog, 773 + 105 * Math.sin(t / 22 + 1.4), 445, 580, 64);
  }
  // Gulls bank across the gap between the dome and the towers.
  const flight = (t * 0.016 + 0.46) % 1;
  const flock = daylight * Math.min(1, flight * 12, (1 - flight) * 12);
  ctx.strokeStyle = "#273745";
  ctx.lineWidth = 1.45;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const x = 430 + flight * 645 - i * 13;
    const y = 248 - 45 * Math.sin(flight * Math.PI) + Math.sin(i * 2.3) * 12 + i * 3;
    const wing = Math.sin(t * 3.9 + i * 1.4) * 2.1 - 1.4;
    ctx.globalAlpha = flock * (0.78 - i * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - 5, y + wing);
    ctx.quadraticCurveTo(x - 2, y - 1, x, y + 1.5);
    ctx.quadraticCurveTo(x + 2, y - 1, x + 5, y + wing);
    ctx.stroke();
  }
}

const streetlamps = [[623, 865, 25], [982, 863, 25], [685, 795, 18], [931, 792, 18],
  [731, 748, 13], [894, 758, 13], [771, 697, 8], [846, 701, 8]] as const;

function drawStreet(ctx: CanvasRenderingContext2D, t: number, strength: number) {
  if (strength < 0.01) return;
  for (let i = 0; i < 10; i++) {
    const inbound = i % 2 === 0;
    const progress = (t * (0.047 + i % 3 * 0.003) + i * 0.269) % 1;
    const depth = (inbound ? progress : 1 - progress) ** 2;
    const x = 807 + (inbound ? 41 : -31) * depth;
    const y = 642 + 307 * depth;
    const gap = 0.6 + depth * 4.2, r = 0.65 + depth * 1.7;
    ctx.globalAlpha = strength * Math.min(1, progress * 12, (1 - progress) * 12);
    ctx.fillStyle = inbound ? "#ffeabb" : "#ff6247";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(x + side * gap, y, r, r * 0.70, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function CityMotion({ time, light, paused }: { time: number; light: Light; paused: boolean }) {
  const layer = useRef<HTMLCanvasElement>(null);
  const conditions = useRef({ time, light });
  // The ambient clock runs independently while the visitor holds a schedule stop.
  useEffect(() => { conditions.current = { time, light }; }, [time, light]);

  useEffect(() => {
    if (paused) return;
    const canvas = layer.current!;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    const nightImage = canvas.parentElement!.querySelector<HTMLImageElement>(".city-night img")!;
    const still = matchMedia("(prefers-reduced-motion: reduce), (max-height: 480px)");
    const fog = fogSprite();
    const halo = surface(64, 64), lamp = halo.getContext("2d")!;
    const gradient = lamp.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "#fff4ca");
    gradient.addColorStop(0.12, "#ffe39c");
    gradient.addColorStop(0.3, "rgba(255,179,61,.48)");
    gradient.addColorStop(1, "rgba(255,142,30,0)");
    lamp.fillStyle = gradient;
    lamp.fillRect(0, 0, 64, 64);
    let rooms: ReturnType<typeof windowSprites> = [];
    let visible = false, raf = 0, previous = 0, elapsed = 0, source = "";
    let scale = 1, left = 0, top = 0;

    function resize() {
      const ratio = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      // The phone artwork is a centered 752px crop of the same 1672px painting.
      const artWidth = matchMedia("(max-aspect-ratio: 4/5)").matches ? 752 : W;
      scale = Math.max(canvas.width / artWidth, canvas.height / H);
      left = (canvas.width - W * scale) / 2;
      top = (canvas.height - H * scale) / 2;
    }

    function refreshRooms() {
      if (visible && !still.matches && nightImage.complete && nightImage.naturalWidth && source !== nightImage.currentSrc) {
        source = nightImage.currentSrc;
        rooms = windowSprites(nightImage);
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - previous < 1000 / 24) return;
      elapsed += previous ? Math.min(now - previous, 100) / 1000 : 0;
      previous = now;
      const { time, light } = conditions.current;
      // Scrubbing shifts the breeze, traffic and occupied rooms even when moving backwards.
      const t = elapsed + (time - 510) * 0.16;
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, left, top);
      drawDay(ctx, t, light, fog);
      const evening = Math.max(light.sunset * 0.64, light.night);
      const sun = (1 - light.morning) * (1 - light.night);
      for (const room of rooms) {
        const { x, y, mask, glow, i } = room;
        const wave = Math.sin(t / (2.5 + i % 5) + i * 2.4) + 0.42 * Math.sin(t / 3.7 + i);
        if (evening > 0.01) {
          ctx.globalAlpha = evening * Math.max(0, Math.min(0.94, -wave * 1.7));
          ctx.drawImage(mask, x, y);
          ctx.globalAlpha = evening * Math.max(0, Math.min(0.85, wave));
          ctx.drawImage(glow, x - 8, y - 8);
        }
        // Sun catches one face at a time as a reflection travels along the glass.
        if (sun > 0.01) {
          const reflection = Math.max(0, Math.cos(t * 0.65 - x / 68 + y / 37)) ** 14;
          ctx.globalAlpha = reflection * sun * (0.5 + light.sunset * 0.28);
          if (ctx.globalAlpha > 0.02) ctx.drawImage(glow, x - 8, y - 8);
        }
      }
      if (evening > 0.01) {
        for (const [x, y, radius] of streetlamps) {
          ctx.globalAlpha = evening * (0.68 + 0.18 * Math.sin(t * 0.7 + x));
          ctx.drawImage(halo, x - radius, y - radius, 2 * radius, 2 * radius);
        }
      }
      drawStreet(ctx, t, evening);
      ctx.globalAlpha = 1;
    }

    function sync() {
      cancelAnimationFrame(raf);
      previous = 0;
      if (visible && !document.hidden && !still.matches) {
        refreshRooms();
        raf = requestAnimationFrame(frame);
      }
    }
    const size = new ResizeObserver(resize);
    const watch = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    resize();
    size.observe(canvas);
    watch.observe(canvas);
    nightImage.addEventListener("load", refreshRooms);
    document.addEventListener("visibilitychange", sync);
    still.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      size.disconnect();
      watch.disconnect();
      nightImage.removeEventListener("load", refreshRooms);
      document.removeEventListener("visibilitychange", sync);
      still.removeEventListener("change", sync);
    };
  }, [paused]);

  return <canvas ref={layer} className="cityMotion" hidden={paused} aria-hidden="true" />;
}
