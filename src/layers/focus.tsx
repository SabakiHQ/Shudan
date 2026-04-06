import {
  defineComponents,
  If,
  prop,
  useContext,
  useEffect,
  useRef,
} from "sinho";
import { GobanContext } from "../goban.tsx";
import { Layer } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import type { VertexPointerEvent } from "../events.ts";

export class FocusLayer extends Layer({}, { visibleOverflow: true }) {
  renderContent() {
    const interactive = useContext(GobanContext.interactive);
    const focused = useContext(GobanContext.focused);
    const focusedVertex = useContext(GobanContext.focusedVertex);
    const position = () =>
      focusedVertex() == null ? null : Vertex.parse(focusedVertex()!);

    const el = useRef<SVGCircleElement>();

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
      <>
        <If condition={() => interactive() && focused() && position() != null}>
          {(() => {
            return (
              <circle
                ref={el}
                cx={() => unitSvg(position()![0] + 0.5)}
                cy={() => unitSvg(position()![1] + 0.5)}
                r={unitSvg(1.02 / 2)}
                fill="none"
                stroke="var(--shudan-board-foreground-color)"
                stroke-width={unitSvg(0.1)}
                stroke-dasharray={`${unitSvg(0.1)} ${unitSvg(0.1)}`}
              />
            );
          })()}
        </If>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, FocusLayer);
