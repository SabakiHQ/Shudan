import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/preact";
import { createElement as h, Component } from "preact";

import { Goban } from "../src/main.js";
import { board } from "./support.js";

const vertex = (container, x, y) =>
  container.querySelector(`.shudan-vertex[data-x="${x}"][data-y="${y}"]`);

describe("Goban: interaction contract", () => {
  it("fires vertex mouse events with the vertex coordinates", () => {
    const onDown = vi.fn();
    const { container } = render(
      h(Goban, { signMap: board(5, 5), onVertexMouseDown: onDown }),
    );

    fireEvent.mouseDown(vertex(container, 2, 3));

    expect(onDown).toHaveBeenCalledOnce();
    expect(onDown.mock.calls[0][1]).toEqual([2, 3]); // (event, vertex)
  });
});

// The rectangular drag-select recipe (from the Shudan#25 answer), wired the way
// a consumer would: the vertex mouse handlers drive selectedVertices. This is
// the behavioral shape node:test + hand-wired jsdom made awkward and Testing
// Library makes idiomatic -- fireEvent for the drag, and its act() wrapping
// flushes the re-render so the selection is on the DOM by the time we query.
function rectVertices([ax, ay], [bx, by]) {
  let out = [];
  for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) out.push([x, y]);
  }
  return out;
}

class RegionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { anchor: null, selected: [], dragging: false };
  }

  render(_, { selected }) {
    return h(Goban, {
      signMap: board(9, 9),
      selectedVertices: selected,
      onVertexMouseDown: (_evt, v) =>
        this.setState({ anchor: v, selected: [v], dragging: true }),
      onVertexMouseMove: (_evt, v) => {
        if (this.state.dragging)
          this.setState({ selected: rectVertices(this.state.anchor, v) });
      },
      onVertexMouseUp: () => this.setState({ dragging: false }),
    });
  }
}

describe("recipe: rectangular region select", () => {
  it("highlights the dragged rectangle via selectedVertices", () => {
    const { container } = render(h(RegionSelect));

    fireEvent.mouseDown(vertex(container, 1, 1));
    fireEvent.mouseMove(vertex(container, 3, 4));
    fireEvent.mouseUp(vertex(container, 3, 4));

    const selected = [
      ...container.querySelectorAll(".shudan-vertex.shudan-selected"),
    ];
    // Rectangle x in [1..3], y in [1..4] -> 3 * 4 = 12 vertices.
    expect(selected.length).toBe(12);
    expect(
      [...new Set(selected.map((el) => Number(el.dataset.x)))].sort(
        (a, b) => a - b,
      ),
    ).toEqual([1, 2, 3]);
    expect(
      [...new Set(selected.map((el) => Number(el.dataset.y)))].sort(
        (a, b) => a - b,
      ),
    ).toEqual([1, 2, 3, 4]);
  });
});
