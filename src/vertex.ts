const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

/**
 * A Go coordinate string such as `"A1"`, `"T19"`, or `"AA3"`. The column letter
 * follows standard Go notation (skipping `I`), and the row number is 1-based
 * from the bottom.
 */
export type Vertex = `${string}${number}`;

/**
 * A range of Go coordinates, represented as a string with two `Vertex` values
 * separated by a colon. For example, `"A1:C3"` represents the rectangle
 * from A1 to C3. Can also be a single `Vertex` string, which is treated as a
 * range of one vertex (e.g. `"D4"` is equivalent to `"D4:D4"`).
 */
export type VertexRange = `${Vertex}:${Vertex}` | Vertex;

/**
 * Converts a Go column letter string (e.g. "A", "Z", "AA") to a 0-based x
 * coordinate.  Letters skip I and wrap into multi-character sequences beyond Z:
 *   A=0, B=1, …, Z=24, AA=25, AB=26, …
 */
export function letterToX(letters: string): number {
  let value = 0;
  for (const ch of letters.toUpperCase()) {
    const idx = LETTERS.indexOf(ch);
    if (idx === -1) return NaN;
    value = value * LETTERS.length + idx + 1;
  }
  return value - 1;
}

/**
 * Converts a 0-based x coordinate back to a Go column letter string.
 *   0→"A", 24→"Z", 25→"AA", …
 */
export function xToLetter(x: number): string {
  let n = x + 1;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % LETTERS.length;
    if (!LETTERS[rem]) return "";
    result = LETTERS[rem] + result;
    n = Math.floor((n - 1) / LETTERS.length);
  }
  return result;
}

/**
 * Converts numerical coordinates (0-based, bottom-left-origin) to a Go coordinate string.
 *
 * @example
 * Vertex(0, 13)  // → "A14"
 * Vertex(18, 0)  // → "T1"
 */
export function Vertex(vertex: string): Vertex;
export function Vertex(x: number, y: number): Vertex;
export function Vertex(x: number | string, y?: number): Vertex {
  if (y == null) {
    return x as Vertex;
  } else {
    return `${xToLetter(x as number)}${y + 1}`;
  }
}

/**
 * Parses a Go coordinate string (e.g. `"A6"`, `"T19"`, `"AA3"`) into numerical
 * coordinates (0-based, bottom-left-origin).
 *
 * @example
 * Vertex.parse("A6")  // → [0, 5]
 * Vertex.parse("T19") // → [18, 18]
 */
Vertex.parse = function (coord: string): [x: number, y: number] {
  const match = coord.toUpperCase().match(/^([A-HJ-Z]+)(\d+)$/);
  if (!match) return [NaN, NaN];
  const [, letters, digits] = match;
  const x = letterToX(letters);
  const y = parseInt(digits, 10) - 1;
  return [x, y];
};

export function VertexRange(range: string): VertexRange;
/**
 * Creates a `VertexRange` string from a single `Vertex`.
 */
export function VertexRange(vertex: Vertex): VertexRange;
/**
 * Creates a `VertexRange` string from a pair of `Vertex` values.
 */
export function VertexRange(start: Vertex, end: Vertex): VertexRange;
export function VertexRange(start: Vertex | string, end?: Vertex): VertexRange {
  if (end == null) {
    return start as VertexRange;
  } else {
    return `${start as Vertex}:${end}`;
  }
}

/**
 * Parses a `VertexRange` string into its start and end `Vertex` values.
 */
VertexRange.parse = function (range: string): [start: Vertex, end: Vertex] {
  if (!range.includes(":")) return [range as Vertex, range as Vertex];
  const [start, end] = range.split(":") as [Vertex, Vertex];
  return [start, end];
};

/**
 * Generates all `Vertex` values within a given `VertexRange`. For example,
 * the range `"A1:C3"` would produce the vertices for the rectangle from A1 to C3.
 */
VertexRange.values = function (range: VertexRange): Vertex[] {
  if (!range.includes(":")) return [range as Vertex];

  const [start, end] = range.split(":") as [Vertex, Vertex];
  const [x1, y1] = Vertex.parse(start);
  const [x2, y2] = Vertex.parse(end);
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return [];

  const result: Vertex[] = [];

  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      result.push(Vertex(x, y));
    }
  }

  return result;
};

/**
 * Indexes an object keyed by `VertexRange` into an object keyed by individual
 * `Vertex` values. Each range key is resolved to all the vertices it covers,
 * and every resulting vertex maps to the same value as its source range.
 *
 * @example
 * VertexRange.index({ "A1:C1": "x", D4: "o" });
 * // → { A1: "x", B1: "x", C1: "x", D4: "o" }
 */
VertexRange.index = function <T>(
  data: Record<VertexRange, T>,
): Record<Vertex, T> {
  const vertexMap: Record<Vertex, T> = {};

  for (const [range, value] of Object.entries(data) as [VertexRange, T][]) {
    for (const vertex of VertexRange.values(range)) {
      vertexMap[vertex] = value;
    }
  }

  return vertexMap;
};
