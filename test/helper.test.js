import { describe, it, expect } from "vitest";

import {
  avg,
  range,
  neighborhood,
  vertexEquals,
  lineEquals,
  signEquals,
  getHoshis,
  readjustShifts,
  diffSignMap,
} from "../src/helper.js";

const sortVertices = (vs) => [...vs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

describe("helper: small utilities", () => {
  it("range enumerates 0..n-1 and handles 0", () => {
    expect(range(4)).toEqual([0, 1, 2, 3]);
    expect(range(0)).toEqual([]);
  });

  it("avg averages, and is 0 for the empty list", () => {
    expect(avg([2, 4, 6])).toBe(4);
    expect(avg([])).toBe(0);
  });

  it("neighborhood returns the vertex and its four orthogonal neighbors", () => {
    expect(neighborhood([2, 3])).toEqual([
      [2, 3],
      [1, 3],
      [3, 3],
      [2, 2],
      [2, 4],
    ]);
  });

  it("vertexEquals / lineEquals compare by value", () => {
    expect(vertexEquals([1, 2], [1, 2])).toBe(true);
    expect(vertexEquals([1, 2], [2, 1])).toBe(false);
    expect(
      lineEquals(
        [
          [0, 0],
          [1, 1],
        ],
        [
          [0, 0],
          [1, 1],
        ],
      ),
    ).toBe(true);
    expect(
      lineEquals(
        [
          [0, 0],
          [1, 1],
        ],
        [
          [0, 0],
          [2, 2],
        ],
      ),
    ).toBe(false);
  });

  it("signEquals compares by sign, treating 0 as its own sign", () => {
    expect(signEquals()).toBe(true); // vacuously true
    expect(signEquals(1, 5, 99)).toBe(true);
    expect(signEquals(-1, -7)).toBe(true);
    expect(signEquals(0, 0)).toBe(true);
    expect(signEquals(1, -1)).toBe(false);
    expect(signEquals(1, 0)).toBe(false);
  });
});

describe("helper: getHoshis (star points)", () => {
  it("places the standard nine points on 19x19", () => {
    // The canonical 4-4 / center / side star points (0-indexed).
    const expected = [
      [3, 3],
      [3, 9],
      [3, 15],
      [9, 3],
      [9, 9],
      [9, 15],
      [15, 3],
      [15, 9],
      [15, 15],
    ];
    expect(sortVertices(getHoshis(19, 19))).toEqual(sortVertices(expected));
  });

  it("includes the center and 3-3 corners on 13x13 and 9x9", () => {
    const h13 = getHoshis(13, 13);
    expect(h13.length).toBe(9);
    expect(h13.some(([x, y]) => x === 6 && y === 6)).toBe(true); // center
    for (const [cx, cy] of [
      [3, 3],
      [3, 9],
      [9, 3],
      [9, 9],
    ]) {
      expect(h13.some(([x, y]) => x === cx && y === cy)).toBe(true);
    }

    const h9 = getHoshis(9, 9);
    expect(h9.some(([x, y]) => x === 4 && y === 4)).toBe(true); // center (5-5)
    for (const [cx, cy] of [
      [2, 2],
      [2, 6],
      [6, 2],
      [6, 6],
    ]) {
      expect(h9.some(([x, y]) => x === cx && y === cy)).toBe(true);
    }
  });

  it("returns nothing for boards 6 or smaller", () => {
    expect(getHoshis(6, 6)).toEqual([]);
    expect(getHoshis(5, 9)).toEqual([]);
  });

  it("special-cases 7: only corners, no center or sides", () => {
    expect(sortVertices(getHoshis(7, 7))).toEqual([
      [2, 2],
      [2, 4],
      [4, 2],
      [4, 4],
    ]);
  });

  it("omits center and side points on even boards", () => {
    // 8x8: even in both axes -> only the four corner points.
    expect(sortVertices(getHoshis(8, 8))).toEqual([
      [2, 2],
      [2, 5],
      [5, 2],
      [5, 5],
    ]);
  });
});

describe("helper: readjustShifts (fuzzy-shift de-collision)", () => {
  it("zeroes a horizontal neighbour whose shift would collide", () => {
    // Left cell shifts right (dir 3); right cell's shift 1 is in the removal
    // set for a right-shifting neighbour, so it is cleared.
    expect(readjustShifts([[3, 1]])).toEqual([[3, 0]]);
  });

  it("zeroes a vertical neighbour whose shift would collide", () => {
    // Top cell shifts down (dir 4); bottom cell's shift 5 is removed.
    expect(readjustShifts([[4], [5]])).toEqual([[4], [0]]);
  });

  it("leaves non-colliding shifts untouched", () => {
    expect(readjustShifts([[3, 2]])).toEqual([[3, 2]]);
    expect(readjustShifts([[0, 0]])).toEqual([[0, 0]]);
  });
});

describe("helper: diffSignMap (newly placed stones)", () => {
  const empty = () => [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  it("reports vertices that went from empty to a stone", () => {
    const after = empty();
    after[0][1] = 1;
    after[2][0] = -1;
    expect(sortVertices(diffSignMap(empty(), after))).toEqual([
      [0, 2],
      [1, 0],
    ]);
  });

  it("ignores unchanged, removed, and recoloured stones", () => {
    const before = empty();
    before[0][0] = 1; // existing stone
    const after = empty();
    after[0][0] = -1; // recoloured (not a fresh placement)
    after[1][1] = 1; // genuinely new
    expect(diffSignMap(before, after)).toEqual([[1, 1]]);
  });

  it("returns [] for identical maps or size mismatches", () => {
    const b = empty();
    expect(diffSignMap(b, b)).toEqual([]);
    expect(diffSignMap(empty(), empty())).toEqual([]);
    expect(
      diffSignMap(empty(), [
        [0, 0],
        [0, 0],
      ]),
    ).toEqual([]);
  });
});
