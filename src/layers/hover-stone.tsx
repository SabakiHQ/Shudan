import { defineComponents, prop, useEffect, useSignal } from "sinho";
import { Layer } from "./layer.tsx";
import { StoneLayer } from "./stone.tsx";
import { useGobanContext, type Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import type { VertexPointerEvent } from "../events.ts";

export class HoverStoneLayer extends Layer(
  {
    type: prop<"black" | "white" | (string & {})>("black", {
      attribute: String,
    }),
    opacity: prop<number>(0.5, { attribute: Number }),
  },
  {
    visibleOverflow: true,
    renderHTML: true,
  },
) {
  renderContent() {
    const { stones } = useGobanContext();
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
      <>
        <StoneLayer
          style={{
            opacity: this.props.opacity,
          }}
          stones={() =>
            hoverVertex() == null
              ? {}
              : {
                  [hoverVertex()!]:
                    this.props.type() === "black"
                      ? 1
                      : this.props.type() === "white"
                        ? -1
                        : 0,
                }
          }
        />
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, HoverStoneLayer);
