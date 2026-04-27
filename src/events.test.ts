import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { VertexPointerEvent } from "./events.ts";

describe("VertexPointerEvent", () => {
  test("preventDefault forwards to the underlying pointer event", () => {
    let called = false;
    const pointerEvent = {
      preventDefault() {
        called = true;
      },
      stopPropagation() {},
      stopImmediatePropagation() {},
    } as PointerEvent;

    const event = new VertexPointerEvent("vertex-pointer-move", {
      vertex: "A1",
      pointerEvent,
      cancelable: true,
    });

    event.preventDefault();

    assert.equal(called, true);
    assert.equal(event.defaultPrevented, true);
  });

  test("stopPropagation forwards to the underlying pointer event", () => {
    let called = false;
    const pointerEvent = {
      preventDefault() {},
      stopPropagation() {
        called = true;
      },
      stopImmediatePropagation() {},
    } as PointerEvent;

    const event = new VertexPointerEvent("vertex-pointer-move", {
      vertex: "A1",
      pointerEvent,
    });

    event.stopPropagation();

    assert.equal(called, true);
  });

  test("stopImmediatePropagation forwards to the underlying pointer event", () => {
    let called = false;
    const pointerEvent = {
      preventDefault() {},
      stopPropagation() {},
      stopImmediatePropagation() {
        called = true;
      },
    } as PointerEvent;

    const event = new VertexPointerEvent("vertex-pointer-move", {
      vertex: "A1",
      pointerEvent,
    });

    event.stopImmediatePropagation();

    assert.equal(called, true);
  });
});
