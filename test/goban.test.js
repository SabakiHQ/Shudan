import { createElement as h } from "preact";
import { render } from "preact-render-to-string";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { Goban, BoundedGoban } from "../src/main.js";

function zeros(width, height, fill = 0) {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

function countClass(html, className) {
  const matches = html.match(new RegExp(`\\b${className}\\b`, "g"));
  return matches ? matches.length : 0;
}

function countVertexClass(html, className) {
  // Only counts classes that appear on the vertex container itself, not on
  // nested stone or marker elements.
  const matches = html.match(
    new RegExp(`class="shudan-vertex[^"]*\\b${className}\\b`, "g"),
  );
  return matches ? matches.length : 0;
}

describe("Goban render tests", () => {
  let originalRandom;

  beforeEach(() => {
    originalRandom = Math.random;
    Math.random = () => 0.5;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it("renders an empty board with zero dimensions", () => {
    const html = render(h(Goban));

    expect(html).toContain('data-shudan-board-width="0"');
    expect(html).toContain('data-shudan-board-height="0"');
    expect(html).toContain("shudan-board-0x0");
    expect(countClass(html, "shudan-vertex")).toBe(0);
    expect(html).toMatchSnapshot();
  });

  it("renders common board sizes with the correct vertex counts", () => {
    for (const size of [9, 13, 19]) {
      const html = render(h(Goban, { signMap: zeros(size, size) }));

      expect(html).toContain(`shudan-board-${size}x${size}`);
      expect(html).toContain(`data-shudan-board-width="${size}"`);
      expect(html).toContain(`data-shudan-board-height="${size}"`);
      expect(countClass(html, "shudan-vertex")).toBe(size * size);
    }
  });

  it("renders a partial board when rangeX and rangeY are set", () => {
    const signMap = zeros(19, 19);
    const html = render(
      h(Goban, {
        signMap,
        rangeX: [3, 7],
        rangeY: [2, 5],
      }),
    );

    // 5 columns (3-7) and 4 rows (2-5)
    expect(countClass(html, "shudan-vertex")).toBe(5 * 4);
    expect(html).toContain('data-x="3"');
    expect(html).toContain('data-x="7"');
    expect(html).not.toContain('data-x="2"');
    expect(html).not.toContain('data-x="8"');
    expect(html).toContain('data-y="2"');
    expect(html).toContain('data-y="5"');
    expect(html).not.toContain('data-y="1"');
    expect(html).not.toContain('data-y="6"');
    expect(html).toMatchSnapshot();
  });

  it("renders black and white stones from signMap", () => {
    const signMap = [
      [0, 1, -1],
      [1, 0, 0],
      [-1, 0, 1],
    ];
    const html = render(h(Goban, { signMap }));

    expect(countVertexClass(html, "shudan-sign_1")).toBe(3);
    expect(countVertexClass(html, "shudan-sign_-1")).toBe(2);
    expect(countVertexClass(html, "shudan-sign_0")).toBe(4);
    expect(html).toMatchSnapshot();
  });

  it("dims the requested vertices", () => {
    const signMap = zeros(3, 3);
    const html = render(
      h(Goban, {
        signMap,
        dimmedVertices: [[1, 1]],
      }),
    );

    expect(countVertexClass(html, "shudan-dimmed")).toBe(1);
  });

  it("applies fuzzy stone placement shifts when enabled", () => {
    const signMap = zeros(3, 3);
    const html = render(
      h(Goban, {
        signMap,
        fuzzyStonePlacement: true,
      }),
    );

    expect(countVertexClass(html, "shudan-shift_4")).toBe(9);

    const withoutFuzzy = render(
      h(Goban, {
        signMap,
        fuzzyStonePlacement: false,
      }),
    );

    expect(countVertexClass(withoutFuzzy, "shudan-shift_4")).toBe(0);
  });

  it("renders every markerMap type", () => {
    const markerMap = [
      [{ type: "circle" }, { type: "cross" }, { type: "label", label: "A" }],
      [{ type: "loader" }, { type: "point" }, { type: "square" }],
      [{ type: "triangle" }, null, null],
    ];
    const html = render(h(Goban, { signMap: zeros(3, 3), markerMap }));

    const types = [
      "circle",
      "cross",
      "label",
      "loader",
      "point",
      "square",
      "triangle",
    ];
    for (const type of types) {
      expect(countClass(html, `shudan-marker_${type}`)).toBe(1);
    }

    // Marker containers are rendered once per marked vertex.
    expect(countClass(html, "shudan-marker")).toBe(7);
    expect(html).toContain(">A<");
    expect(html).toMatchSnapshot();
  });

  it("renders heatMap strengths and labels", () => {
    const heatMap = [
      [{ strength: 0 }, { strength: 5, text: "hot" }, null],
      [{ strength: 9 }, { strength: 3 }, null],
      [null, null, { strength: 1 }],
    ];
    const html = render(h(Goban, { signMap: zeros(3, 3), heatMap }));

    expect(countVertexClass(html, "shudan-heat_5")).toBe(1);
    expect(countVertexClass(html, "shudan-heat_9")).toBe(1);
    expect(countVertexClass(html, "shudan-heat_0")).toBe(1);
    expect(html).toContain(">hot<");
    expect(html).toMatchSnapshot();
  });

  it("renders paintMap values", () => {
    const paintMap = [
      [1, -1, 0],
      [0, 1, 0],
      [-1, 0, 0],
    ];
    const html = render(h(Goban, { signMap: zeros(3, 3), paintMap }));

    expect(countVertexClass(html, "shudan-paint_1")).toBe(2);
    expect(countVertexClass(html, "shudan-paint_-1")).toBe(2);
    expect(html).toMatchSnapshot();
  });

  it("renders ghostStoneMap stones and types", () => {
    const ghostStoneMap = [
      [{ sign: 1, type: "good" }, { sign: -1, type: "bad", faint: true }, null],
      [null, null, null],
      [{ sign: 1 }, null, null],
    ];
    const html = render(h(Goban, { signMap: zeros(3, 3), ghostStoneMap }));

    expect(countVertexClass(html, "shudan-ghost_1")).toBe(2);
    expect(countVertexClass(html, "shudan-ghost_-1")).toBe(1);
    expect(countVertexClass(html, "shudan-ghost_good")).toBe(1);
    expect(countVertexClass(html, "shudan-ghost_bad")).toBe(1);
    expect(countVertexClass(html, "shudan-ghost_faint")).toBe(1);
    expect(countClass(html, "shudan-ghost")).toBe(3);
    expect(html).toMatchSnapshot();
  });

  it("renders selected vertices", () => {
    const html = render(
      h(Goban, {
        signMap: zeros(3, 3),
        selectedVertices: [
          [1, 1],
          [2, 2],
        ],
      }),
    );

    expect(countVertexClass(html, "shudan-selected")).toBe(2);
    expect(html).toMatchSnapshot();
  });

  it("renders coordinates when showCoordinates is true", () => {
    const html = render(
      h(Goban, {
        signMap: zeros(5, 5),
        showCoordinates: true,
      }),
    );

    expect(html).toContain("shudan-coordinates");
    expect(countClass(html, "shudan-coordx")).toBe(2);
    expect(countClass(html, "shudan-coordy")).toBe(2);

    for (const label of ["A", "B", "C", "D", "E"]) {
      expect(html).toContain(`>${label}<`);
    }
    for (const label of ["5", "4", "3", "2", "1"]) {
      expect(html).toContain(`>${label}<`);
    }

    expect(html).toMatchSnapshot();
  });

  it("renders lines and arrows", () => {
    const html = render(
      h(Goban, {
        signMap: zeros(5, 5),
        lines: [
          { v1: [0, 0], v2: [4, 4], type: "line" },
          { v1: [4, 0], v2: [0, 4], type: "arrow" },
        ],
      }),
    );

    expect(countClass(html, "shudan-line")).toBe(1);
    expect(countClass(html, "shudan-arrow")).toBe(1);
    expect(html).toMatchSnapshot();
  });

  it("handles degenerate maps gracefully", () => {
    const emptyRows = [[], [], []];
    const html = render(h(Goban, { signMap: emptyRows }));

    expect(html).toContain('data-shudan-board-width="0"');
    expect(html).toContain('data-shudan-board-height="3"');
    expect(html).toContain("shudan-board-0x3");
    expect(countClass(html, "shudan-vertex")).toBe(0);
  });
});

describe("BoundedGoban render tests", () => {
  let originalRandom;

  beforeEach(() => {
    originalRandom = Math.random;
    Math.random = () => 0.5;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it("renders with an initial hidden state and vertex size of 1", () => {
    const html = render(
      h(BoundedGoban, {
        signMap: zeros(5, 5),
        maxWidth: 200,
        maxHeight: 100,
      }),
    );

    expect(html).toContain("shudan-goban");
    expect(html).toContain('data-shudan-board-width="5"');
    expect(html).toContain('data-shudan-board-height="5"');
    expect(html).toContain("visibility:hidden");
    expect(html).toContain("font-size:1px");
    expect(html).toMatchSnapshot();
  });
});
