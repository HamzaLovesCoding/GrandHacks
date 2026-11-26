// San Francisco from the east: Twin Peaks with Sutro Tower, Coit Tower on Telegraph Hill, downtown
// with the Transamerica Pyramid and Salesforce Tower, and a street of row houses in front.
// No bridge: the Golden Gate belongs to the hero. Windows light up as --night rises.

type Box = [x: number, top: number, w: number];
const BASE = 372;

const towers: Box[] = [
  [640, 312, 30],
  [674, 292, 28],
  [706, 320, 24],
  [734, 262, 38],
  [818, 300, 28],
  [850, 276, 30],
  [926, 296, 30],
  [960, 318, 32],
  [996, 334, 28],
  [1028, 344, 30],
];

const houses = Array.from({ length: 27 }, (_, i) => ({
  x: i * 46 - 10,
  // the street climbs to the left
  top: 384 + ((i * 5) % 4) * 6 - Math.max(0, 12 - i) * 2.4,
  gable: i % 3 !== 1,
}));

// A fixed pattern rather than Math.random, so the server and the browser draw the same windows.
const on = (a: number, b: number) => (a * 7 + b * 3) % 5 < 2;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

const far = [
  "M0 320C70 302 140 290 200 292C240 268 272 246 300 242C318 236 336 236 352 240C372 246 392 254 420 258",
  "C500 268 590 284 680 292C800 300 940 298 1060 300C1120 301 1160 298 1200 296V440H0Z",
  // Sutro Tower
  "M313 240L322 176H330L339 240Z",
  rect(323, 134, 6, 44),
  rect(300, 158, 52, 5),
  rect(305, 134, 42, 5),
  rect(301, 112, 4, 51),
  rect(324, 104, 4, 35),
  rect(347, 112, 4, 51),
].join("");

const city = [
  ...towers.map(([x, top, w]) => rect(x, top, w, BASE - top)),
  // Transamerica Pyramid and its spire
  `M776 ${BASE}L791 160H797L812 ${BASE}Z`,
  rect(793, 122, 2, 40),
  // Salesforce Tower
  `M884 ${BASE}V196C884 166 920 166 920 196V${BASE}Z`,
].join("");

const near = [
  "M0 368C90 350 180 344 270 350C350 356 420 356 480 346C510 330 536 316 560 314C588 312 612 326 640 342",
  "C690 362 780 366 880 364C1000 362 1100 358 1200 354V440H0Z",
  // Coit Tower
  rect(552, 268, 16, 50),
  rect(549, 261, 22, 7),
  rect(554, 254, 12, 7),
].join("");

const street = houses
  .map(({ x, top, gable }) =>
    gable ? `M${x} 440V${top}L${x + 23} ${top - 14}L${x + 46} ${top}V440Z` : rect(x, top, 46, 440 - top) + rect(x - 2, top - 4, 50, 5),
  )
  .join("");

const windows = [
  ...towers.flatMap(([x, top, w], t) => {
    const out: string[] = [];
    for (let c = 0; x + 5 + c * 8 < x + w - 5; c++)
      for (let r = 0; top + 8 + r * 12 < BASE - 10; r++) if (on(c + t, r)) out.push(rect(x + 5 + c * 8, top + 8 + r * 12, 3, 5));
    return out;
  }),
  // the Salesforce Tower's lit crown
  rect(887, 184, 30, 8),
  ...houses.flatMap(({ x, top }, i) => [0, 1].filter((k) => on(i, k + 1)).map((k) => rect(x + (k ? 28 : 10), top + 12, 8, 12))),
].join("");

// also drawn into the saved name tag
export const skylinePaths = { far, city, near, street };

export function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 1200 440" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path className="far" d={far} />
      <path className="city" d={city} />
      <path className="near" d={near} />
      <path className="street" d={street} />
      <path className="lit" d={windows} />
      <g className="beacon">
        <circle cx="303" cy="111" r="2.6" />
        <circle cx="326" cy="103" r="2.6" />
        <circle cx="349" cy="111" r="2.6" />
      </g>
    </svg>
  );
}
