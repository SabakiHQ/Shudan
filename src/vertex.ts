const LETTERS = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

/**
 * A Go coordinate string such as `"A1"`, `"T19"`, or `"AA3"`. The column letter
 * follows standard Go notation (skipping `I`), and the row number is 1-based
 * from the bottom.
 */
export type Vertex = `${string}${number}`;

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
 * @example Vertex(0, 13)  // → "A14"
 * @example Vertex(18, 0)  // → "T1"
 */
export function Vertex(vertex: string): Vertex;
export function Vertex(x: number, y: number): Vertex;
export function Vertex(x: number | string, y?: number): Vertex {
  if (typeof x === "string") {
    return x as Vertex;
  } else {
    return `${xToLetter(x)}${y! + 1}`;
  }
}

/**
 * Parses a Go coordinate string (e.g. `"A6"`, `"T19"`, `"AA3"`) into numerical
 * coordinates (0-based, bottom-left-origin).
 *
 * @example Vertex.parse("A6")  // → [0, 5]
 * @example Vertex.parse("T19") // → [18, 18]
 */
Vertex.parse = function (coord: string): [number, number] {
  const match = coord.toUpperCase().match(/^([A-HJ-Z]+)(\d+)$/);
  if (!match) return [NaN, NaN];
  const [, letters, digits] = match;
  const x = letterToX(letters);
  const y = parseInt(digits, 10) - 1;
  return [x, y];
};
