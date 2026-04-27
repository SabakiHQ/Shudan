import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, HoverStoneLayer, StoneLayer } from "../main.ts";

function renderHover(template: Template) {
  const result = renderGoban(template);
  const layer = result
    .goban()
    .querySelector<HoverStoneLayer>("shudan-hover-stone-layer")!;
  const stoneLayer = () => layer.shadowRoot!.querySelector<StoneLayer>("shudan-stone-layer")!;
  const uses = () => [
    ...stoneLayer().shadowRoot!.querySelectorAll<SVGUseElement>("use"),
  ];

  return {
    goban: result.goban,
    layer,
    stoneLayer,
    uses,
  };
}

function setupPointerViewport(goban: Goban) {
  const viewport = goban.shadowRoot!.querySelector<HTMLElement>(".viewport")!;

  Object.defineProperty(viewport, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ left: 0, top: 0, width: 190, height: 190 }),
  });

  return viewport;
}

function dispatchPointer(
  viewport: HTMLElement,
  type: string,
  clientX: number,
  clientY: number,
) {
  const evt = new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
  });

  viewport.dispatchEvent(evt);
  return evt;
}

afterEach(() => {
  cleanupRender();
});

describe("HoverStoneLayer: rendering", () => {
  test("renders no hover stone by default", () => {
    const { uses } = renderHover(
      <Goban>
        <HoverStoneLayer />
      </Goban>,
    );
    assert.equal(uses().length, 0);
  });

  test("renders a hover stone on vertex-pointer-move", () => {
    const { goban, uses } = renderHover(
      <Goban width={3} height={3}>
        <HoverStoneLayer />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());

    dispatchPointer(viewport, "pointermove", 5, 5);

    assert.equal(uses().length, 1);
  });

  test("clears hover stone on vertex-pointer-leave", () => {
    const { goban, uses } = renderHover(
      <Goban width={3} height={3}>
        <HoverStoneLayer />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());

    dispatchPointer(viewport, "pointermove", 5, 5);
    assert.equal(uses().length, 1);

    dispatchPointer(viewport, "pointerleave", 5, 5);
    assert.equal(uses().length, 0);
  });

  test("does not render hover stone on occupied vertices", () => {
    const { goban, uses } = renderHover(
      <Goban width={3} height={3}>
        <StoneLayer
          stones={{
            A1: 1,
            B1: 1,
            C1: 1,
            A2: 1,
            B2: 1,
            C2: 1,
            A3: 1,
            B3: 1,
            C3: 1,
          }}
        >
          <HoverStoneLayer />
        </StoneLayer>
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());
    dispatchPointer(viewport, "pointermove", 5, 5);

    assert.equal(uses().length, 0);
  });
});

describe("HoverStoneLayer: props", () => {
  test("color=-1 renders the white stone asset", () => {
    const { goban, uses } = renderHover(
      <Goban width={3} height={3}>
        <HoverStoneLayer color={-1} />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());

    dispatchPointer(viewport, "pointermove", 5, 5);

    assert.equal(uses()[0].getAttribute("href"), "#shudan-white-stone");
  });

  test("opacity prop controls hover stone opacity", () => {
    const { goban, uses } = renderHover(
      <Goban width={3} height={3}>
        <HoverStoneLayer opacity={0.25} />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());

    dispatchPointer(viewport, "pointermove", 5, 5);

    assert.equal(parseFloat(uses()[0].getAttribute("opacity")!), 0.25);
  });

  test("blackStoneHref uses a cloned lightdom symbol", () => {
    const { goban, stoneLayer, uses } = renderHover(
      <Goban width={3} height={3}>
        <svg style={{ display: "none" }}>
          <symbol id="custom-black-hover">
            <circle r="10" />
          </symbol>
        </svg>
        <HoverStoneLayer blackStoneHref="#custom-black-hover" />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());
    dispatchPointer(viewport, "pointermove", 5, 5);

    const href = uses()[0].getAttribute("href")!;
    assert.ok(href.startsWith("#shudan-lightdom-"));
    const cloned = stoneLayer().shadowRoot!.querySelector(href);
    assert.notEqual(cloned, null, "cloned black symbol should exist in shadow DOM");
  });

  test("whiteStoneHref uses a cloned lightdom symbol", () => {
    const { goban, stoneLayer, uses } = renderHover(
      <Goban width={3} height={3}>
        <svg style={{ display: "none" }}>
          <symbol id="custom-white-hover">
            <circle r="10" />
          </symbol>
        </svg>
        <HoverStoneLayer color={-1} whiteStoneHref="#custom-white-hover" />
      </Goban>,
    );
    const viewport = setupPointerViewport(goban());
    dispatchPointer(viewport, "pointermove", 5, 5);

    const href = uses()[0].getAttribute("href")!;
    assert.ok(href.startsWith("#shudan-lightdom-"));
    const cloned = stoneLayer().shadowRoot!.querySelector(href);
    assert.notEqual(cloned, null, "cloned white symbol should exist in shadow DOM");
  });
});
