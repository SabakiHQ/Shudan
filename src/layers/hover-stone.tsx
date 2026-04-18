import { defineComponents, prop, useEffect, useRef, useSignal } from "sinho";
import { Layer } from "./layer.tsx";
import { StoneLayer } from "./stone.tsx";
import { useGobanContext, type Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import type { VertexPointerEvent } from "../events.ts";
import { GobanContext } from "../goban.tsx";
import { useExternalReference } from "../utils.ts";

export class HoverStoneLayer extends Layer(
  {
    /**
     * The color of the stone to be rendered on hover, either 1 or -1.
     * @default 1
     */
    color: prop<1 | -1 | (number & {})>(1, { attribute: Number }),
    /**
     * The opacity of the hover stone, between 0 and 1.
     * @default 0.6
     */
    opacity: prop<number>(0.6, { attribute: Number }),
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
    const defsRef = useRef<Element>();
    const stoneLayerRef = useRef<StoneLayer>();

    const customBlackStoneId = useExternalReference(
      this.getRootNode() as Element,
      blackStoneHref,
      defsRef,
    );
    const customWhiteStoneId = useExternalReference(
      this.getRootNode() as Element,
      whiteStoneHref,
      defsRef,
    );

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
      <>
        <svg
          style={{
            position: "absolute",
            left: -9999,
            top: -9999,
          }}
        >
          <defs ref={defsRef}></defs>
        </svg>

        <StoneLayer
          ref={stoneLayerRef}
          stones={() =>
            hoverVertex() == null
              ? {}
              : { [hoverVertex()!]: this.props.color() }
          }
          dimmedStones={() => (hoverVertex() == null ? [] : [hoverVertex()!])}
          dimOpacity={this.props.opacity}
          blackStoneHref={() =>
            customBlackStoneId() != null
              ? `#${customBlackStoneId()}`
              : undefined
          }
          whiteStoneHref={() =>
            customWhiteStoneId() != null
              ? `#${customWhiteStoneId()}`
              : undefined
          }
        />
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, HoverStoneLayer);
