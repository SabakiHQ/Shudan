import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  board,
  renderGoban,
  seedRandom,
  count,
  countVertexClass,
  indicesFor,
  renderedAxis,
} from "./support.js";

describe("Goban: geometry", () => {
  it("renders the right vertex count and size class for common boards", () => {
    for (const size of [9, 13, 19]) {
      const c = renderGoban({ signMap: board(size, size) });
      expect(count(c, ".shudan-vertex")).toBe(size * size);
      expect(c.querySelector(`.shudan-board-${size}x${size}`)).toBeTruthy();
      const goban = c.querySelector(".shudan-goban");
      expect(goban.getAttribute("data-shudan-board-width")).toBe(String(size));
      expect(goban.getAttribute("data-shudan-board-height")).toBe(String(size));
    }
  });

  it("crops to rangeX/rangeY on the correct inclusive boundaries", () => {
    const c = renderGoban({
      signMap: board(19, 19),
      rangeX: [3, 7],
      rangeY: [2, 5],
    });

    // 5 columns (3..7) x 4 rows (2..5).
    expect(count(c, ".shudan-vertex")).toBe(5 * 4);
    expect([...renderedAxis(c, "x")].sort((a, b) => a - b)).toEqual([
      3, 4, 5, 6, 7,
    ]);
    expect([...renderedAxis(c, "y")].sort((a, b) => a - b)).toEqual([
      2, 3, 4, 5,
    ]);
  });
});

describe("Goban: degenerate inputs", () => {
  it("renders an empty board with no vertices", () => {
    const c = renderGoban();
    expect(count(c, ".shudan-vertex")).toBe(0);
    expect(c.querySelector(".shudan-board-0x0")).toBeTruthy();
  });

  it("treats rows-without-columns as width 0", () => {
    const c = renderGoban({ signMap: [[], [], []] });
    expect(count(c, ".shudan-vertex")).toBe(0);
    expect(c.querySelector(".shudan-board-0x3")).toBeTruthy();
    expect(
      c.querySelector(".shudan-goban").getAttribute("data-shudan-board-height"),
    ).toBe("3");
  });
});

describe("Goban: prop -> class wiring (representative)", () => {
  // One board exercising several maps at once -- a contract check that the
  // wiring holds, not an exhaustive per-prop sweep.
  it("maps signMap / markers / heat / selected / dimmed to their classes", () => {
    const c = renderGoban({
      signMap: [
        [1, -1, 0],
        [0, 1, 0],
        [-1, 0, 1],
      ],
      markerMap: [
        [{ type: "circle" }, { type: "label", label: "Q" }, null],
        [null, null, null],
        [null, null, null],
      ],
      heatMap: [
        [null, null, null],
        [null, { strength: 7, text: "hot" }, null],
        [null, null, null],
      ],
      selectedVertices: [[0, 0]],
      dimmedVertices: [[2, 2]],
    });

    expect(countVertexClass(c, "shudan-sign_1")).toBe(3);
    expect(countVertexClass(c, "shudan-sign_-1")).toBe(2);
    expect(count(c, ".shudan-marker_circle")).toBe(1);
    expect(count(c, ".shudan-marker_label")).toBe(1);
    expect(c.textContent).toContain("Q");
    expect(countVertexClass(c, "shudan-heat_7")).toBe(1);
    expect(c.textContent).toContain("hot");
    expect(countVertexClass(c, "shudan-selected")).toBe(1);
    expect(countVertexClass(c, "shudan-dimmed")).toBe(1);
  });

  it("renders coordinates and line/arrow markup on request", () => {
    const coords = renderGoban({ signMap: board(5, 5), showCoordinates: true });
    expect(coords.querySelector(".shudan-coordinates")).toBeTruthy();
    expect(count(coords, ".shudan-coordx")).toBe(2);
    expect(count(coords, ".shudan-coordy")).toBe(2);
    expect(coords.textContent).toContain("A");
    expect(coords.textContent).toContain("E");

    const lines = renderGoban({
      signMap: board(5, 5),
      lines: [
        { v1: [0, 0], v2: [4, 4], type: "line" },
        { v1: [4, 0], v2: [0, 4], type: "arrow" },
      ],
    });
    expect(count(lines, ".shudan-line")).toBe(1);
    expect(count(lines, ".shudan-arrow")).toBe(1);
  });
});

describe("Goban: stone variations (seeded)", () => {
  let restore;
  beforeEach(() => (restore = seedRandom(42)));
  afterEach(() => restore());

  const blackBoard = () => board(19, 19, 1);

  it("assigns varied variation indices in 0..4 by default", () => {
    const c = renderGoban({ signMap: blackBoard() });
    expect(countVertexClass(c, "shudan-sign_1")).toBe(361);

    const indices = indicesFor(c, "shudan-random_");
    expect(indices.length).toBeGreaterThan(0);
    expect(Math.min(...indices)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...indices)).toBeLessThanOrEqual(4);
    expect(
      new Set(indices).size,
      "variations must actually vary",
    ).toBeGreaterThan(1);
  });

  it("expands the range when a theme declares more variations", () => {
    const indices = indicesFor(
      renderGoban({ signMap: blackBoard(), stoneVariationCounts: { 1: 12 } }),
      "shudan-random_",
    );
    expect(Math.max(...indices)).toBeLessThanOrEqual(11);
    // count > 5 must reach indices the default range cannot
    expect(Math.max(...indices)).toBeGreaterThanOrEqual(5);
  });

  it("applies per-color counts independently", () => {
    const white = indicesFor(
      renderGoban({
        signMap: board(19, 19, -1),
        stoneVariationCounts: { "-1": 8 },
      }),
      "shudan-random_",
    );
    expect(Math.max(...white)).toBeLessThanOrEqual(7);
    expect(Math.max(...white)).toBeGreaterThanOrEqual(5);
  });

  it("falls back to the default of 5 for invalid counts", () => {
    for (const bad of [0, -3, 2.5, "nope"]) {
      const indices = indicesFor(
        renderGoban({
          signMap: blackBoard(),
          stoneVariationCounts: { 1: bad },
        }),
        "shudan-random_",
      );
      // invalid count should clamp to the default 5 (indices 0..4)
      expect(Math.max(...indices), `count ${bad}`).toBeLessThanOrEqual(4);
    }
  });
});

describe("Goban: fuzzy placement (seeded)", () => {
  let restore;
  beforeEach(() => (restore = seedRandom(7)));
  afterEach(() => restore());

  it("varies shifts when enabled and applies none when disabled", () => {
    const on = indicesFor(
      renderGoban({ signMap: board(9, 9, 1), fuzzyStonePlacement: true }),
      "shudan-shift_",
    );
    expect(new Set(on).size, "fuzzy should vary shifts").toBeGreaterThan(1);
    expect(Math.max(...on)).toBeGreaterThan(0);

    const off = indicesFor(
      renderGoban({ signMap: board(9, 9, 1), fuzzyStonePlacement: false }),
      "shudan-shift_",
    );
    expect(off.length, "no fuzzy -> no shift classes").toBe(0);
  });
});
