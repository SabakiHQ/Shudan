# Creating a Custom Layer

Layers are web components that extend the `Layer` base class. They are written
with the [sinho](https://www.npmjs.com/package/sinho) web component library.

They fill the full area of the goban and draw into a shared SVG coordinate
space. The base class handles sizing, clipping, and the `<slot>` that makes
nesting possible — a custom layer only needs to declare its props and implement
`renderContent()`.

**Minimal example:**

```tsx
import { defineComponents, prop, useMemo, For } from "sinho";
import { Layer, unit } from "@sabaki/shudan/Layer";
import { Vertex, VertexRange, useGobanContext } from "@sabaki/shudan/Goban";

export class DotLayer extends Layer({
  vertices: prop<VertexRange[]>([], { attribute: JSON.parse }),
}) {
  renderContent() {
    const { height } = useGobanContext();

    return (
      <For
        each={() =>
          this.props.vertices().flatMap((range) => VertexRange.values(range))
        }
        key={(vertex) => vertex}
      >
        {(vertex) => {
          const parsed = useMemo(() => Vertex.parse(vertex()));
          const [x, y] = [() => parsed()[0], () => parsed()[1]];

          return (
            <circle
              cx={() => unit(x() + 0.5)}
              cy={() => unit(height() - y() - 0.5)}
              r={unit(0.15)}
              fill="red"
            />
          );
        }}
      </For>
    );
  }
}

defineComponents(DotLayer);
```

## Reading Board State

`useGobanContext()` returns reactive signals for all goban state. Call each
signal as a function to read its current value:

```tsx
const { width, height, stones, focusedVertex } = useGobanContext();

width(); // number — board width in vertices
height(); // number — board height in vertices
stones(); // Record<VertexRange, number> | undefined
focusedVertex(); // Vertex | undefined
```

Values that depend on context signals must be wrapped in an arrow function so
they stay reactive:

```tsx
// Static — evaluated once
r={unit(0.15)}

// Reactive — re-evaluated when height() changes
cy={() => unit(height() - y - 0.5)}
```

## The SVG Coordinate System

The base `Layer` creates an SVG with a viewBox that spans the full board:
`(0, 0)` at the top-left to `(width × unit, height × unit)` at the bottom-right.

`unit(n)` converts `n` vertex lengths into SVG pixels. With no argument,
`unit()` returns one full vertex size.

Go coordinates put `y = 0` at the **bottom** row. SVG puts `y = 0` at the
**top**. The conversion formulas are:

| What                         | SVG expression                                             |
| ---------------------------- | ---------------------------------------------------------- |
| Center of vertex `(x, y)`    | `cx={unit(x + 0.5)}` `cy={() => unit(height() - y - 0.5)}` |
| Top-left corner of `(x, y)`  | `x={unit(x)}` `y={() => unit(height() - 1 - y)}`           |
| A length of `n` vertex units | `unit(n)`                                                  |

## Rendering a List of Vertices

For reactive lists, use `For`. `For` only re-renders items whose identity
changes, not the whole list.

Use `VertexRange.index()` to expand a range-keyed prop into individual vertex
entries before passing it to `For`:

```tsx
import { For, useMemo } from "sinho";

const items = useMemo(() =>
  Object.entries(VertexRange.index(this.props.markers())).map(
    ([vertex, value]) => {
      const [x, y] = Vertex.parse(vertex as Vertex);
      return { x, y, vertex: vertex as Vertex, value };
    },
  ),
);

return (
  <For each={items} key={(item) => item.vertex}>
    {(item) => (
      <circle
        cx={unit(item().x + 0.5)}
        cy={() => unit(height() - item().y - 0.5)}
        r={unit(0.15)}
      />
    )}
  </For>
);
```

## Layer Options

The second argument to `Layer()` is an object with entries that control
rendering behaviour:

- `visibleOverflow?: boolean`
  - When `true`, layer content that extends beyond the visible viewport is not
    clipped.
- `renderHTML?: boolean`
  - When `true`, the layer content is rendered as HTML instead of SVG.

## Composing Layers

A layer can render other layer components inside it. This requires
`renderHTML: true`. The example below highlights a set of vertices by combining
a `PaintLayer` for the fill with a `MarkerLayer` for the circles:

```tsx
import { PaintLayer } from "@sabaki/shudan/PaintLayer";
import { MarkerLayer, type Marker } from "@sabaki/shudan/MarkerLayer";

export class HighlightLayer extends Layer(
  {
    vertices: prop<VertexRange[]>([], { attribute: JSON.parse }),
    color: prop<string>("rgba(255, 255, 0, 0.4)", { attribute: String }),
  },
  { renderHTML: true },
) {
  renderContent() {
    return (
      <>
        <PaintLayer
          color={this.props.color}
          paintedVertices={this.props.vertices}
        />
        <MarkerLayer
          color="white"
          markers={() =>
            Object.fromEntries(
              this.props.vertices().map((v) => [v, "circle"]),
            ) as Record<VertexRange, Marker>
          }
        />
      </>
    );
  }
}
```

Child layers are stacked in DOM order on top of their parent, and the parent's
`<slot>` stacks any externally added children on top of those.

## Registering the Component

Every layer must call `defineComponents` at module level so the browser
registers the custom element:

```tsx
defineComponents(DotLayer);
```

The HTML tag name is derived automatically from the class name by kebab-casing
it: `HighlightLayer` → `<highlight-layer>`.
