import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.tsx";
import { Goban, StoneIndicatorLayer } from "../main.ts";

function renderStoneIndicator(template: Template) {
  const result = renderGoban(template);
  const layer = result
    .goban()
    .querySelector<StoneIndicatorLayer>("shudan-stone-indicator-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    goban: result.goban,
    circles: () => [
      ...svg().querySelectorAll<SVGCircleElement>("circle"),
    ],
  };
}

afterEach(() => {
  cleanupRender();
});

// -- circle count --

describe("StoneIndicatorLayer: circle count", () => {
  test("no circles rendered when stones prop is empty", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer />
      </Goban>,
    );
    assert.equal(circles().length, 0);
  });

  test("single vertex renders one circle", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ A1: "black" }} />
      </Goban>,
    );
    assert.equal(circles().length, 1);
  });

  test("two separate vertices render two circles", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ A1: "black", B2: "white" }} />
      </Goban>,
    );
    assert.equal(circles().length, 2);
  });

  test("vertex range expands to the correct number of circles", () => {
    // A1:C1 → A1, B1, C1 → 3 circles
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ "A1:C1": "black" }} />
      </Goban>,
    );
    assert.equal(circles().length, 3);
  });

  test("overlapping ranges: last value wins per vertex", () => {
    // A1 appears in both "A1:B1" and "A1" — result still has 2 unique vertices
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ "A1:B1": "black", A1: "white" }} />
      </Goban>,
    );
    assert.equal(circles().length, 2);
  });

  test("stone count updates reactively when stones prop changes", () => {
    const { goban, circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer />
      </Goban>,
    );
    assert.equal(circles().length, 0);

    goban()
      .querySelector<StoneIndicatorLayer>("shudan-stone-indicator-layer")!
      .stones = { A1: "black", B2: "white" };
    assert.equal(circles().length, 2);
  });
});

// -- fill color --

describe("StoneIndicatorLayer: fill color", () => {
  test("circle fill matches the specified color for a single vertex", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ A1: "black" }} />
      </Goban>,
    );
    assert.equal(circles()[0].getAttribute("fill"), "black");
  });

  test("each circle uses its own color when vertices have different values", () => {
    const { circles } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ A1: "black", A9: "white" }} />
      </Goban>,
    );
    const fills = circles().map((c) => c.getAttribute("fill")).sort();
    assert.deepEqual(fills, ["black", "white"]);
  });

  test("all circles in a range share the same fill", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ "A1:C1": "red" }} />
      </Goban>,
    );
    for (const circle of circles()) {
      assert.equal(circle.getAttribute("fill"), "red");
    }
  });
});

// -- vertex coordinates --

describe("StoneIndicatorLayer: circle position", () => {
  test("circles have no stroke", () => {
    const { circles } = renderStoneIndicator(
      <Goban>
        <StoneIndicatorLayer stones={{ A1: "black" }} />
      </Goban>,
    );
    assert.equal(circles()[0].getAttribute("stroke"), "none");
  });

  test("A1 circle is near the bottom of the board (cy close to board height)", () => {
    // 9×9 board: A1 → x=0, y=0 → cy = unit(9-1-0+0.5) = unit(8.5), near max
    const { circles: circlesA1 } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ A1: "black" }} />
      </Goban>,
    );
    const { circles: circlesA9 } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ A9: "black" }} />
      </Goban>,
    );

    const cyA1 = parseFloat(circlesA1()[0].getAttribute("cy")!);
    const cyA9 = parseFloat(circlesA9()[0].getAttribute("cy")!);
    assert.ok(cyA1 > cyA9, "A1 (bottom) should have a larger cy than A9 (top)");
  });

  test("vertically adjacent vertices have cy values that differ by exactly one unit", () => {
    // A1 cy = unit(8.5), A2 cy = unit(7.5) → difference = unit(1)
    // Derive unit(1) as the cx gap between columns A and B (cx(B1) - cx(A1))
    const { circles: cA1 } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ A1: "black" }} />
      </Goban>,
    );
    const { circles: cA2 } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ A2: "black" }} />
      </Goban>,
    );
    const { circles: cB1 } = renderStoneIndicator(
      <Goban width={9} height={9}>
        <StoneIndicatorLayer stones={{ B1: "black" }} />
      </Goban>,
    );

    const cyA1 = parseFloat(cA1()[0].getAttribute("cy")!);
    const cyA2 = parseFloat(cA2()[0].getAttribute("cy")!);
    const cxA1 = parseFloat(cA1()[0].getAttribute("cx")!);
    const cxA2 = parseFloat(cA2()[0].getAttribute("cx")!);
    const cxB1 = parseFloat(cB1()[0].getAttribute("cx")!);

    const oneUnit = cxB1 - cxA1;

    assert.equal(cxA1, cxA2); // same column
    assert.equal(Math.round(cyA1 - cyA2), Math.round(oneUnit));
  });
});
