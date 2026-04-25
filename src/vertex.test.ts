import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { letterToX, xToLetter, Vertex, VertexRange } from "./vertex.ts";

describe("letterToX", () => {
  test("single letters", () => {
    assert.equal(letterToX("A"), 0);
    assert.equal(letterToX("B"), 1);
    assert.equal(letterToX("H"), 7);
    assert.equal(letterToX("J"), 8); // skips I
    assert.equal(letterToX("Z"), 24);
  });

  test("multi-character letters", () => {
    assert.equal(letterToX("AA"), 25);
    assert.equal(letterToX("AB"), 26);
    assert.equal(letterToX("AZ"), 49);
    assert.equal(letterToX("BA"), 50);
  });

  test("case-insensitive", () => {
    assert.equal(letterToX("a"), 0);
    assert.equal(letterToX("j"), 8);
  });

  test("invalid character returns NaN", () => {
    assert.ok(isNaN(letterToX("I"))); // I is skipped in Go notation
    assert.ok(isNaN(letterToX("1")));
  });
});

describe("xToLetter", () => {
  test("single letters", () => {
    assert.equal(xToLetter(0), "A");
    assert.equal(xToLetter(1), "B");
    assert.equal(xToLetter(7), "H");
    assert.equal(xToLetter(8), "J"); // skips I
    assert.equal(xToLetter(24), "Z");
  });

  test("multi-character letters", () => {
    assert.equal(xToLetter(25), "AA");
    assert.equal(xToLetter(26), "AB");
    assert.equal(xToLetter(49), "AZ");
    assert.equal(xToLetter(50), "BA");
  });
});

describe("letterToX / xToLetter roundtrip", () => {
  test("xToLetter(letterToX(s)) === s for known values", () => {
    for (const letter of ["A", "H", "J", "T", "Z", "AA", "AB", "AZ", "BA"]) {
      assert.equal(xToLetter(letterToX(letter)), letter);
    }
  });

  test("letterToX(xToLetter(x)) === x for 0–99", () => {
    for (let x = 0; x <= 99; x++) {
      assert.equal(letterToX(xToLetter(x)), x);
    }
  });
});

describe("Vertex(x, y)", () => {
  test("converts coordinates to vertex string", () => {
    assert.equal(Vertex(0, 0), "A1");
    assert.equal(Vertex(0, 13), "A14");
    assert.equal(Vertex(18, 0), "T1");
    assert.equal(Vertex(18, 18), "T19");
  });
});

describe("Vertex(string)", () => {
  test("passes string through unchanged", () => {
    assert.equal(Vertex("A1"), "A1");
    assert.equal(Vertex("T19"), "T19");
  });
});

describe("Vertex.parse", () => {
  test("parses standard coordinates", () => {
    assert.deepEqual(Vertex.parse("A1"), [0, 0]);
    assert.deepEqual(Vertex.parse("A6"), [0, 5]);
    assert.deepEqual(Vertex.parse("T19"), [18, 18]);
  });

  test("case-insensitive", () => {
    assert.deepEqual(Vertex.parse("a1"), [0, 0]);
    assert.deepEqual(Vertex.parse("t19"), [18, 18]);
  });

  test("multi-letter columns", () => {
    assert.deepEqual(Vertex.parse("AA1"), [25, 0]);
  });

  test("returns [NaN, NaN] for invalid input", () => {
    const [x, y] = Vertex.parse("invalid");
    assert.ok(isNaN(x));
    assert.ok(isNaN(y));
  });

  test("roundtrip with Vertex(x, y) for full 19x19 board", () => {
    for (let x = 0; x < 19; x++) {
      for (let y = 0; y < 19; y++) {
        assert.deepEqual(Vertex.parse(Vertex(x, y)), [x, y]);
      }
    }
  });
});

describe("VertexRange", () => {
  test("single vertex passthrough", () => {
    assert.equal(VertexRange("A1"), "A1");
  });

  test("creates range from two vertices", () => {
    assert.equal(VertexRange("A1", "C3"), "A1:C3");
    assert.equal(VertexRange("T19", "A1"), "T19:A1");
  });
});

describe("VertexRange.parse", () => {
  test("parses a range string into start and end", () => {
    assert.deepEqual(VertexRange.parse("A1:C3"), ["A1", "C3"]);
    assert.deepEqual(VertexRange.parse("T1:T19"), ["T1", "T19"]);
  });

  test("single vertex returns it as both start and end", () => {
    assert.deepEqual(VertexRange.parse("D4"), ["D4", "D4"]);
  });
});

describe("VertexRange.values", () => {
  test("single vertex string", () => {
    assert.deepEqual(VertexRange.values("D4"), ["D4"]);
  });

  test("degenerate range (same vertex twice)", () => {
    assert.deepEqual(VertexRange.values("D4:D4"), ["D4"]);
  });

  test("row range", () => {
    assert.deepEqual(VertexRange.values("A1:C1"), ["A1", "B1", "C1"]);
  });

  test("column range", () => {
    assert.deepEqual(VertexRange.values("A1:A3"), ["A1", "A2", "A3"]);
  });

  test("rectangle (column-major order)", () => {
    assert.deepEqual(VertexRange.values("A1:B2"), ["A1", "A2", "B1", "B2"]);
  });

  test("inverted range (end before start) is normalised", () => {
    assert.deepEqual(VertexRange.values("C1:A1"), ["A1", "B1", "C1"]);
  });
});

describe("VertexRange.index", () => {
  test("expands ranges to individual vertices", () => {
    assert.deepEqual(VertexRange.index({ "A1:C1": "x", D4: "o" }), {
      A1: "x",
      B1: "x",
      C1: "x",
      D4: "o",
    });
  });

  test("single-vertex range", () => {
    assert.deepEqual(VertexRange.index({ D4: "x" }), { D4: "x" });
  });

  test("later range overwrites earlier for overlapping vertices", () => {
    assert.deepEqual(VertexRange.index({ "A1:B1": "first", A1: "second" }), {
      A1: "second",
      B1: "first",
    });
  });
});
