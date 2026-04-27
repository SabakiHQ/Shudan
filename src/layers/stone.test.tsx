import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.tsx";
import { Goban, StoneLayer } from "../main.ts";

function renderStone(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<StoneLayer>("shudan-stone-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    goban: result.goban,
    layer,
    uses: () => [...svg().querySelectorAll<SVGUseElement>("use")],
    shadowCircles: () => [
      ...svg().querySelectorAll<SVGCircleElement>("g[filter] circle"),
    ],
  };
}

afterEach(() => {
  cleanupRender();
});

// -- stone count --

describe("StoneLayer: stone count", () => {
  test("no stones rendered when prop is empty", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer />
      </Goban>,
    );
    assert.equal(uses().length, 0);
  });

  test("single black stone renders one <use>", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} />
      </Goban>,
    );
    assert.equal(uses().length, 1);
  });

  test("two stones render two <use> elements", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1, B2: -1 }} />
      </Goban>,
    );
    assert.equal(uses().length, 2);
  });

  test("vertex range expands to the correct number of stones", () => {
    // A1:C1 → A1, B1, C1 → 3 stones
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ "A1:C1": 1 }} />
      </Goban>,
    );
    assert.equal(uses().length, 3);
  });

  test("sign=0 vertices are ignored", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 0, B2: 1 }} />
      </Goban>,
    );
    assert.equal(uses().length, 1);
  });

  test("stone count updates reactively when stones prop changes", () => {
    const { layer, uses } = renderStone(
      <Goban>
        <StoneLayer />
      </Goban>,
    );
    assert.equal(uses().length, 0);
    layer.stones = { A1: 1, B2: -1 };
    assert.equal(uses().length, 2);
  });
});

// -- stone color --

describe("StoneLayer: stone href", () => {
  test("black stone (sign=1) uses the built-in black stone href", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} />
      </Goban>,
    );
    assert.equal(uses()[0].getAttribute("href"), "#shudan-black-stone");
  });

  test("white stone (sign=-1) uses the built-in white stone href", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: -1 }} />
      </Goban>,
    );
    assert.equal(uses()[0].getAttribute("href"), "#shudan-white-stone");
  });
});

// -- shadows --

describe("StoneLayer: shadows", () => {
  test("shadow circles are rendered by default", () => {
    const { shadowCircles } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} />
      </Goban>,
    );
    assert.equal(shadowCircles().length, 1);
  });

  test("shadow circles are suppressed with noShadows", () => {
    const { shadowCircles } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} noShadows />
      </Goban>,
    );
    assert.equal(shadowCircles().length, 0);
  });

  test("shadow count matches stone count", () => {
    const { uses, shadowCircles } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1, B2: -1, C3: 1 }} />
      </Goban>,
    );
    assert.equal(shadowCircles().length, uses().length);
  });
});

// -- dimmed stones --

describe("StoneLayer: dimmed stones", () => {
  test("undimmed stone has opacity 1", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} />
      </Goban>,
    );
    assert.equal(parseFloat(uses()[0].getAttribute("opacity")!), 1);
  });

  test("dimmed stone has reduced opacity", () => {
    const { uses } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} dimmedStones={["A1"]} />
      </Goban>,
    );
    const opacity = parseFloat(uses()[0].getAttribute("opacity")!);
    assert.ok(opacity < 1, "dimmed stone should have opacity < 1");
  });

  test("dimOpacity prop controls the opacity of dimmed stones", () => {
    const { uses: uses1 } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} dimmedStones={["A1"]} dimOpacity={0.3} />
      </Goban>,
    );
    const { uses: uses2 } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} dimmedStones={["A1"]} dimOpacity={0.7} />
      </Goban>,
    );
    assert.equal(parseFloat(uses1()[0].getAttribute("opacity")!), 0.3);
    assert.equal(parseFloat(uses2()[0].getAttribute("opacity")!), 0.7);
  });

  test("dimmed shadow circle has half the stone opacity", () => {
    const { shadowCircles } = renderStone(
      <Goban>
        <StoneLayer stones={{ A1: 1 }} dimmedStones={["A1"]} dimOpacity={0.6} />
      </Goban>,
    );
    assert.equal(
      parseFloat(shadowCircles()[0].getAttribute("opacity")!),
      0.3, // dimOpacity / 2 = 0.6 / 2
    );
  });

  test("only the matching vertex is dimmed when others are present", () => {
    const { uses } = renderStone(
      <Goban width={9} height={9}>
        <StoneLayer stones={{ A1: 1, B2: 1 }} dimmedStones={["A1"]} />
      </Goban>,
    );
    const opacities = uses().map((u) => parseFloat(u.getAttribute("opacity")!));
    assert.ok(
      opacities.some((o) => o < 1),
      "one stone should be dimmed",
    );
    assert.ok(
      opacities.some((o) => o === 1),
      "one stone should be undimmed",
    );
  });
});

