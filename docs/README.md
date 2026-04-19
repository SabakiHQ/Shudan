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

Alternatively, you can use the web components directly in your HTML once the
module is imported:

```html
<shudan-goban coords width="9" height="9">
  <shudan-grid-layer></shudan-grid-layer>
  <shudan-stone-layer stones='{ "C3": 1, "G7": -1 }'></shudan-stone-layer>
</shudan-goban>
```

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

```ts
Vertex(0, 13); // → "A14"
Vertex(18, 0); // → "T1"
```

### `Vertex.parse(coord: string): [number, number]`

Parses a Go coordinate string (e.g. `"A6"`, `"T19"`, `"AA3"`) into numerical
coordinates:

```ts
Vertex.parse("A6"); // → [0, 5]
Vertex.parse("T19"); // → [18, 18]
```
