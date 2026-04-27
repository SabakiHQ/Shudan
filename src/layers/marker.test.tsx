import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, MarkerLayer, StoneLayer } from "../main.ts";

function renderMarker(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<MarkerLayer>("shudan-marker-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    layer,
    uses: () => [...svg().querySelectorAll<SVGUseElement>("use")],
    defs: () => svg().querySelector("defs")!,
  };
}

afterEach(() => {
  cleanupRender();
});

describe("MarkerLayer: rendering", () => {
  test("renders no markers by default", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer />
      </Goban>,
    );
    assert.equal(uses().length, 0);
  });

  test("renders one marker for one vertex", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer markers={{ A1: "circle" }} />
      </Goban>,
    );
    assert.equal(uses().length, 1);
  });

  test("range notation expands to multiple markers", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer markers={{ "A1:C1": "point" }} />
      </Goban>,
    );
    assert.equal(uses().length, 3);
  });
});

describe("MarkerLayer: marker type and style", () => {
  test("object marker defaults type to cross", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer markers={{ A1: {} }} />
      </Goban>,
    );
    assert.equal(uses()[0].getAttribute("href"), "#shudan-cross");
  });

  test("string marker maps to matching built-in symbol", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer markers={{ A1: "triangle" }} />
      </Goban>,
    );
    assert.equal(uses()[0].getAttribute("href"), "#shudan-triangle");
  });

  test("color prop is applied through style", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer color="red" markers={{ A1: "point" }} />
      </Goban>,
    );
    assert.equal(uses()[0].style.color, "red");
  });

  test("auto color uses black-stone foreground on black stones", () => {
    const { uses } = renderMarker(
      <Goban>
        <StoneLayer stones={{ A1: 1 }}>
          <MarkerLayer markers={{ A1: "point" }} />
        </StoneLayer>
      </Goban>,
    );
    assert.equal(uses()[0].style.color, "var(--shudan-black-foreground-color)");
  });

  test("auto color uses white-stone foreground on white stones", () => {
    const { uses } = renderMarker(
      <Goban>
        <StoneLayer stones={{ A1: -1 }}>
          <MarkerLayer markers={{ A1: "point" }} />
        </StoneLayer>
      </Goban>,
    );
    assert.equal(uses()[0].style.color, "var(--shudan-white-foreground-color)");
  });
});

describe("MarkerLayer: outline and reactivity", () => {
  test("custom outline enables outline filter", () => {
    const { uses } = renderMarker(
      <Goban>
        <MarkerLayer outline="yellow" markers={{ A1: "circle" }} />
      </Goban>,
    );
    assert.equal(uses()[0].getAttribute("filter"), "url(#shudan-outline)");
  });

  test("updates markers reactively when markers prop changes", () => {
    const { layer, uses } = renderMarker(
      <Goban>
        <MarkerLayer />
      </Goban>,
    );
    assert.equal(uses().length, 0);
    layer.markers = { A1: "circle", B2: "cross" };
    assert.equal(uses().length, 2);
  });
});
