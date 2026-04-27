import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, LabelLayer, StoneLayer } from "../main.ts";

function renderLabel(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<LabelLayer>("shudan-label-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    layer,
    labels: () => [...svg().querySelectorAll<HTMLDivElement>("div[part='label']")],
    foreignObjects: () => [...svg().querySelectorAll<SVGForeignObjectElement>("foreignObject")],
  };
}

afterEach(() => {
  cleanupRender();
});

describe("LabelLayer: rendering", () => {
  test("renders no labels by default", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer />
      </Goban>,
    );
    assert.equal(labels().length, 0);
  });

  test("renders one label for one vertex", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer labels={{ A1: "A" }} />
      </Goban>,
    );
    assert.equal(labels().length, 1);
    assert.equal(labels()[0].textContent, "A");
  });

  test("vertex range expands to multiple labels", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer labels={{ "A1:C1": "x" }} />
      </Goban>,
    );
    assert.equal(labels().length, 3);
  });
});

describe("LabelLayer: label options", () => {
  test("object label supports text and tooltip", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer labels={{ A1: { text: "42", tooltip: "answer" } }} />
      </Goban>,
    );
    assert.equal(labels()[0].textContent, "42");
    assert.equal(labels()[0].getAttribute("title"), "answer");
  });

  test("label-level color overrides layer color", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer color="red" labels={{ A1: { text: "A", color: "blue" } }} />
      </Goban>,
    );
    assert.equal(labels()[0].style.color, "blue");
  });

  test("layer-level background is applied", () => {
    const { labels } = renderLabel(
      <Goban>
        <LabelLayer background="yellow" labels={{ A1: "A" }} />
      </Goban>,
    );
    assert.equal(labels()[0].style.background, "yellow");
  });

  test("auto color uses black-stone foreground on black stones", () => {
    const { labels } = renderLabel(
      <Goban>
        <StoneLayer stones={{ A1: 1 }}>
          <LabelLayer labels={{ A1: "A" }} />
        </StoneLayer>
      </Goban>,
    );
    assert.equal(labels()[0].style.color, "var(--shudan-black-foreground-color)");
  });

  test("auto color uses white-stone foreground on white stones", () => {
    const { labels } = renderLabel(
      <Goban>
        <StoneLayer stones={{ A1: -1 }}>
          <LabelLayer labels={{ A1: "A" }} />
        </StoneLayer>
      </Goban>,
    );
    assert.equal(labels()[0].style.color, "var(--shudan-white-foreground-color)");
  });
});

describe("LabelLayer: geometry and reactivity", () => {
  test("positions label in one foreignObject per label", () => {
    const { foreignObjects } = renderLabel(
      <Goban>
        <LabelLayer labels={{ A1: "A", B2: "B" }} />
      </Goban>,
    );
    assert.equal(foreignObjects().length, 2);
  });

  test("updates labels reactively when labels prop changes", () => {
    const { layer, labels } = renderLabel(
      <Goban>
        <LabelLayer />
      </Goban>,
    );
    assert.equal(labels().length, 0);
    layer.labels = { A1: "A", B2: "B" };
    assert.equal(labels().length, 2);
  });
});
