import { defineComponents, For, prop } from "sinho";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { unitSvg } from "../utils.ts";
import { COMPONENT_PREFIX } from "../constants.ts";

export class GhostStoneLayer extends Layer({
  /**
   * A mapping from vertices to stone colors.
   */
  stones: prop<Record<Vertex, string>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
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
                cx={unitSvg(x + 0.5)}
                cy={unitSvg(y + 0.5)}
                r={unitSvg(0.18)}
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
