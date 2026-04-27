import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { cleanupRender, renderGoban } from "./test/utils.ts";
import { Goban, VertexPointerEvent } from "./main.ts";

function parseViewBox(svg: Element) {
  const [x, y, w, h] = svg.getAttribute("viewBox")!.split(" ").map(Number);
  return { x, y, w, h };
}

afterEach(() => {
  cleanupRender();
});

describe("Goban viewport: board dimensions", () => {
  test("square board produces a square viewport", () => {
    const { svg } = renderGoban(<Goban />);
    const { w, h } = parseViewBox(svg());
    assert.equal(w, h);
  });

  test("smaller board produces a smaller viewport", () => {
    const { svg: big } = renderGoban(<Goban />);
    const { svg: small } = renderGoban(<Goban width={9} height={9} />);
    const vbBig = parseViewBox(big());
    const vbSmall = parseViewBox(small());
    assert.ok(vbSmall.w < vbBig.w);
    assert.ok(vbSmall.h < vbBig.h);
  });

  test("taller board produces a taller viewport than it is wide", () => {
    const { svg } = renderGoban(<Goban width={9} height={13} />);
    const { w, h } = parseViewBox(svg());
    assert.ok(h > w);
  });

  test("changing width updates only the viewport width", () => {
    const { goban, svg } = renderGoban(<Goban />);
    const { w: wBefore, h: hBefore } = parseViewBox(svg());
    goban().width = 9;
    const { w: wAfter, h: hAfter } = parseViewBox(svg());
    assert.ok(wAfter < wBefore);
    assert.equal(hAfter, hBefore);
  });
});

describe("Goban viewport: partial range", () => {
  test("partial viewport equals that of an equivalent-sized board", () => {
    // A1:C3 is a 3×3 region; its viewport should match a 3×3 board
    const { svg: svgBoard } = renderGoban(<Goban width={3} height={3} />);
    const { svg: svgPartial } = renderGoban(<Goban partial="A1:C3" />);
    assert.equal(
      svgPartial().getAttribute("viewBox"),
      svgBoard().getAttribute("viewBox"),
    );
  });

  test("inverted range C3:A1 produces the same viewport as A1:C3", () => {
    const { svg: s1 } = renderGoban(<Goban partial="A1:C3" />);
    const { svg: s2 } = renderGoban(<Goban partial="C3:A1" />);
    assert.equal(s1().getAttribute("viewBox"), s2().getAttribute("viewBox"));
  });

  test("wider x-range produces a wider viewport", () => {
    const { svg: svg3 } = renderGoban(<Goban partial="A1:C5" />);
    const { svg: svg5 } = renderGoban(<Goban partial="A1:E5" />);
    assert.ok(parseViewBox(svg5()).w > parseViewBox(svg3()).w);
  });

  test("partial larger than board is capped to the full board viewport", () => {
    const { svg: svgFull } = renderGoban(<Goban width={5} height={5} />);
    const { svg: svgCapped } = renderGoban(
      <Goban width={5} height={5} partial="A1:T19" />, // far exceeds 5×5
    );
    assert.equal(
      svgCapped().getAttribute("viewBox"),
      svgFull().getAttribute("viewBox"),
    );
  });

  test("removing partial restores the full-board viewport", () => {
    const { goban, svg } = renderGoban(<Goban />);
    const fullViewBox = svg().getAttribute("viewBox");
    goban().partial = "A1:C3";
    assert.notEqual(svg().getAttribute("viewBox"), fullViewBox);
    goban().partial = undefined;
    assert.equal(svg().getAttribute("viewBox"), fullViewBox);
  });
});

describe("Goban interactive", () => {
  test("no tabindex attribute by default", () => {
    const { goban } = renderGoban(<Goban />);
    assert.equal(goban().getAttribute("tabindex"), null);
  });

  test("tabindex=0 is added when the interactive attribute is set", () => {
    const { goban } = renderGoban(<Goban interactive />);
    assert.equal(goban().getAttribute("tabindex"), "0");
  });

  test("existing tabindex is preserved when interactive is set", () => {
    const { goban } = renderGoban(<Goban interactive tabindex="3" />);
    assert.equal(goban().getAttribute("tabindex"), "3");
  });
});

