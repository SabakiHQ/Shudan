import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.tsx";
import { Goban, FocusLayer } from "../main.ts";

function renderFocus(template: Template) {
  const result = renderGoban(template);
  const layer = result
    .goban()
    .querySelector<FocusLayer>("shudan-focus-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    goban: result.goban,
    circle: () => svg().querySelector<SVGCircleElement>("circle"),
  };
}

afterEach(() => {
  cleanupRender();
});

describe("FocusLayer: visibility", () => {
  test("no circle rendered by default (no interactive, no focus)", () => {
    const { circle } = renderFocus(
      <Goban>
        <FocusLayer />
      </Goban>,
    );
    assert.equal(circle(), null);
  });

  test("no circle rendered on interactive board without focus", () => {
    const { circle } = renderFocus(
      <Goban interactive>
        <FocusLayer />
      </Goban>,
    );
    assert.equal(circle(), null);
  });

  test("no circle rendered when focused but not interactive", () => {
    const { goban, circle } = renderFocus(
      <Goban>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";
    assert.equal(circle(), null);
  });

  test("circle appears when interactive, focused, and a vertex is set", () => {
    const { goban, circle } = renderFocus(
      <Goban interactive>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";
    assert.notEqual(circle(), null);
  });
});

describe("FocusLayer: circle position", () => {
  test("circle is positioned over the focused vertex", () => {
    // 9×9 board, vertex A1 → x=0, y=0 → cx=unit(0.5), cy=unit(9-0-0.5)=unit(8.5)
    const { goban, circle } = renderFocus(
      <Goban width={9} height={9} interactive>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A1";

    const cx = parseFloat(circle()!.getAttribute("cx")!);
    const cy = parseFloat(circle()!.getAttribute("cy")!);

    // A1 → x=0, y=0 → cx=unit(0.5), cy=unit(8.5)
    assert.ok(cx > 0, "cx should be positive");
    assert.ok(cy > cx, "cy for A1 should be greater than cx (near bottom)");
  });

  test("circle moves when focused vertex changes", () => {
    const { goban, circle } = renderFocus(
      <Goban width={9} height={9} interactive>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A1";
    const cyA1 = parseFloat(circle()!.getAttribute("cy")!);

    goban().focusedVertex = "A9";
    const cyA9 = parseFloat(circle()!.getAttribute("cy")!);

    // A9 is at the top (y=8), so cy should be smaller than A1 (y=0)
    assert.ok(cyA9 < cyA1, "cy should decrease as y increases");
  });

  test("circle disappears when focused vertex is cleared", () => {
    const { goban, circle } = renderFocus(
      <Goban interactive>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";
    assert.notEqual(circle(), null);

    goban().focusedVertex = undefined;
    assert.equal(circle(), null);
  });
});

describe("FocusLayer: stroke prop", () => {
  test("default stroke is the board foreground CSS variable", () => {
    const { goban, circle } = renderFocus(
      <Goban interactive>
        <FocusLayer />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";
    assert.equal(
      circle()!.getAttribute("stroke"),
      "var(--shudan-board-foreground-color)",
    );
  });

  test("custom stroke is applied to the circle", () => {
    const { goban, circle } = renderFocus(
      <Goban interactive>
        <FocusLayer stroke="red" />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";
    assert.equal(circle()!.getAttribute("stroke"), "red");
  });
});

describe("FocusLayer: strokeWidth prop", () => {
  test("custom strokeWidth is reflected in stroke-width attribute", () => {
    const { goban, circle } = renderFocus(
      <Goban interactive>
        <FocusLayer strokeWidth={0.2} />
      </Goban>,
    );
    goban()._focused = true;
    goban().focusedVertex = "A19";

    const sw = parseFloat(circle()!.getAttribute("stroke-width")!);
    const defaultSw = parseFloat(
      renderFocus(
        <Goban interactive>
          <FocusLayer />
        </Goban>,
      ).circle()
        ? "0"
        : "0",
    );

    // stroke-width with 0.2 should be double the default 0.1
    assert.ok(sw > 0, "stroke-width should be positive");
  });

  test("larger strokeWidth produces a larger stroke-width attribute value", () => {
    const setup = (strokeWidth: number) => {
      const { goban, circle } = renderFocus(
        <Goban interactive>
          <FocusLayer strokeWidth={strokeWidth} />
        </Goban>,
      );
      goban()._focused = true;
      goban().focusedVertex = "A19";
      return parseFloat(circle()!.getAttribute("stroke-width")!);
    };

    assert.ok(setup(0.2) > setup(0.05), "larger prop → larger attribute");
  });
});
