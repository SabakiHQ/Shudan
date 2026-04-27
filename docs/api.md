# API Reference

## `class Goban extends HTMLElement`

**HTML Tag:** `<shudan-goban>`

Main board component. It provides board sizing, coordinates, viewport cropping,
keyboard navigation, vertex events, and contains all layer components.

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
- `partial?: VertexRange`
  - **Attribute:** `partial`
  - Cuts off the goban to only display the area defined by the given vertex
    range.
- `focusedVertex?: Vertex`
  - **Attribute:** `focused-vertex`
  - The currently focused vertex. Only has a value if `interactive` is enabled.

### Events

- `focused-vertex-change`
  - **Event:** [`VertexEvent`](#class-vertexevent-extends-event)
  - This event is emitted when the focused vertex changes.
- `vertex-click`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
  - This event is emitted when a vertex is clicked.
- `vertex-pointer-up`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
  - This event is emitted when a pointer is released while hovering over a
    vertex.
- `vertex-pointer-down`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
  - This event is emitted when a pointer is pressed down while hovering over a
    vertex.
- `vertex-pointer-move`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
  - This event is emitted when a pointer moves while hovering over a vertex.
- `vertex-pointer-enter`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
  - This event is emitted when a pointer enters the vertices area.
- `vertex-pointer-leave`
  - **Event:**
    [`VertexPointerEvent`](#class-vertexpointerevent-extends-vertexevent)
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

## `class VertexEvent extends Event`

An event that carries a vertex, emitted when the focused vertex changes.

### Properties

- `vertex: Vertex`
  - The vertex associated with the event.

## `class VertexPointerEvent extends VertexEvent`

A pointer event that also carries the board vertex the pointer was over.

### Properties

- `vertex: Vertex`
  - The vertex associated with the event.
- `pointerEvent: PointerEvent`
  - The original DOM pointer event that triggered this event.

## `class GridLayer extends HTMLElement`

**HTML Tag:** `<shudan-grid-layer>`

A layer that renders the grid lines and hoshi markers.

### Props and Attributes

- `color: string` (default `"var(--shudan-board-foreground-color)"`)
  - **Attribute:** `color`
  - The color of the grid lines and hoshi markers. Defaults to the board
    foreground color.
- `hoshis: VertexRange[]`
  - **Attribute:** `hoshis`
  - The positions or ranges of hoshi markers.
- `strokeWidth: number` (default `0.04`)
  - **Attribute:** `stroke-width`
  - The stroke width of the grid lines as a fraction of the vertex size.
- `borderStrokeWidth: number` (default `0.04`)
  - **Attribute:** `border-stroke-width`
  - The stroke width of the border lines as a fraction of the vertex size.

## `class StoneLayer extends HTMLElement`

**HTML Tag:** `<shudan-stone-layer>`

A layer that renders black and white stones including shadows.

### Props and Attributes

- `stones: Record<VertexRange, number> | undefined`
  - **Attribute:** `stones`
  - A mapping from vertex ranges to `-1` representing a white stone, or `1`
    representing a black stone.
- `noShadows: boolean` (default `false`)
  - **Attribute:** `no-shadows`
  - Whether to render shadows under the stones.
- `dimmedStones: VertexRange[] | undefined`
  - **Attribute:** `dimmed-stones`
  - A list of stones that should be marked as dimmed. Has no effect on empty
    vertices.
- `dimOpacity: number` (default `0.6`)
  - **Attribute:** `dim-opacity`
  - The opacity of the dimmed stones, between 0 and 1.
- ``blackStoneHref: `#${string}` ``
  - **Attribute:** `black-stone-href`
  - An id referencing an SVG object that should be used to represent a black
    stone.
- ``whiteStoneHref: `#${string}` ``
  - **Attribute:** `white-stone-href`
  - An id referencing an SVG object that should be used to represent a white
    stone.

## `class FocusLayer extends HTMLElement`

**HTML Tag:** `<shudan-focus-layer>`

A layer that renders a focus indicator over the currently focused vertex.

### Props and Attributes

- `stroke: string`
  - The color of the focus indicator. By default, it uses the foreground color
    of the board.
- `strokeWidth: number` (default `0.1`)
  - **Attribute:** `stroke-width`
  - The stroke width of the focus indicator as a fraction of the vertex size.

## `class HoverStoneLayer extends HTMLElement`

**HTML Tag:** `<shudan-hover-stone-layer>`

A layer that renders a semi-transparent stone on the vertex currently being
hovered by the pointer.

If used as a child of a `StoneLayer`, hover stones will only be rendered on
empty vertices, and it can automatically adjust the stone rendering according to
the underlying stones.

### Props and Attributes

- `color: 1 | -1 | number` (default `1`)
  - **Attribute:** `color`
  - The color of the stone to be rendered on hover, either 1 or -1.
- `opacity: number` (default `0.6`)
  - **Attribute:** `opacity`
  - The opacity of the hover stone, between 0 and 1.
- ``blackStoneHref: `#${string}` ``
  - **Attribute:** `black-stone-href`
  - An id referencing an SVG object that should be used to represent a black
    stone. If set to `undefined`, it uses the stone rendering of the underlying
    `StoneLayer` if available.
- ``whiteStoneHref: `#${string}` ``
  - **Attribute:** `white-stone-href`
  - An id referencing an SVG object that should be used to represent a white
    stone. If set to `undefined`, it uses the stone rendering of the underlying
    `StoneLayer` if available.

## `class StoneIndicatorLayer extends HTMLElement`

**HTML Tag:** `<shudan-stone-indicator-layer>`

A layer that renders small stone indicators, typically used to show move
suggestions or candidate moves.

### Props and Attributes

- `stones: Record<VertexRange, string>` (default `{}`)
  - **Attribute:** `stones`
  - A mapping from vertex ranges to stone colors.

## `class MarkerLayer extends HTMLElement`

**HTML Tag:** `<shudan-marker-layer>`

A layer that renders shape markers (circles, crosses, triangles, etc.) on
specified vertices or vertex ranges.

As child of a `StoneLayer`, it can automatically adjust the color and outline
according to the underlying stones.

### Props and Attributes

- `color: string`
  - **Attribute:** `color`
  - The color of the markers. If set to `undefined`, it uses the default colors
    according to the `stoneMap` of an underlying stone layer if available, or
    the board foreground color.
- `outline: string`
  - **Attribute:** `outline`
  - The outline color of the markers. If set to `undefined`, it uses the board
    background color on empty vertices, and is transparent on occupied vertices
    according to the `stoneMap` of an underlying stone layer if available.
- `markers: Record<VertexRange, Marker>` (default `{}`)
  - **Attribute:** `markers`
  - A mapping from vertex ranges to markers.
  - `Marker` is either a shorthand `MarkerType` string, or an object with
    optional fields:
    - `type?: MarkerType` — one of `"point"`, `"circle"`, `"cross"`,
      `"triangle"`, `"square"`
    - `color?: string`

## `class LabelLayer extends HTMLElement`

**HTML Tag:** `<shudan-label-layer>`

A layer that renders text labels on specified vertices or vertex ranges.

If used as a child of a `StoneLayer`, it can automatically adjust the text color
and background according to the underlying stones.

### Props and Attributes

- `color: string`
  - **Attribute:** `color`
  - The text color of the labels. If set to `undefined`, it uses the default
    colors according to the `stoneMap` of an underlying stone layer if
    available, or the board foreground color.
- `background: string`
  - **Attribute:** `background`
  - The background of the labels. If set to `undefined`, it uses the board
    background on empty vertices, and is transparent on occupied vertices
    according to the `stoneMap` of an underlying stone layer if available.
- `labels: Record<VertexRange, Label>` (default `{}`)
  - **Attribute:** `labels`
  - A map of vertex ranges and their labels.
  - `Label` is either a plain string, or an object with optional fields:
    - `text?: string`
    - `color?: string`
    - `tooltip?: string`

### CSS Parts

- `shudan-label-layer::part(label)`
  - The CSS part for label elements.

## `class PaintLayer extends HTMLElement`

**HTML Tag:** `<shudan-paint-layer>`

A layer that renders filled regions over groups of adjacent vertices.

### Props and Attributes

- `color: string` (default `"rgba(0, 0, 0, .5)"`)
  - **Attribute:** `color`
  - The color of the painted vertices.
- `paintedVertices: VertexRange[]` (default `[]`)
  - **Attribute:** `painted-vertices`
  - A list of vertices or ranges that should be painted.
- `stroke: string` (default `"none"`)
  - **Attribute:** `stroke`
  - The color of the stroke around the painted areas. If set to `"none"`, no
    stroke is drawn.
- `strokeWidth: number` (default `0.08`)
  - **Attribute:** `stroke-width`
  - The stroke width around the painted areas as a fraction of the vertex size.
- `borderRadius: number` (default `0.2`)
  - **Attribute:** `border-radius`
  - The border radius of the painted areas as a fraction of the vertex size.

## `class HeatLayer extends HTMLElement`

**HTML Tag:** `<shudan-heat-layer>`

A layer that renders a heatmap of numeric values over vertices using a
configurable color palette.

### Props and Attributes

- `colors: string[]`
  - **Attribute:** `colors`
  - The palette of the heatmap. Each color corresponds to a range of values,
    sorted from low to high.
- `values: Record<VertexRange, number>` (default `{}`)
  - **Attribute:** `values`
  - The values for each vertex range in the heatmap.

## `class LineLayer extends HTMLElement`

**HTML Tag:** `<shudan-line-layer>`

A layer that renders lines between pairs of vertices.

### Props and Attributes

- `color: string`
  - **Attribute:** `color`
  - The color of the lines. Defaults to the board foreground color.
- `outline: string`
  - **Attribute:** `outline`
  - The color of the outline around the lines. Defaults to the board background
    color.
- `width: number` (default `0.11`)
  - **Attribute:** `width`
  - The width of the lines as a fraction of the vertex size.
- ``head: "none" | "arrow" | `#${string}` `` (default `"none"`)
  - **Attribute:** `head`
  - The style of the head of the lines. Can be `"none"`, `"arrow"`, or an id
    referencing a custom SVG object.
- ``tail: "none" | `#${string}` `` (default `"none"`)
  - **Attribute:** `tail`
  - The style of the tail of the lines. Can be `"none"` or an id referencing a
    custom SVG object.
- `lines: [start: Vertex, end: Vertex][]` (default `[]`)
  - **Attribute:** `lines`
  - The list of lines, each defined by a pair of start and end vertices.