describe("Goban vertex pointer events", () => {
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

  test("vertex-pointer-down carries the mapped vertex and original pointer event", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const viewport = setupPointerViewport(goban());
    let captured: VertexPointerEvent | undefined;

    goban().addEventListener("vertex-pointer-down", (evt) => {
      captured = evt;
    });

    const pointerEvent = dispatchPointer(viewport, "pointerdown", 5, 5);

    assert.equal(captured?.vertex, "A19");
    assert.equal(captured?.pointerEvent, pointerEvent);
  });

  test("vertex-pointer-up carries the mapped vertex and original pointer event", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const viewport = setupPointerViewport(goban());
    let captured: VertexPointerEvent | undefined;

    goban().addEventListener("vertex-pointer-up", (evt) => {
      captured = evt;
    });

    const pointerEvent = dispatchPointer(viewport, "pointerup", 5, 5);

    assert.equal(captured?.vertex, "A19");
    assert.equal(captured?.pointerEvent, pointerEvent);
  });

  test("pointer position is clamped to board edges", () => {
    const { goban } = renderGoban(<Goban width={3} height={3} />);
    const viewport = setupPointerViewport(goban());
    const vertices: string[] = [];

    goban().addEventListener("vertex-pointer-move", (evt) => {
      vertices.push(evt.vertex);
    });

    dispatchPointer(viewport, "pointermove", -500, -500);
    dispatchPointer(viewport, "pointermove", 500, 500);

    assert.deepEqual(vertices, ["A3", "C1"]);
  });

  test("partial range constrains emitted pointer vertices", () => {
    const { goban } = renderGoban(<Goban partial="D5:F7" />);
    const viewport = setupPointerViewport(goban());
    const vertices: string[] = [];

    goban().addEventListener("vertex-pointer-enter", (evt) => {
      vertices.push(evt.vertex);
    });
    goban().addEventListener("vertex-pointer-leave", (evt) => {
      vertices.push(evt.vertex);
    });

    dispatchPointer(viewport, "pointerenter", 5, 5);
    dispatchPointer(viewport, "pointerleave", 500, 500);

    assert.deepEqual(vertices, ["D7", "F5"]);
  });

  test("click emits vertex-click with mapped vertex and original pointer event", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const viewport = setupPointerViewport(goban());
    let captured: VertexPointerEvent | undefined;

    goban().addEventListener("vertex-click", (evt) => {
      captured = evt;
    });

    const pointerEvent = dispatchPointer(viewport, "click", 5, 5);

    assert.equal(captured?.vertex, "A19");
    assert.equal(captured?.pointerEvent, pointerEvent);
  });

  test("preventing vertex-click default blocks focused vertex updates", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const viewport = setupPointerViewport(goban());

    goban().addEventListener("vertex-click", (evt) => {
      evt.preventDefault();
    });

    dispatchPointer(viewport, "click", 5, 5);

    assert.equal(goban().focusedVertex, undefined);
  });
});

