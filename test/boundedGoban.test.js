import { describe, it, expect } from "vitest";

import { board, renderBounded, count, setElementSize } from "./support.js";

const fontSize = (container) =>
  container.querySelector(".shudan-goban").style.fontSize;

describe("BoundedGoban: renders the underlying board", () => {
  it("passes board dimensions through to the Goban", () => {
    const c = renderBounded({
      signMap: board(5, 5),
      maxWidth: 200,
      maxHeight: 100,
    });

    const goban = c.querySelector(".shudan-goban");
    expect(goban.getAttribute("data-shudan-board-width")).toBe("5");
    expect(goban.getAttribute("data-shudan-board-height")).toBe("5");
    expect(count(c, ".shudan-vertex")).toBe(25);
  });
});

// The sizing formula (max(floor(vertexSize * min(maxW/ow, maxH/oh)), 1)) is pure
// logic; only the measurement (ow/oh) needs the DOM, and jsdom can't lay out --
// so support.js supplies it. That covers the math. What it does NOT cover is
// real layout fidelity (does the board actually fit its container); that needs
// a browser -- Vitest browser mode, or Sabaki's Electron e2e, which exercises it.
describe("BoundedGoban: sizing math (measurement supplied)", () => {
  it("scales the vertex size to the tighter of maxWidth / maxHeight", () => {
    setElementSize(20); // the board measures 20px at the initial vertexSize of 1
    // scale = min(200/20, 100/20) = min(10, 5) = 5 -> floor(1 * 5) = 5
    const c = renderBounded({
      signMap: board(9, 9),
      maxWidth: 200,
      maxHeight: 100,
    });
    expect(fontSize(c)).toBe("5px");
  });

  it("never shrinks below a vertex size of 1", () => {
    setElementSize(1000);
    // scale = 10/1000 = 0.01 -> floor(1 * 0.01) = 0 -> clamped up to 1
    const c = renderBounded({
      signMap: board(9, 9),
      maxWidth: 10,
      maxHeight: 10,
    });
    expect(fontSize(c)).toBe("1px");
  });

  it("honors maxVertexSize as an upper bound", () => {
    setElementSize(20);
    // computed size would be 10, but maxVertexSize caps the rendered size at 3
    const c = renderBounded({
      signMap: board(9, 9),
      maxWidth: 200,
      maxHeight: 200,
      maxVertexSize: 3,
    });
    expect(fontSize(c)).toBe("3px");
  });
});
