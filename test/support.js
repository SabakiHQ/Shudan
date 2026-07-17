import { h } from "preact";
import { render, cleanup } from "@testing-library/preact";
import { afterEach } from "vitest";

import { Goban, BoundedGoban } from "../src/main.js";

// Testing Library renders into the jsdom document Vitest sets up
// (`environment: "jsdom"`); unmount between tests.
afterEach(cleanup);

// jsdom does no layout, so offsetWidth/offsetHeight are 0. We supply the
// measurement ourselves -- the one thing jsdom can't do -- so BoundedGoban's
// sizing formula runs on a known input. setElementSize controls it per test;
// afterEach resets it. (This tests the math, not real layout fidelity, which
// still needs a browser.)
let elementSize = 100;
export const setElementSize = (n) => (elementSize = n);
afterEach(() => (elementSize = 100));

for (const prop of ["offsetWidth", "offsetHeight"]) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    get: () => elementSize,
  });
}

export const renderGoban = (props) => render(h(Goban, props)).container;
export const renderBounded = (props) =>
  render(h(BoundedGoban, props)).container;

export function board(width, height, fill = 0) {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

// A small deterministic PRNG. Seeding (rather than pinning Math.random to a
// constant) keeps the random-derived output reproducible AND still varied, so
// tests can assert that stone variations and fuzzy shifts actually differ
// across the board -- a constant would collapse every vertex to one value and
// hide exactly the behavior worth testing.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedRandom(seed = 1) {
  let original = Math.random;
  Math.random = mulberry32(seed);
  return () => {
    Math.random = original;
  };
}

export const count = (container, selector) =>
  container.querySelectorAll(selector).length;

// Vertices carrying a class, matched with classList so odd tokens like
// `shudan-sign_-1` need no selector escaping.
export const countVertexClass = (container, cls) =>
  [...container.querySelectorAll(".shudan-vertex")].filter((el) =>
    el.classList.contains(cls),
  ).length;

// Numeric suffixes of every class starting with `prefix` (e.g. the N in
// shudan-random_N / shudan-shift_N), read off the elements' class lists.
export const indicesFor = (container, prefix) =>
  [...container.querySelectorAll(`[class*="${prefix}"]`)].flatMap((el) =>
    [...el.classList]
      .filter((c) => c.startsWith(prefix))
      .map((c) => Number(c.slice(prefix.length))),
  );

export const renderedAxis = (container, axis) =>
  new Set(
    [...container.querySelectorAll(`[data-${axis}]`)].map((el) =>
      Number(el.getAttribute(`data-${axis}`)),
    ),
  );