// -- custom stone images --

describe("StoneLayer: custom stone images", () => {
  test("blackStoneHref replaces the built-in black stone reference", () => {
    const { uses } = renderStone(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-black">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <StoneLayer stones={{ A1: 1 }} blackStoneHref="#custom-black" />
      </Goban>,
    );
    const href = uses()[0].getAttribute("href")!;
    assert.ok(
      href.startsWith("#shudan-lightdom-"),
      `expected cloned id, got "${href}"`,
    );
  });

  test("whiteStoneHref replaces the built-in white stone reference", () => {
    const { uses } = renderStone(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-white">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <StoneLayer stones={{ A1: -1 }} whiteStoneHref="#custom-white" />
      </Goban>,
    );
    const href = uses()[0].getAttribute("href")!;
    assert.ok(
      href.startsWith("#shudan-lightdom-"),
      `expected cloned id, got "${href}"`,
    );
  });

  test("custom black href does not affect white stones", () => {
    const { uses } = renderStone(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-black">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <StoneLayer stones={{ A1: 1, B2: -1 }} blackStoneHref="#custom-black" />
      </Goban>,
    );
    // find the white stone use — its href should still be the built-in
    const hrefs = uses().map((u) => u.getAttribute("href")!);
    assert.ok(
      hrefs.some((h) => h === "#shudan-white-stone"),
      "white stone should still use built-in href",
    );
    assert.ok(
      hrefs.some((h) => h.startsWith("#shudan-lightdom-")),
      "black stone should use cloned href",
    );
  });

  test("custom white href does not affect black stones", () => {
    const { uses } = renderStone(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-white">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <StoneLayer stones={{ A1: 1, B2: -1 }} whiteStoneHref="#custom-white" />
      </Goban>,
    );
    const hrefs = uses().map((u) => u.getAttribute("href")!);
    assert.ok(
      hrefs.some((h) => h === "#shudan-black-stone"),
      "black stone should still use built-in href",
    );
    assert.ok(
      hrefs.some((h) => h.startsWith("#shudan-lightdom-")),
      "white stone should use cloned href",
    );
  });

  test("custom symbol is cloned into the layer defs", () => {
    const { layer } = renderStone(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-black">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <StoneLayer stones={{ A1: 1 }} blackStoneHref="#custom-black" />
      </Goban>,
    );
    const cloned = layer.shadowRoot!.querySelector("[id^='shudan-lightdom-']");
    assert.notEqual(cloned, null, "cloned symbol should exist in defs");
  });
});

// -- partial range filtering --

describe("StoneLayer: partial range filtering", () => {
  test("stones outside the partial range are not rendered", () => {
    const { uses } = renderStone(
      <Goban partial="A1:C3">
        <StoneLayer stones={{ A1: 1, D4: 1 }} />
      </Goban>,
    );
    // D4 is outside A1:C3, only A1 should render
    assert.equal(uses().length, 1);
  });

  test("all stones inside the partial range are rendered", () => {
    const { uses } = renderStone(
      <Goban partial="A1:C3">
        <StoneLayer stones={{ A1: 1, B2: -1, C3: 1 }} />
      </Goban>,
    );
    assert.equal(uses().length, 3);
  });
});
