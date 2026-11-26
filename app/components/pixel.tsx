// Tiny pixel-art icons drawn from text grids ("#" = filled) so they match the hero art.
const icons = {
  moon: [
    "...###..",
    "..##....",
    ".##.....",
    ".##.....",
    ".##.....",
    ".##.....",
    "..##....",
    "...###..",
  ],
  sun: [
    "....#....",
    ".#.....#.",
    "...###...",
    "..#####..",
    "#.#####.#",
    "..#####..",
    "...###...",
    ".#.....#.",
    "....#....",
  ],
  star: [
    "...#...",
    "...#...",
    "..###..",
    "#######",
    "..###..",
    "...#...",
    "...#...",
  ],
  chip: [
    "..#.#.#..",
    ".#######.",
    "##.....##",
    ".#.###.#.",
    "##.###.##",
    ".#.###.#.",
    "##.....##",
    ".#######.",
    "..#.#.#..",
  ],
  bulb: [
    "..#####..",
    ".#.....#.",
    "#..#.#..#",
    "#...#...#",
    "#...#...#",
    ".#..#..#.",
    "..#####..",
    "..#####..",
    "...###...",
  ],
  solo: [
    "...###...",
    "..#####..",
    "..#####..",
    "...###...",
    ".........",
    "..#####..",
    ".#######.",
    ".#######.",
    ".#######.",
  ],
  ai: [
    "....#....",
    "....#....",
    "...###...",
    "..#####..",
    "#########",
    "..#####..",
    "...###...",
    "....#....",
    "....#....",
  ],
  code: [
    "...#..##...",
    "..#...#.#..",
    ".#...#...#.",
    "#....#....#",
    ".#...#...#.",
    "..#.#...#..",
    "...##..#...",
  ],
  robot: [
    "....#....",
    "..#####..",
    ".#.....#.",
    ".#.#.#.#.",
    ".#.....#.",
    "..#####..",
    ".#######.",
    "##.###.##",
    "..#...#..",
  ],
  game: [
    ".#########.",
    "##.#####.##",
    "#...###.#.#",
    "##.#####.##",
    "###########",
    "####...####",
    ".##.....##.",
  ],
  rocket: [
    "....#....",
    "...###...",
    "...#.#...",
    "...###...",
    "...###...",
    "..#####..",
    ".##.#.##.",
    ".#..#..#.",
    "....#....",
  ],
  heart: [
    ".##...##.",
    "####.####",
    "#########",
    "#########",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
  ],
  trophy: [
    "#########",
    "#.##o##.#",
    "#.#####.#",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
    "..#####..",
    "..#####..",
  ],
  // "o" pixels are lit: they blink when the icon is animated
  team: [
    ".#...#...#.",
    "###.###.###",
    ".#...#...#.",
    "...........",
    "###.###.###",
    "###.###.###",
    "###.###.###",
  ],
  laptop: [
    ".#########.",
    ".#.......#.",
    ".#.##.o..#.",
    ".#.......#.",
    ".#.####..#.",
    ".#########.",
    "###########",
    ".#########.",
  ],
  demo: [
    "###########",
    "#.........#",
    "#.......o.#",
    "#.....o.o.#",
    "#...o.o.o.#",
    "#.........#",
    "###########",
    ".....#.....",
    "....###....",
  ],
  search: [
    ".####....",
    "#....#...",
    "#....#...",
    "#....#...",
    "#....#...",
    ".####....",
    ".....##..",
    "......##.",
    ".......##",
  ],
};
export type IconName = keyof typeof icons;

// With `animate`, the icon builds itself row by row when it appears, and its lit pixels blink.
export function Pixel({
  name,
  className,
  animate = false,
}: {
  name: IconName;
  className?: string;
  animate?: boolean;
}) {
  const art = icons[name];
  return (
    <svg
      className={animate ? (className ? className + " pxAnim" : "pxAnim") : className}
      viewBox={`0 0 ${art[0].length} ${art.length}`}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {art.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "#" || c === "o" ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              className={c === "o" ? "pxOn" : undefined}
              style={animate ? ({ "--y": y } as React.CSSProperties) : undefined}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export const markG = [
  ".#######.",
  "#########",
  "###....##",
  "###......",
  "###..####",
  "###..####",
  "###....##",
  "#########",
  ".#######.",
];

// The parts of the mark that aren't pixels, in its 62 x 44 drawing.
export const markPaths = {
  brackets: "M10 13 3 22l7 9M52 13l7 9-7 9",
  orbit: "M13 38c9 5 26 2 37-12",
  spark: "M47 1l1.6 4.4L53 7l-4.4 1.6L47 13l-1.6-4.4L41 7l4.4-1.6z",
};

// The GrandHacks <G> mark, rebuilt from the logo: code brackets, a two-tone pixel G,
// an orbit swoosh and a spark. Colors come from CSS so it follows the theme.
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 62 44"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d={markPaths.brackets}
        fill="none"
        stroke="var(--mark-gold)"
        strokeWidth="3.4"
        strokeLinecap="square"
        shapeRendering="auto"
      />
      {markG.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "#" ? (
            <rect
              key={`${x}-${y}`}
              x={17 + x * 3}
              y={9 + y * 3}
              width="3"
              height="3"
              fill={y < 5 ? "var(--mark-top)" : "var(--mark-low)"}
            />
          ) : null,
        ),
      )}
      <path
        d={markPaths.orbit}
        fill="none"
        stroke="var(--mark-orbit)"
        strokeWidth="2.6"
        strokeLinecap="round"
        shapeRendering="auto"
      />
      <path
        d={markPaths.spark}
        fill="var(--mark-gold)"
        shapeRendering="auto"
      />
    </svg>
  );
}
