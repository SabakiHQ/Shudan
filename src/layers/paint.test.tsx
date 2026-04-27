import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, PaintLayer } from "../main.ts";

function renderPaint(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<PaintLayer>("shudan-paint-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    layer,
    areaGroup: () => svg().querySelector<SVGGElement>("g[mask='url(#holes)']")!,
    areaPaths: () => [...svg().querySelectorAll<SVGPathElement>("g[mask='url(#holes)'] path")],
    holePaths: () => [...svg().querySelectorAll<SVGPathElement>("mask#holes g path")],
  };
}

afterEach(() => {
  cleanupRender();
});

describe("PaintLayer: rendering", () => {
  test("renders no painted paths by default", () => {
    const { areaPaths } = renderPaint(
      <Goban>
        <PaintLayer />
      </Goban>,
    );
    assert.equal(areaPaths().length, 0);
  });

  test("renders one path for one painted vertex", () => {
    const { areaPaths } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} />
      </Goban>,
    );
    assert.equal(areaPaths().length, 1);
  });

  test("renders multiple paths for disconnected painted vertices", () => {
    const { areaPaths } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1", "C1"]} />
      </Goban>,
    );
    assert.equal(areaPaths().length, 2);
  });

  test("vertex range notation is accepted", () => {
    const { areaPaths } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1:C1"]} />
      </Goban>,
    );
    assert.equal(areaPaths().length, 1);
  });
});

describe("PaintLayer: style props", () => {
  test("applies color as fill on painted area group", () => {
    const { areaGroup } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} color="red" />
      </Goban>,
    );
    assert.equal(areaGroup().getAttribute("fill"), "red");
  });

  test("applies stroke and stroke-width", () => {
    const { areaGroup } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} stroke="blue" strokeWidth={0.2} />
      </Goban>,
    );
    assert.equal(areaGroup().getAttribute("stroke"), "blue");
    assert.equal(parseFloat(areaGroup().getAttribute("stroke-width")!), 12);
  });

  test("no-stroke mode keeps stroke='none'", () => {
    const { areaGroup } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} stroke="none" />
      </Goban>,
    );
    assert.equal(areaGroup().getAttribute("stroke"), "none");
  });
});

describe("PaintLayer: geometry and reactivity", () => {
  test("borderRadius changes generated path geometry", () => {
    const { areaPaths: sharp } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} borderRadius={0} />
      </Goban>,
    );
    const { areaPaths: round } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1"]} borderRadius={0.4} />
      </Goban>,
    );

    assert.notEqual(sharp()[0].getAttribute("d"), round()[0].getAttribute("d"));
  });

  test("ring-shaped paint emits hole paths", () => {
    const { holePaths } = renderPaint(
      <Goban>
        <PaintLayer paintedVertices={["A1:C1", "A2", "C2", "A3:C3"]} />
      </Goban>,
    );
    // At least one hole path should be created for the inner cell.
    assert.ok(holePaths().length >= 1);
  });

  test("updates painted paths reactively when paintedVertices changes", () => {
    const { layer, areaPaths } = renderPaint(
      <Goban>
        <PaintLayer />
      </Goban>,
    );

    assert.equal(areaPaths().length, 0);
    layer.paintedVertices = ["A1", "C1"];
    assert.equal(areaPaths().length, 2);
  });
});
