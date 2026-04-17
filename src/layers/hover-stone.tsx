import { defineComponents, prop, useEffect, useSignal } from "sinho";
import { Layer } from "./layer.tsx";
import { StoneLayer } from "./stone.tsx";
import { useGobanContext, type Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import type { VertexPointerEvent } from "../events.ts";
import { GobanContext } from "../goban.tsx";

export class HoverStoneLayer extends Layer(
  {
    /**
     * The color of the stone to be rendered on hover, either 1 or -1.
     * @default 1
     */
    color: prop<1 | -1 | (number & {})>(1, { attribute: Number }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * black stone.
     */
    blackStoneHref: prop(GobanContext.blackStoneHref, { attribute: String }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * white stone.
     */
    whiteStoneHref: prop(GobanContext.whiteStoneHref, { attribute: String }),
  },
  {
    visibleOverflow: true,
    renderHTML: true,
  },
) {
  renderContent() {
    const { stones, blackStoneHref, whiteStoneHref } = useGobanContext();
    const [hoverVertex, setHoverVertex] = useSignal<Vertex>();

    useEffect(() => {
      function handleVertexPointerMove(evt: VertexPointerEvent) {
        if (stones() == null || (stones()![evt.vertex] ?? 0) === 0) {
          setHoverVertex(evt.vertex);
        } else {
          setHoverVertex(undefined);
        }
      }

      function handleVertexPointerLeave() {
        setHoverVertex(undefined);
      }

      this.goban.addEventListener(
        "vertex-pointer-move",
        handleVertexPointerMove,
      );

      this.goban.addEventListener(
        "vertex-pointer-leave",
        handleVertexPointerLeave,
      );

      return () => {
        this.goban.removeEventListener(
          "vertex-pointer-move",
          handleVertexPointerMove,
        );

        this.goban.removeEventListener(
          "vertex-pointer-leave",
          handleVertexPointerLeave,
        );
      };
    });

    return (
      <StoneLayer
        stones={() =>
          hoverVertex() == null ? {} : { [hoverVertex()!]: this.props.color() }
        }
        dimmedStones={() => (hoverVertex() == null ? [] : [hoverVertex()!])}
        blackStoneHref={blackStoneHref}
        whiteStoneHref={whiteStoneHref}
      />
    );
  }
}

defineComponents(COMPONENT_PREFIX, HoverStoneLayer);
