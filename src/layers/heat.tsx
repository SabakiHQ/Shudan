import { css, defineComponents, For, prop, Style } from "sinho";
import { Layer } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { PaintLayer } from "./paint.tsx";
import { Vertex } from "../main.ts";

export class HeatLayer extends Layer(
  {
    colors: prop<string[]>(
      [
        "rgba(240, 35, 17, .6)",
        "rgba(146, 39, 143, .6)",
        "rgba(72, 134, 213, .6)",
        "rgba(79, 157, 5, .6)",
      ],
      { attribute: JSON.parse },
    ),
    values: prop<Record<Vertex, number>>({}, { attribute: JSON.parse }),
  },
  { renderHTML: true },
) {
  renderContent() {
    return (
      <>
        <For each={this.props.colors}>
          {(color, i, colors) => (
            <PaintLayer
              class="layer"
              color={color}
              paintedVertices={() =>
                Object.entries(this.props.values())
                  .filter(
                    ([, value]) =>
                      i() / colors().length < value &&
                      value <= (i() + 1) / colors().length,
                  )
                  .map(([vertex]) => vertex as Vertex)
              }
            />
          )}
        </For>

        <Style>{css`
          .layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, HeatLayer);
