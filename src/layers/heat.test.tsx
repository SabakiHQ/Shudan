import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, HeatLayer, PaintLayer } from "../main.ts";

function renderHeat(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<HeatLayer>("shudan-heat-layer")!;

  const paintLayers = () =>
    [...layer.shadowRoot!.querySelectorAll<PaintLayer>("shudan-paint-layer")];

  return {
    layer,
    paintLayers,
  };
}

afterEach(() => {
  cleanupRender();
});

describe("HeatLayer: paint layers", () => {
  test("renders one PaintLayer per default color", () => {
    const { paintLayers } = renderHeat(
      <Goban>
        <HeatLayer />
      </Goban>,
    );
    assert.equal(paintLayers().length, 4);
  });

  test("renders one PaintLayer per custom color", () => {
    const colors = ["rgba(1,1,1,.5)", "rgba(2,2,2,.5)"];
    const { paintLayers } = renderHeat(
      <Goban>
        <HeatLayer colors={colors} />
      </Goban>,
    );
    assert.equal(paintLayers().length, 2);
  });

  test("forwards each custom color to the corresponding PaintLayer", () => {
    const colors = ["rgba(1,1,1,.5)", "rgba(2,2,2,.5)"];
    const { paintLayers } = renderHeat(
      <Goban>
        <HeatLayer colors={colors} />
      </Goban>,
    );

    assert.equal(paintLayers()[0].color, colors[0]);
    assert.equal(paintLayers()[1].color, colors[1]);
  });
});

describe("HeatLayer: value binning", () => {
  test("empty values produce no painted vertices", () => {
    const { paintLayers } = renderHeat(
      <Goban>
        <HeatLayer colors={["red", "blue"]} values={{}} />
      </Goban>,
    );

    const total = paintLayers().reduce(
      (sum, layer) => sum + (layer.paintedVertices ?? []).length,
      0,
    );
    assert.equal(total, 0);
  });

  test("values are distributed into palette buckets", () => {
    // With min=1, max=3, 2 colors:
    // bucket 0: 1 < v <= 2  => A2
    // bucket 1: 2 < v <= 3  => A3
    const { paintLayers } = renderHeat(
      <Goban>
        <HeatLayer
          colors={["red", "blue"]}
          values={{ A1: 1, A2: 2, A3: 3 }}
        />
      </Goban>,
    );

    assert.deepEqual(paintLayers()[0].paintedVertices, ["A2"]);
    assert.deepEqual(paintLayers()[1].paintedVertices, ["A3"]);
  });
});
