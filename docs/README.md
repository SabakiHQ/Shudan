# Shudan Documentation

## About Shudan

Shudan is a web component library for rendering Go boards. It provides a
flexible and customizable goban component with support for multiple layers,
including stones, markers, labels, and more.

## Installation

It is recommended to use npm to install:

```
npm install @sabaki/shudan
```

To use this module, use a bundler like webpack and import it as follows:

```ts
import { Goban, GridLayer, StoneLayer } from "@sabaki/shudan";

const goban = new Goban();
goban.width = 9;
goban.height = 9;
goban.coords = true;

const stoneLayer = new StoneLayer();
stoneLayer.stones = { C3: 1, G7: -1 };

goban.append(new GridLayer(), stoneLayer);
document.body.append(goban);
```

It is possible to import the components individually if you only need a subset
of the functionality:

```ts
import { Goban } from "@sabaki/shudan/Goban";
import { GridLayer } from "@sabaki/shudan/GridLayer";
import { StoneLayer } from "@sabaki/shudan/StoneLayer";
```

Alternatively, you can use the web components directly in your HTML once the
module is imported:

```html
<shudan-goban coords width="9" height="9">
  <shudan-grid-layer></shudan-grid-layer>
  <shudan-stone-layer stones='{ "C3": 1, "G7": -1 }'></shudan-stone-layer>
</shudan-goban>
```

A minified bundle is also available at `@sabaki/shudan/min` or `dist/min.js` for
direct use in the browser without a bundler.

## Coordinate System

Board positions are represented by a vertex, which is a string coordinate in
standard Go notation.

- Columns are lettered left to right with `I` skipped:
  `A, B, C, …, H, J, …, T, AA, AB, …`.
- Rows are numbered bottom to top, starting at `1`.
- Coordinate examples on a 19x19 board:
  - Bottom-left is `A1`
  - Top-right is `T19`

Numerical coordinates are 0-based with the origin at the bottom-left corner,
so`A1` corresponds to `[0, 0]`, `B1` to `[1, 0]`, `A2` to `[0, 1]`, and so on.
Use `Vertex` to convert between vertex strings and numerical coordinates:

### `Vertex(x: number, y: number): Vertex`

Converts numerical coordinate to a Go coordinate string.

**Example:**

```ts
Vertex(0, 13); // → "A14"
Vertex(18, 0); // → "T1"
```

### `Vertex.parse(coord: string): [number, number]`

Parses a Go coordinate string (e.g. `"A6"`, `"T19"`, `"AA3"`) into numerical
coordinates:

**Example:**

```ts
Vertex.parse("A6"); // → [0, 5]
Vertex.parse("T19"); // → [18, 18]
```

### `VertexRange`

Many layer props accept `VertexRange` values in addition to single vertices.

- A single vertex like `"D4"`
- A rectangle range like `"C3:F6"`

Ranges are inclusive on both ends. For example, `"A1:C2"` expands to
`A1, A2, B1, B2, C1, C2`.

### `VertexRange(vertex: Vertex): VertexRange`

Creates a `VertexRange` string from a single `Vertex`.

### `VertexRange(start: Vertex, end: Vertex): VertexRange`

Creates a `VertexRange` string from a pair of `Vertex` values.

### `VertexRange.parse(range: string): [Vertex, Vertex]`

Parses a `VertexRange` string into its start and end `Vertex` values.

### `VertexRange.values(range: VertexRange): Vertex[]`

Generates all `Vertex` values within a given `VertexRange`. For example, the
range `"A1:C3"` would produce the vertices for the rectangle from A1 to C3.

### `VertexRange.index<T>(data: Record<VertexRange, T>): Record<Vertex, T>`

Indexes an object keyed by `VertexRange` into an object keyed by individual
`Vertex` values. Each range key is resolved to all the vertices it covers, and
every resulting vertex maps to the same value as its source range.

**Example:**

```ts
VertexRange.index({ "A1:C1": "x", D4: "o" });
// → { A1: "x", B1: "x", C1: "x", D4: "o" }
```

## Layers

Shudan renders a board by stacking child layer elements inside `<shudan-goban>`.
Each layer is positioned on the same board coordinates and draws one visual
concern (grid, stones, markers, labels, overlays, and so on).

### Layer Order

Layers are painted in DOM order:

- Earlier children are drawn below later children.
- Later children appear on top.

For example, a `GridLayer` should usually be before `StoneLayer`, and marker or
label layers usually come after stones so they stay visible.

### Layer Groups

Any layer element can act as a layer group by containing other layer elements as
children. Child layers are rendered on top of their parent layer, and siblings
among those children are painted in DOM order.

Use `LayerGroup` (HTML tag: `<shudan-layer-group>`) when you only need grouping
without any rendering of its own.

Common uses:

- Keep related overlays together (for example labels + markers + lines).
- Toggle visibility by applying attributes/classes/styles to one group host.
- Improve readability when composing many layers.

**Example:**

```ts
import {
  Goban,
  GridLayer,
  StoneLayer,
  MarkerLayer,
  LabelLayer,
  LayerGroup,
} from "@sabaki/shudan";

const goban = new Goban();

const base = new LayerGroup();
base.append(new GridLayer(), new StoneLayer());

const annotations = new LayerGroup();
annotations.append(new MarkerLayer(), new LabelLayer());

goban.append(base, annotations);
```

```html
<shudan-goban>
  <shudan-layer-group>
    <shudan-grid-layer></shudan-grid-layer>
    <shudan-stone-layer></shudan-stone-layer>
  </shudan-layer-group>

  <shudan-layer-group>
    <shudan-marker-layer></shudan-marker-layer>
    <shudan-label-layer></shudan-label-layer>
  </shudan-layer-group>
</shudan-goban>
```

## API Documentation

See [API Reference](./api.md) for detailed documentation of all components and
built-in layers.
