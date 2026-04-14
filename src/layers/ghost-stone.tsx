import { defineComponents, For, prop } from "sinho";
import { Vertex } from "../vertex.ts";
import { Layer, unit } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A layer that renders small ghost stone indicators, typically used to show
 * move suggestions or candidate moves.
 */
export class GhostStoneLayer extends Layer({
  /**
   * A mapping from vertices to stone colors.
   */
  stones: prop<Record<Vertex, string>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
    const { height } = useGobanContext();

    return (
      <>
        <For
          each={() => Object.entries(this.props.stones())}
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

defineComponents(COMPONENT_PREFIX, GhostStoneLayer);