describe("Goban keyboard navigation", () => {
  function keydown(goban: Goban, code: string) {
    goban.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));
  }

  test("non-interactive board ignores arrow keys", () => {
    const { goban } = renderGoban(<Goban />);
    keydown(goban(), "ArrowRight");
    assert.equal(goban().focusedVertex, undefined);
  });

  test("first arrow key focuses the top-left corner", () => {
    // focusedVertex == null → initial position: (max(0, rangeX[0]), min(height-1, rangeY[1])) = (0, 18) → A19
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight");
    assert.equal(goban().focusedVertex, "A19");
  });

  test("ArrowRight moves focus one column right", () => {
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "ArrowRight"); // → B19
    assert.equal(goban().focusedVertex, "B19");
  });

  test("ArrowLeft moves focus one column left", () => {
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "ArrowRight"); // → B19
    keydown(goban(), "ArrowLeft"); //  → A19
    assert.equal(goban().focusedVertex, "A19");
  });

  test("ArrowDown moves focus one row down", () => {
    // y increases upward, so ArrowDown decreases y
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "ArrowDown"); //  → A18
    assert.equal(goban().focusedVertex, "A18");
  });

  test("ArrowUp moves focus one row up", () => {
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "ArrowDown"); //  → A18
    keydown(goban(), "ArrowUp"); //    → A19
    assert.equal(goban().focusedVertex, "A19");
  });

  test("focus is clamped at all four board edges", () => {
    const { goban } = renderGoban(<Goban width={3} height={3} interactive />);
    keydown(goban(), "ArrowRight"); // → A3 (initial top-left of 3×3)
    keydown(goban(), "ArrowUp"); //    → A3 (top edge)
    assert.equal(goban().focusedVertex, "A3");
    keydown(goban(), "ArrowLeft"); //  → A3 (left edge)
    assert.equal(goban().focusedVertex, "A3");
    keydown(goban(), "ArrowRight");
    keydown(goban(), "ArrowRight");
    keydown(goban(), "ArrowRight"); // → C3 (right edge, extra press absorbed)
    assert.equal(goban().focusedVertex, "C3");
    keydown(goban(), "ArrowDown");
    keydown(goban(), "ArrowDown");
    keydown(goban(), "ArrowDown"); // → C1 (bottom edge, extra press absorbed)
    assert.equal(goban().focusedVertex, "C1");
  });

  test("Enter fires vertex-click for the focused vertex", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const events: VertexPointerEvent[] = [];
    goban().addEventListener("vertex-click", (e) =>
      events.push(e as VertexPointerEvent),
    );

    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "Enter");

    assert.equal(events.length, 1);
    assert.equal(events[0].vertex, "A19");
  });

  test("Space fires vertex-click for the focused vertex", () => {
    const { goban } = renderGoban(<Goban interactive />);
    const events: VertexPointerEvent[] = [];
    goban().addEventListener("vertex-click", (e) =>
      events.push(e as VertexPointerEvent),
    );

    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "Space");

    assert.equal(events.length, 1);
    assert.equal(events[0].vertex, "A19");
  });

  test("Enter without a focused vertex fires no vertex-click", () => {
    const { goban } = renderGoban(<Goban interactive />);
    let fired = false;
    goban().addEventListener("vertex-click", () => (fired = true));

    keydown(goban(), "Enter"); // focusedVertex is undefined → no event

    assert.equal(fired, false);
  });

  test("vertex-click carries the pointer event", () => {
    const { goban } = renderGoban(<Goban interactive />);
    let captured: VertexPointerEvent | undefined;
    goban().addEventListener("vertex-click", (e) => {
      captured = e as VertexPointerEvent;
    });

    keydown(goban(), "ArrowRight"); // → A19
    keydown(goban(), "Enter");

    assert.ok(captured?.pointerEvent instanceof PointerEvent);
  });

  test("Escape clears the focused vertex", () => {
    const { goban } = renderGoban(<Goban interactive />);
    keydown(goban(), "ArrowRight"); // → A19
    assert.notEqual(goban().focusedVertex, undefined);
    keydown(goban(), "Escape");
    assert.equal(goban().focusedVertex, undefined);
  });

  test("Escape without focused vertex blurs the board", () => {
    const { goban } = renderGoban(<Goban interactive />);
    let blurred = false;
    const originalBlur = goban().blur.bind(goban());
    goban().blur = () => {
      blurred = true;
      return originalBlur();
    };

    keydown(goban(), "Escape");

    assert.equal(blurred, true);
  });

  test("partial range constrains initial position and navigation", () => {
    // D5:F7 → rangeX=[3,5], rangeY=[4,6]
    // initial: x=max(0,3)=3→D, y=min(18,6)=6→row 7 → D7
    const { goban } = renderGoban(<Goban interactive partial="D5:F7" />);
    keydown(goban(), "ArrowRight"); // → D7 (initial)
    assert.equal(goban().focusedVertex, "D7");
    keydown(goban(), "ArrowLeft"); //  → D7 (clamped at range left)
    assert.equal(goban().focusedVertex, "D7");
    keydown(goban(), "ArrowRight");
    keydown(goban(), "ArrowRight");
    keydown(goban(), "ArrowRight"); // → F7 (range right edge)
    assert.equal(goban().focusedVertex, "F7");
    keydown(goban(), "ArrowDown");
    keydown(goban(), "ArrowDown");
    keydown(goban(), "ArrowDown"); // → F5 (range bottom edge)
    assert.equal(goban().focusedVertex, "F5");
  });
});

describe("Goban coords", () => {
  test("no coord spans rendered by default", () => {
    const { goban } = renderGoban(<Goban />);
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-x']").length,
      0,
    );
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-y']").length,
      0,
    );
  });

  test("coord-x and coord-y spans appear when coords attribute is set", () => {
    const { goban } = renderGoban(<Goban coords />);
    assert.ok(
      goban().shadowRoot!.querySelectorAll("[part='coord-x']").length > 0,
      "expected coord-x spans",
    );
    assert.ok(
      goban().shadowRoot!.querySelectorAll("[part='coord-y']").length > 0,
      "expected coord-y spans",
    );
  });

  test("default 19×19 board has 38 coord-x and 38 coord-y labels", () => {
    // 4 Coord components: top+bottom (19 coord-x each) and left+right (19 coord-y each)
    const { goban } = renderGoban(<Goban coords />);
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-x']").length,
      38,
    );
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-y']").length,
      38,
    );
  });

  test("partial range limits coord label count", () => {
    // A1:C3 → rangeX=[0,2] (3 labels), rangeY=[0,2] (3 labels)
    // coord-x: 3×2 (top+bottom)=6; coord-y: 3×2 (left+right)=6
    const { goban } = renderGoban(<Goban coords partial="A1:C3" />);
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-x']").length,
      6,
    );
    assert.equal(
      goban().shadowRoot!.querySelectorAll("[part='coord-y']").length,
      6,
    );
  });
});
