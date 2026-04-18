import { defineComponents, For, prop, useMemo } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { useGobanContext, useRanges } from "../goban.tsx";

/**
 * Finds the border polygons of a set of painted grid cells.
 *
 * Each cell has four directed edges going counter-clockwise around its
 * perimeter. When two adjacent cells share an edge, their opposing directed
 * edges cancel each other out and are removed from the graph. After all cells
 * are added, only the exterior boundary edges remain.
 *
 * `finalize()` then traces those edges into closed polygon chains. Each chain
 * is classified using the shoelace-formula sign:
 *   - Negative (CCW in Go coordinates) → outer area
 *   - Positive (CW in Go coordinates)  → hole inside an area
 *
 * Vertices in this class are grid *corners* (integer coordinates), not cell
 * centers, so a cell at (x, y) occupies the square from corner (x, y) to
 * corner (x+1, y+1).
 */
class BorderDetector {
  data: Map<Vertex, Set<Vertex>> = new Map();

  add(vertex: Vertex): void {
    const [x, y] = Vertex.parse(vertex);
    const edges: [Vertex, Vertex][] = [
      [vertex, Vertex(x + 1, y)],
      [Vertex(x + 1, y), Vertex(x + 1, y + 1)],
      [Vertex(x + 1, y + 1), Vertex(x, y + 1)],
      [Vertex(x, y + 1), vertex],
    ];

    // Add edges, but delete duplicate edges to detect border

    for (const [v1, v2] of edges) {
      if (this.data.get(v2)?.has(v1)) {
        this.data.get(v2)!.delete(v1);
      } else if (!this.data.has(v1)) {
        this.data.set(v1, new Set([v2]));
      } else {
        this.data.get(v1)!.add(v2);
      }
    }
  }

  finalize(): {
    areas: Vertex[][];
    holes: Vertex[][];
  } {
    const areas: Vertex[][] = [];
    const holes: Vertex[][] = [];

    while (this.data.size > 0) {
      const v1 = this.data.keys().next().value!;
      if (this.data.get(v1)!.size === 0) {
        this.data.delete(v1);
        continue;
      }

      const component: Vertex[] = [v1];

      let anchor = v1;
      while (true) {
        const v2 = this.data.get(anchor)!.values().next().value;

        if (v2 != null) this.data.get(anchor)!.delete(v2);
        if (v2 == null || !this.data.has(v2)) break;

        component.push(v2);
        anchor = v2;
      }

      if (component.at(-1)! === v1) component.pop();

      // Determine orientation of component

      const orientation = component
        .map((v) => Vertex.parse(v))
        .reduce((sum, [x2, y2], i, arr) => {
          const [x1, y1] = arr.at(i - 1)!;
          return sum + (x2 - x1) * (y2 + y1);
        }, 0);

      if (orientation < 0) areas.push(component);
      else holes.push(component);
    }

    return {
      areas: areas.sort(),
      holes: holes.sort(),
    };
  }
}

/**
 * A layer that renders filled regions over groups of adjacent vertices.
 */
export class PaintLayer extends Layer(
  {
    /**
     * The color of the painted vertices.
     *
     * @default "rgba(0, 0, 0, .5)"
     */
    color: prop<string>("rgba(0, 0, 0, .5)", { attribute: String }),
    /**
     * A list of vertices that should be painted.
     */
    paintedVertices: prop<Vertex[]>([], { attribute: JSON.parse }),
    /**
     * The color of the stroke around the painted areas. If set to `"none"`,
     * no stroke is drawn.
     *
     * @default "none"
     */
    stroke: prop<string>("none", { attribute: String }),
    /**
     * The stroke width around the painted areas as a fraction of the
     * vertex size.
     *
     * @default 0.08
     */
    strokeWidth: prop<number>(0.08, { attribute: Number }),
    /**
     * The border radius of the painted areas as a fraction of the vertex size.
     *
     * @default 0.2
     */
    borderRadius: prop<number>(0.2, { attribute: Number }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const { width, height } = useGobanContext();
    const { rangeX, rangeY } = useRanges();

    const borderRadius = this.props.borderRadius;
    const padding = () =>
      this.props.stroke() === "none" ? 0 : this.props.strokeWidth() / 2;
    const borders = useMemo(() => {
      const result = new BorderDetector();
      const paintedVertices = new Set(this.props.paintedVertices());

      for (const vertex of paintedVertices) {
        result.add(vertex);
      }

      return result.finalize();
    });

    const drawPath = (vertices: Vertex[]) =>
      "M " +
      vertices
        .map((v, i) => {
          const [xp, yp] = Vertex.parse(vertices.at(i - 1)!);
          const [x1, y1] = Vertex.parse(v);
          const directionP = Vertex(x1 - xp, y1 - yp);
          const [x2, y2] = Vertex.parse(vertices[(i + 1) % vertices.length]);
          const direction = Vertex(x2 - x1, y2 - y1);
          const rotatedDirection = Vertex(y2 - y1, x1 - x2);
          const [xn, yn] = Vertex.parse(vertices[(i + 2) % vertices.length]);
          const directionN = Vertex(xn - x2, yn - y2);

          const vectorSvg = (vertex: number[]) =>
            vertex.map((x) => unit(x)).join(" ");

          return (
            (directionP === direction
              ? vectorSvg([x1, height() - y1])
              : vectorSvg([
                  x1 - (x1 - xp) * borderRadius(),
                  height() - y1 + (y1 - yp) * borderRadius(),
                ]) +
                " A " +
                vectorSvg([
                  borderRadius(),
                  borderRadius(),
                  0,
                  0,
                  directionP === rotatedDirection ? 0 : 1 / unit(),
                  x1 + (x2 - x1) * borderRadius(),
                  height() - y1 - (y2 - y1) * borderRadius(),
                ])) +
            " L " +
            (direction === directionN
              ? vectorSvg([x2, height() - y2])
              : vectorSvg([
                  x2 - (x2 - x1) * borderRadius(),
                  height() - y2 + (y2 - y1) * borderRadius(),
                ]))
          );
        })
        .join(" ") +
      " Z";

    return (
      <>
        <defs>
          <mask id="holes">
            <rect
              rx={() => unit(borderRadius())}
              ry={() => unit(borderRadius())}
              x={() => unit(Math.max(rangeX()[0], 0) - padding())}
              y={() =>
                unit(Math.max(height() - 1 - rangeY()[1], 0) - padding())
              }
              width={() =>
                unit(
                  Math.min(rangeX()[1] - rangeX()[0] + 1, width()) +
                    2 * padding(),
                )
              }
              height={() =>
                unit(
                  Math.min(rangeY()[1] - rangeY()[0] + 1, height()) +
                    2 * padding(),
                )
              }
              fill="white"
            />

            <g
              fill="black"
              stroke={() => (this.props.stroke() === "none" ? "none" : "white")}
              stroke-width={() => unit(this.props.strokeWidth())}
            >
              <For each={() => borders().holes} key={(vertices) => vertices[0]}>
                {(vertices) => <path d={() => drawPath(vertices())} />}
              </For>
            </g>
          </mask>
        </defs>

        <g
          mask="url(#holes)"
          fill={this.props.color}
          stroke={this.props.stroke}
          stroke-width={() => unit(this.props.strokeWidth())}
        >
          {[() => borders().areas, () => borders().holes].map((paths, i) => (
            <For each={paths} key={(vertices) => vertices[0]}>
              {(vertices) => (
                <path
                  d={() => drawPath(vertices())}
                  fill={i === 0 ? this.props.color : "none"}
                />
              )}
            </For>
          ))}
        </g>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, PaintLayer);
