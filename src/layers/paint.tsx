import { defineComponents, For, prop, useMemo } from "sinho";
import { Layer } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";

const borderRadius = 0.2;

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

  finalize(): Vertex[][] {
    const result: Vertex[][] = [];

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
        if (v2 == null || component.includes(v2) || !this.data.has(v2)) break;

        component.push(v2);
        anchor = v2;
      }

      result.push(component);
    }

    return result;
  }
}

export class PaintLayer extends Layer(
  {
    /**
     * The color of the painted vertices.
     */
    color: prop<string>("rgba(0, 0, 0, .5)", { attribute: String }),
    /**
     * A list of vertices that should be painted.
     */
    paintedVertices: prop<Vertex[]>([], { attribute: JSON.parse }),
    stroke: prop<string>("none", { attribute: String }),
    strokeWidth: prop<number>(0.08, { attribute: Number }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const verticesSet = useMemo(() => new Set(this.props.paintedVertices()));
    const paths = useMemo(() => {
      const result = new BorderDetector();

      for (const vertex of verticesSet()) {
        result.add(vertex);
      }

      return result.finalize().sort();
    });

    return (
      <>
        <defs></defs>

        <g
          fill={this.props.color}
          stroke={this.props.stroke}
          stroke-width={() => unitSvg(this.props.strokeWidth())}
        >
          <For each={paths} key={(path) => path[0]}>
            {(path) => (
              <path
                d={() =>
                  "M " +
                  path()
                    .map((v, i) => {
                      const [xp, yp] = Vertex.parse(path().at(i - 1)!);
                      const [x1, y1] = Vertex.parse(v);
                      const directionP = Vertex(x1 - xp, y1 - yp);
                      const [x2, y2] = Vertex.parse(
                        path()[(i + 1) % path().length],
                      );
                      const direction = Vertex(x2 - x1, y2 - y1);
                      const rotatedDirection = Vertex(y2 - y1, x1 - x2);
                      const [xn, yn] = Vertex.parse(
                        path()[(i + 2) % path().length],
                      );
                      const directionN = Vertex(xn - x2, yn - y2);

                      const vectorSvg = (vertex: number[]) =>
                        vertex.map((x) => unitSvg(x)).join(" ");

                      return (
                        (directionP === direction
                          ? vectorSvg([x1, y1])
                          : vectorSvg([
                              x1 - (x1 - xp) * borderRadius,
                              y1 - (y1 - yp) * borderRadius,
                            ]) +
                            " A " +
                            vectorSvg([
                              borderRadius,
                              borderRadius,
                              0,
                              0,
                              directionP === rotatedDirection
                                ? 1 / unitSvg()
                                : 0,
                              x1 + (x2 - x1) * borderRadius,
                              y1 + (y2 - y1) * borderRadius,
                            ])) +
                        " L " +
                        (direction === directionN
                          ? vectorSvg([x2, y2])
                          : vectorSvg([
                              x2 - (x2 - x1) * borderRadius,
                              y2 - (y2 - y1) * borderRadius,
                            ]))
                      );
                    })
                    .join(" ") +
                  " Z"
                }
              />
            )}
          </For>
        </g>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, PaintLayer);
