import { defineComponents, If, prop, useEffect, useRef } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A layer that renders a focus indicator over the currently focused vertex.
 */
export class FocusLayer extends Layer(
  {
    /**
     * The color of the focus indicator. By default, it uses the foreground color of the board.
     */
    stroke: prop<string>("var(--shudan-board-foreground-color)"),
    /**
     * The stroke width of the focus indicator as a fraction of the vertex size.
     *
     * @default 0.1
     */
    strokeWidth: prop<number>(0.1, { attribute: Number }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const { height, interactive, focused, focusedVertex } = useGobanContext();
    const position = () =>
      focusedVertex() == null ? null : Vertex.parse(focusedVertex()!);

    const el = useRef<SVGElement>();

    useEffect(() => {
      // Scroll the focused vertex into view when it changes

      if (el() != null) {
        if ("scrollIntoViewIfNeeded" in el()!) {
          (el() as any).scrollIntoViewIfNeeded();
        } else {
          el()!.scrollIntoView();
        }
      }
    }, [el, focusedVertex]);

    return (
      <If condition={() => interactive() && focused() && position() != null}>
        <circle
          ref={el}
          cx={() => unit(position()![0] + 0.5)}
          cy={() => unit(height() - position()![1] - 0.5)}
          r={unit(0.5)}
          fill="none"
          stroke={this.props.stroke}
          stroke-width={() => unit(this.props.strokeWidth())}
          stroke-dasharray={`${unit(0.1)} ${unit(0.1)}`}
        />
      </If>
    );
  }
}

defineComponents(COMPONENT_PREFIX, FocusLayer);
