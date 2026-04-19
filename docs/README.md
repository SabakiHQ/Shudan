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

## `class Goban`

**HTML Tag:** `<shudan-goban>`

Main board component. It provides board sizing, coordinates, viewport cropping,
keyboard navigation, pointer/vertex events, and contains all layer components.

### Props and Attributes

- `width: number` (default `19`)
  - **Attribute:** `width`
  - The width of the goban in vertices.
- `height: number` (default `19`)
  - **Attribute:** `height`
  - The height of the goban in vertices.
- `vertexSize: string | number` (default `"1.7em"`)
  - **Attribute:** `vertex-size`
  - The size of a vertex. Can be specified as any CSS length unit, or as a pixel
    number.
- `interactive: boolean` (default `false`)
  - **Attribute:** `interactive`
  - Whether the goban should be focusable and support keyboard navigation.
- `coords: boolean` (default `false`)
  - **Attribute:** `coords`
  - Whether coordinates should be displayed around the goban.
- `coordX: (x: number) => string`
  - A function that returns the label to be displayed for a given x coordinate.
    Only has an effect if `coords` is enabled.
- `coordY: (y: number) => string`
  - A function that returns the label to be displayed for a given y coordinate.
    Only has an effect if `coords` is enabled.
- `topLeft?: Vertex`
  - **Attribute:** `top-left`
  - Cuts off the goban to only display the area from the given vertex to the
    bottom-right vertex, inclusive.
- `bottomRight?: Vertex`
  - **Attribute:** `bottom-right`
  - Cuts off the goban to only display the area from the top-left vertex to the
    given vertex, inclusive.
- `focusedVertex?: Vertex`
  - **Attribute:** `focused-vertex`
  - The currently focused vertex. Only has a value if `interactive` is enabled.

### Events

- `focused-vertex-change`
  - This event is emitted when the focused vertex changes.
- `vertex-click`
  - This event is emitted when a vertex is clicked.
- `vertex-pointer-up`
  - This event is emitted when a pointer is released while hovering over a
    vertex.
- `vertex-pointer-down`
  - This event is emitted when a pointer is pressed down while hovering over a
    vertex.
- `vertex-pointer-move`
  - This event is emitted when a pointer moves while hovering over a vertex.
- `vertex-pointer-enter`
  - This event is emitted when a pointer enters the vertices area.
- `vertex-pointer-leave`
  - This event is emitted when a pointer leaves the vertices area.

### CSS Variables

`shudan-goban` defines the following CSS variables for customizing the
appearance of the goban which can be overridden in your stylesheets:

- `--shudan-board-outline-color`
  - The color of the focus outline around the board.
- `--shudan-board-background`
  - The background image of the board.
- `--shudan-board-background-color`
  - The background color of the board.
- `--shudan-board-foreground-color`
  - The foreground color of the board. This is used as the default color for
    grid lines, hoshi markers, and coordinates.
- `--shudan-black-foreground-color`
  - The foreground color used for black stones. This is used as the default text
    color for black stones in the stone layer.
- `--shudan-white-foreground-color`
  - The foreground color used for white stones. This is used as the default text
    color for white stones in the stone layer.

### CSS Parts

- `shudan-goban::part(coord-x)`
  - The CSS part for x coordinate labels.
- `shudan-goban::part(coord-y)`
  - The CSS part for y coordinate labels.
