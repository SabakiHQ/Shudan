import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Template } from "sinho";
import { cleanupRender, renderGoban } from "../test/utils.ts";
import { Goban, LineLayer } from "../main.ts";

function renderLine(template: Template) {
  const result = renderGoban(template);
  const layer = result.goban().querySelector<LineLayer>("shudan-line-layer")!;
  const svg = () => layer.shadowRoot!.querySelector("svg")!;

  return {
    layer,
    paths: () => [...svg().querySelectorAll("path")],
    markers: () => [...svg().querySelectorAll<SVGUseElement>("use")],
    strokeGroup: () => svg().querySelector<SVGGElement>("g[stroke]")!,
    defs: () => svg().querySelector("defs")!,
  };
}

afterEach(() => {
  cleanupRender();
});

describe("LineLayer: rendering", () => {
  test("renders no line paths by default", () => {
    const { paths } = renderLine(
      <Goban>
        <LineLayer />
      </Goban>,
    );
    assert.equal(paths().length, 0);
  });

  test("renders one path for a single line", () => {
    const { paths } = renderLine(
      <Goban>
        <LineLayer lines={[["A1", "A2"]]} />
      </Goban>,
    );
    assert.equal(paths().length, 1);
  });

  test("renders one path per line", () => {
    const { paths } = renderLine(
      <Goban>
        <LineLayer
          lines={[
            ["A1", "A2"],
            ["A1", "B1"],
          ]}
        />
      </Goban>,
    );
    assert.equal(paths().length, 2);
  });
});

describe("LineLayer: style props", () => {
  test("applies color as stroke on the line group", () => {
    const { strokeGroup } = renderLine(
      <Goban>
        <LineLayer color="red" lines={[["A1", "A2"]]} />
      </Goban>,
    );
    assert.equal(strokeGroup().getAttribute("stroke"), "red");
  });

  test("applies width as stroke-width on the line group", () => {
    const { strokeGroup } = renderLine(
      <Goban>
        <LineLayer width={0.2} lines={[["A1", "A2"]]} />
      </Goban>,
    );
    assert.equal(parseFloat(strokeGroup().getAttribute("stroke-width")!), 12);
  });

  test("outline color is used in outline filter", () => {
    const { paths } = renderLine(
      <Goban>
        <LineLayer outline="blue" lines={[["A1", "A2"]]} />
      </Goban>,
    );
    assert.equal(
      paths()[0].parentElement!.getAttribute("filter"),
      "url(#shudan-outline)",
    );
  });
});

describe("LineLayer: head and tail", () => {
  test("head='arrow' renders arrowhead marker", () => {
    const { markers } = renderLine(
      <Goban>
        <LineLayer lines={[["A1", "A2"]]} head="arrow" />
      </Goban>,
    );
    assert.ok(
      markers().some((m) => m.getAttribute("href") === "#shudan-arrowhead"),
    );
  });

  test("tail='none' renders no tail marker", () => {
    const { markers } = renderLine(
      <Goban>
        <LineLayer lines={[["A1", "A2"]]} tail="none" />
      </Goban>,
    );
    assert.equal(markers().length, 0);
  });

  test("custom tail marker is cloned and referenced", () => {
    const { layer, markers } = renderLine(
      <Goban>
        <svg style={{ display: "none" }}>
          <symbol id="custom-tail">
            <circle r="10" />
          </symbol>
        </svg>
        <LineLayer lines={[["A1", "A2"]]} tail="#custom-tail" />
      </Goban>,
    );

    const href = markers()[0].getAttribute("href")!;
    assert.ok(href.startsWith("#shudan-lightdom-"));
    const cloned = layer.shadowRoot!.querySelector(href);
    assert.notEqual(
      cloned,
      null,
      "cloned tail symbol should exist in shadow DOM",
    );
  });

  test("custom head marker is cloned and referenced", () => {
    const { layer, markers } = renderLine(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-head">
              <circle r="10" />
            </symbol>
          </defs>
        </svg>
        <LineLayer lines={[["A1", "A2"]]} head="#custom-head" />
      </Goban>,
    );

    const href = markers()[0].getAttribute("href")!;
    assert.ok(href.startsWith("#shudan-lightdom-"));
    const cloned = layer.shadowRoot!.querySelector(href);
    assert.notEqual(
      cloned,
      null,
      "cloned head symbol should exist in shadow DOM",
    );
  });

  test("custom head and custom tail both render markers", () => {
    const { layer, markers } = renderLine(
      <Goban>
        <svg style={{ position: "absolute" }}>
          <defs>
            <symbol id="custom-head">
              <circle r="10" />
            </symbol>
            <symbol id="custom-tail">
              <rect width="10" height="10" />
            </symbol>
          </defs>
        </svg>
        <LineLayer
          lines={[["A1", "A2"]]}
          head="#custom-head"
          tail="#custom-tail"
        />
      </Goban>,
    );

    assert.equal(markers().length, 2);
    const hrefs = markers().map((m) => m.getAttribute("href")!);
    assert.ok(hrefs.every((href) => href.startsWith("#shudan-lightdom-")));
    assert.notEqual(hrefs[0], hrefs[1]);
    for (const href of hrefs) {
      assert.notEqual(
        layer.shadowRoot!.querySelector(href),
        null,
        `cloned symbol ${href} should exist in shadow DOM`,
      );
    }
  });
});
