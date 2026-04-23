import { defineComponents, For, prop } from "sinho";
import {
  Vertex,
  VertexRange,
} from "../vertex.ts";
import { Layer, unit } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A layer that renders small stone indicators, typically used to show
 * move suggestions or candidate moves.
 */
export class StoneIndicatorLayer extends Layer({
  /**
   * A mapping from vertex ranges to stone colors.
   */
  stones: prop<Record<VertexRange, string>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
    const { height } = useGobanContext();

    return (
      <>
        <For
          each={() => VertexRange.entries(this.props.stones())}
          key={([vertex]) => vertex}
        >
          {(stone) => {
            const [x, y] = Vertex.parse(stone()[0] as Vertex);
            const color = () => stone()[1];

            return (
              <circle
                cx={unit(x + 0.5)}
                cy={() => unit(height() - 1 - y + 0.5)}
                r={unit(0.18)}
                fill={color}
                stroke="none"
              />
            );
          }}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, StoneIndicatorLayer);
