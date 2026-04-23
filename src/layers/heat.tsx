import { defineComponents, For, prop, useMemo } from "sinho";
import { Layer } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { PaintLayer } from "./paint.tsx";
import { Vertex, VertexRange } from "../vertex.ts";

/**
 * A layer that renders a heatmap of numeric values over vertices using a
 * configurable color palette.
 */
export class HeatLayer extends Layer(
  {
    /**
     * The palette of the heatmap. Each color corresponds to a range of values,
     * sorted from low to high.
     */
    colors: prop<string[]>(
      [
        "rgba(240, 35, 17, .6)",
        "rgba(146, 39, 143, .6)",
        "rgba(72, 134, 213, .6)",
        "rgba(79, 157, 5, .6)",
      ],
      { attribute: JSON.parse },
    ),
    /**
     * The values for each vertex range in the heatmap.
     */
    values: prop<Record<VertexRange, number>>({}, { attribute: JSON.parse }),
  },
  { renderHTML: true },
) {
  renderContent() {
    const max = useMemo(() => Math.max(...Object.values(this.props.values())));
    const min = useMemo(() => Math.min(...Object.values(this.props.values())));

    return (
      <For each={this.props.colors}>
        {(color, i, colors) => (
          <PaintLayer
            class="layer"
            color={color}
            paintedVertices={() =>
              VertexRange.entries(this.props.values())
                .filter(
                  ([, value]) =>
                    (i() * (max() - min())) / colors().length + min() < value &&
                    value <=
                      ((i() + 1) * (max() - min())) / colors().length + min(),
                )
                .map(([vertex]) => vertex as Vertex)
            }
          />
        )}
      </For>
    );
  }
}

defineComponents(COMPONENT_PREFIX, HeatLayer);
