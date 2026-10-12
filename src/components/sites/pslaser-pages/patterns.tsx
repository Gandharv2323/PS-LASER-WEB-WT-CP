// Original jaali / screen pattern concepts drawn as inline SVG. Each pattern is a repeating tile;
// the "cut" shapes are kept apart by bridges at least ~4 units wide so a plate would stay in one piece.
import type { ReactNode } from "react";

export type PatternSeries = "geometric" | "floral" | "linear";

export type PatternDef = {
  code: string;
  name: string;
  series: PatternSeries;
  note: string;
  tile: { w: number; h: number; rotate?: number };
  shapes: ReactNode;
};

export const patternSeries: { key: "all" | PatternSeries; label: string }[] = [
  { key: "all", label: "All" },
  { key: "geometric", label: "Geometric" },
  { key: "floral", label: "Floral-inspired" },
  { key: "linear", label: "Linear" },
];

const r1 = (n: number) => Math.round(n * 100) / 100;

function hexPoints(cx: number, cy: number, r: number): string {
  return [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${r1(cx + r * Math.cos(a))},${r1(cy + r * Math.sin(a))}`;
    })
    .join(" ");
}

function diamond(cx: number, cy: number, h: number): string {
  return `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
}

/** Repeat an element at several centres (tile corners included so the tile wraps seamlessly). */
function at(points: [number, number][], draw: (x: number, y: number, i: number) => ReactNode): ReactNode {
  return points.map(([x, y], i) => <g key={`${x}-${y}-${i}`}>{draw(x, y, i)}</g>);
}

const corners = (w: number, h: number): [number, number][] => [
  [0, 0],
  [w, 0],
  [0, h],
  [w, h],
];

const LEAF = "M0,-7 Q6,0 0,7 Q-6,0 0,-7Z";
const BUD = "M0,-11 C6,-5 7,3 0,10 C-7,3 -6,-5 0,-11Z";
const SIDE_LEAF = "M-3,9 C-11,6 -12,-1 -10,-4 C-7,1 -5,5 -3,9Z";

export const patterns: PatternDef[] = [
  // ---------------- Geometric ----------------
  {
    code: "PS-G01",
    name: "Hex Lattice",
    series: "geometric",
    note: "Honeycomb cells with even bridges. Strong and light.",
    tile: { w: 30, h: 52 },
    shapes: at([...corners(30, 52), [15, 26]], (x, y) => <polygon points={hexPoints(x, y, 12.5)} />),
  },
  {
    code: "PS-G02",
    name: "Diamond Grid",
    series: "geometric",
    note: "Large diamonds with small diamonds at the crossings.",
    tile: { w: 24, h: 24 },
    shapes: (
      <>
        <polygon points={diamond(12, 12, 8.5)} />
        {at(corners(24, 24), (x, y) => (
          <polygon points={diamond(x, y, 3.5)} />
        ))}
      </>
    ),
  },
  {
    code: "PS-G03",
    name: "Star Lattice",
    series: "geometric",
    note: "Eight-point stars set between small diamonds.",
    tile: { w: 40, h: 40 },
    shapes: (
      <>
        <rect x={11} y={11} width={18} height={18} />
        <rect x={11} y={11} width={18} height={18} transform="rotate(45 20 20)" />
        {at(corners(40, 40), (x, y) => (
          <polygon points={diamond(x, y, 6)} />
        ))}
      </>
    ),
  },
  {
    code: "PS-G04",
    name: "Offset Circles",
    series: "geometric",
    note: "Round perforations in a staggered grid.",
    tile: { w: 28, h: 24 },
    shapes: at([...corners(28, 24), [14, 12]], (x, y) => <circle cx={x} cy={y} r={6.5} />),
  },
  {
    code: "PS-G05",
    name: "Triangle Mesh",
    series: "geometric",
    note: "Alternating triangles in neat bands.",
    tile: { w: 32, h: 28 },
    shapes: (
      <>
        <polygon points="4,22 14,5 24,22" />
        <polygon points="20,5 40,5 30,22" />
        <polygon points="-12,5 8,5 -2,22" />
      </>
    ),
  },
  {
    code: "PS-G06",
    name: "Chevron Bands",
    series: "geometric",
    note: "Stacked chevrons with a bridge between each.",
    tile: { w: 40, h: 24 },
    shapes: <polygon points="3,3.5 20,12 37,3.5 37,11.5 20,20 3,11.5" />,
  },

  // ---------------- Floral-inspired ----------------
  {
    code: "PS-F01",
    name: "Quatrefoil",
    series: "floral",
    note: "Four-lobed motif with round accents at the corners.",
    tile: { w: 32, h: 32 },
    shapes: (
      <>
        <circle cx={11} cy={16} r={6} />
        <circle cx={21} cy={16} r={6} />
        <circle cx={16} cy={11} r={6} />
        <circle cx={16} cy={21} r={6} />
        {at(corners(32, 32), (x, y) => (
          <circle cx={x} cy={y} r={3.5} />
        ))}
      </>
    ),
  },
  {
    code: "PS-F02",
    name: "Four-Petal Bloom",
    series: "floral",
    note: "Simple flowers on a grid, with dots between.",
    tile: { w: 36, h: 36 },
    shapes: (
      <>
        {[0, 90, 180, 270].map((a) => (
          <ellipse key={a} cx={18} cy={11} rx={3.4} ry={7} transform={`rotate(${a} 18 18)`} />
        ))}
        {at(corners(36, 36), (x, y) => (
          <circle cx={x} cy={y} r={2.6} />
        ))}
      </>
    ),
  },
  {
    code: "PS-F03",
    name: "Leaf Trellis",
    series: "floral",
    note: "Leaves set on the diagonal to form a lattice.",
    tile: { w: 32, h: 32 },
    shapes: (
      <>
        <path d={LEAF} transform="translate(8 8) rotate(45)" />
        <path d={LEAF} transform="translate(24 24) rotate(45)" />
        <path d={LEAF} transform="translate(24 8) rotate(-45)" />
        <path d={LEAF} transform="translate(8 24) rotate(-45)" />
      </>
    ),
  },
  {
    code: "PS-F04",
    name: "Six-Petal Rosette",
    series: "floral",
    note: "Rosettes in a honeycomb layout.",
    tile: { w: 30, h: 52 },
    shapes: at([...corners(30, 52), [15, 26]], (x, y) => (
      <>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx={x} cy={y - 6} rx={2.6} ry={6} transform={`rotate(${a} ${x} ${y})`} />
        ))}
      </>
    )),
  },
  {
    code: "PS-F05",
    name: "Lotus Bud",
    series: "floral",
    note: "Upright buds with side leaves in offset rows.",
    tile: { w: 36, h: 40 },
    shapes: at([...corners(36, 40), [18, 20]], (x, y) => (
      <g transform={`translate(${x} ${y})`}>
        <path d={BUD} />
        <path d={SIDE_LEAF} />
        <path d={SIDE_LEAF} transform="scale(-1 1)" />
      </g>
    )),
  },
  {
    code: "PS-F06",
    name: "Dotted Rosette",
    series: "floral",
    note: "A central disc ringed by fine dots.",
    tile: { w: 32, h: 32 },
    shapes: (
      <>
        <circle cx={16} cy={16} r={5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = (a * Math.PI) / 180;
          return <circle key={a} cx={r1(16 + 10 * Math.cos(rad))} cy={r1(16 + 10 * Math.sin(rad))} r={1.9} />;
        })}
        {at(corners(32, 32), (x, y) => (
          <polygon points={diamond(x, y, 2.6)} />
        ))}
      </>
    ),
  },

  // ---------------- Linear ----------------
  {
    code: "PS-L01",
    name: "Staggered Slots",
    series: "linear",
    note: "Vertical slots in alternating columns.",
    tile: { w: 16, h: 56 },
    shapes: (
      <>
        <rect x={2} y={3} width={4} height={22} rx={2} />
        <rect x={10} y={31} width={4} height={22} rx={2} />
      </>
    ),
  },
  {
    code: "PS-L02",
    name: "Louvre Lines",
    series: "linear",
    note: "Long horizontal slots, louvre-style.",
    tile: { w: 70, h: 14 },
    shapes: <rect x={5} y={4.5} width={60} height={5} rx={2.5} />,
  },
  {
    code: "PS-L03",
    name: "Diagonal Rain",
    series: "linear",
    note: "Slanted slots for a sense of movement.",
    tile: { w: 14, h: 40, rotate: 35 },
    shapes: <rect x={4} y={3} width={5} height={34} rx={2.5} />,
  },
  {
    code: "PS-L04",
    name: "Brick Slots",
    series: "linear",
    note: "Short slots in a running-bond layout.",
    tile: { w: 40, h: 32 },
    shapes: (
      <>
        <rect x={3} y={4} width={34} height={7} rx={3.5} />
        <rect x={23} y={20} width={34} height={7} rx={3.5} />
        <rect x={-17} y={20} width={34} height={7} rx={3.5} />
      </>
    ),
  },
  {
    code: "PS-L05",
    name: "Pinstripe Pairs",
    series: "linear",
    note: "Narrow and wide slots in pairs.",
    tile: { w: 24, h: 60 },
    shapes: (
      <>
        <rect x={3} y={4} width={3} height={52} rx={1.5} />
        <rect x={11} y={4} width={7} height={52} rx={3.5} />
      </>
    ),
  },
  {
    code: "PS-L06",
    name: "Square Perforation",
    series: "linear",
    note: "A fine, even grid of square holes.",
    tile: { w: 12, h: 12 },
    shapes: <rect x={3} y={3} width={6} height={6} />,
  },
];

type PatternSvgProps = { pattern: PatternDef; uid: string; title?: boolean };

/** A 2:3 panel: charcoal plate with a solid border; cut-outs shown as warm "light" behind. */
export function PatternSvg({ pattern, uid, title = true }: PatternSvgProps) {
  const pid = `psp-pat-${uid}`;
  const { w, h, rotate } = pattern.tile;
  return (
    <svg
      className="psp-pattern-svg"
      viewBox="0 0 200 300"
      role="img"
      aria-label={title ? `${pattern.code} ${pattern.name} pattern concept` : undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={pid}
          width={w}
          height={h}
          patternUnits="userSpaceOnUse"
          patternTransform={rotate ? `rotate(${rotate})` : undefined}
        >
          <g className="psp-pattern-cut">{pattern.shapes}</g>
        </pattern>
      </defs>
      <rect className="psp-pattern-plate" width="200" height="300" />
      <rect x="14" y="14" width="172" height="272" fill={`url(#${pid})`} />
    </svg>
  );
}
