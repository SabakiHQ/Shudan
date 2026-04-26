import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { render } from "../test/utils.tsx";
import { Goban } from "../goban.tsx";
import { GridLayer, getHoshis } from "./grid.tsx";

function renderGrid(template: Template) {
  const result = render(template);
  const goban = result.element()! as Goban;
  const layer = goban.querySelector("shudan-grid-layer")! as HTMLElement;
  const svg = layer.shadowRoot!.querySelector("svg")!;

  return {
    goban,
    svg,
    get lines() {
      return [...svg.querySelectorAll<SVGLineElement>("line")];
    },
    get circles() {
      return [...svg.querySelectorAll<SVGCircleElement>("circle")];
    },
    cleanup: result.cleanup,
  };
}

// -- getHoshis --

describe("getHoshis: small boards", () => {
  test("returns empty when both sides are ≤ 6", () => {
    assert.deepEqual(getHoshis(6, 6), []);
  });

  test("returns empty when one side is ≤ 6", () => {
    assert.deepEqual(getHoshis(19, 6), []);
    assert.deepEqual(getHoshis(6, 19), []);
  });
});

describe("getHoshis: standard board sizes", () => {
  test("7×7: 4 corner hoshis only (center and middle edges excluded)", () => {
    assert.equal(getHoshis(7, 7).length, 4);
  });

  test("8×8: 4 corner hoshis only (even board, no middle points)", () => {
    assert.equal(getHoshis(8, 8).length, 4);
  });

  test("9×9: 9 hoshis — corners, center, and 4 edge midpoints", () => {
    const hoshis = getHoshis(9, 9);
    assert.equal(hoshis.length, 9);
    assert.ok(hoshis.includes("C3"), "missing corner C3");
    assert.ok(hoshis.includes("G7"), "missing corner G7");
    assert.ok(hoshis.includes("E5"), "missing center E5");
  });

  test("13×13: 9 hoshis with center at G7", () => {
    const hoshis = getHoshis(13, 13);
    assert.equal(hoshis.length, 9);
    assert.ok(hoshis.includes("G7"), "missing center G7");
  });

  test("19×19: 9 hoshis with correct corner and center positions", () => {
    const hoshis = getHoshis(19, 19);
    assert.equal(hoshis.length, 9);
    assert.ok(hoshis.includes("D4"), "missing corner D4");
    assert.ok(hoshis.includes("Q16"), "missing corner Q16");
    assert.ok(hoshis.includes("K10"), "missing center K10");
  });
});

// -- GridLayer rendering --

describe("GridLayer: line count", () => {
  test("3×3 board renders 6 lines (3 horizontal + 3 vertical)", () => {
    const { lines, cleanup } = renderGrid(
      <Goban width={3} height={3}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(lines.length, 6);
    cleanup();
  });

  test("9×9 board renders 18 lines", () => {
    const { lines, cleanup } = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(lines.length, 18);
    cleanup();
  });

  test("non-square 9×13 board renders 22 lines", () => {
    const { lines, cleanup } = renderGrid(
      <Goban width={9} height={13}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(lines.length, 22);
    cleanup();
  });

  test("line count updates reactively when board width changes", () => {
    const result = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(result.lines.length, 18);
    result.goban.width = 13;
    assert.equal(result.lines.length, 22); // 13 + 9
    result.cleanup();
  });
});

describe("GridLayer: hoshi circles", () => {
  test("3×3 board renders no circles", () => {
    const { circles, cleanup } = renderGrid(
      <Goban width={3} height={3}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(circles.length, 0);
    cleanup();
  });

  test("9×9 board renders 9 default hoshi circles", () => {
    const { circles, cleanup } = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(circles.length, 9);
    cleanup();
  });

  test("custom hoshis prop overrides default positions", () => {
    const { circles, cleanup } = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer hoshis={["C3", "G7"]} />
      </Goban>,
    );
    assert.equal(circles.length, 2);
    cleanup();
  });

  test("hoshis prop accepts vertex range notation", () => {
    // C3:E5 expands to a 3×3 range → 9 vertices
    const { circles, cleanup } = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer hoshis={["C3:E5"]} />
      </Goban>,
    );
    assert.equal(circles.length, 9);
    cleanup();
  });
});

describe("GridLayer: color prop", () => {
  test("default color is the board foreground CSS variable", () => {
    const { svg, cleanup } = renderGrid(
      <Goban width={3} height={3}>
        <GridLayer />
      </Goban>,
    );
    assert.equal(
      svg.querySelector("g > g")!.getAttribute("stroke"),
      "var(--shudan-board-foreground-color)",
    );
    cleanup();
  });

  test("custom color is applied as stroke on the <g> element", () => {
    const { svg, cleanup } = renderGrid(
      <Goban width={3} height={3}>
        <GridLayer color="red" />
      </Goban>,
    );
    assert.equal(svg.querySelector("g > g")!.getAttribute("stroke"), "red");
    cleanup();
  });

  test("custom color fills hoshi circles", () => {
    const { circles, cleanup } = renderGrid(
      <Goban width={9} height={9}>
        <GridLayer color="blue" />
      </Goban>,
    );
    for (const circle of circles) {
      assert.equal(circle.getAttribute("fill"), "blue");
    }
    cleanup();
  });
});

describe("GridLayer: stroke widths", () => {
  test("border lines are thicker than interior lines when widths differ", () => {
    // 3×3 board: lines[0]=h-row0 (border), lines[1]=h-row1 (interior), lines[2]=h-row2 (border)
    const { lines, cleanup } = renderGrid(
      <Goban width={3} height={3}>
        <GridLayer strokeWidth={0.04} borderStrokeWidth={0.1} />
      </Goban>,
    );
    const borderWidth = parseFloat(lines[0].getAttribute("stroke-width")!);
    const interiorWidth = parseFloat(lines[1].getAttribute("stroke-width")!);
    assert.ok(borderWidth > interiorWidth, "border should be thicker");
    cleanup();
  });
});
