import {
  defineComponents,
  Else,
  If,
  prop,
  useEffect,
  useMemo,
  useRef,
} from "sinho";
import { Layer, unit } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { BlackStone, WhiteStone } from "../assets.tsx";
import { useLightDomReference } from "../utils.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A layer that renders a focus indicator over the currently focused vertex.
 */
export class FocusLayer extends Layer(
  {
    /**
     * The type of the focus indicator. It can be either "outline", "black", "white",
     * or an id referencing a custom SVG object.
     */
    type: prop<"outline" | "black" | "white" | (string & {})>("outline", {
      attribute: String,
    }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const { height, interactive, focused, focusedVertex } = useGobanContext();
    const position = () =>
      focusedVertex() == null ? null : Vertex.parse(focusedVertex()!);

    const el = useRef<SVGElement>();
    const defsContainer = useRef<Element>();

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

    const href = useMemo(() =>
      ["outline", "black", "white"].includes(this.props.type())
        ? undefined
        : this.props.type(),
    );

    const customId = useLightDomReference(href, defsContainer);

    return (
      <>
        <defs ref={defsContainer}>
          <BlackStone id="shudan-black-stone" opacity={0.5} />
          <WhiteStone id="shudan-white-stone" opacity={0.5} />
        </defs>

        <If condition={() => interactive() && focused() && position() != null}>
          <If condition={() => this.props.type() === "outline"}>
            <circle
              ref={el}
              cx={() => unit(position()![0] + 0.5)}
              cy={() => unit(height() - position()![1] - 0.5)}
              r={unit(1.02 / 2)}
              fill="none"
              stroke="var(--shudan-board-foreground-color)"
              stroke-width={unit(0.1)}
              stroke-dasharray={`${unit(0.1)} ${unit(0.1)}`}
            />
          </If>
          <Else>
            <use
              ref={el}
              href={() =>
                this.props.type() === "black"
                  ? "#shudan-black-stone"
                  : this.props.type() === "white"
                    ? "#shudan-white-stone"
                    : `#${customId}`
              }
              x={() => unit(position()![0] + 0.05)}
              y={() => unit(height() - position()![1] - 0.05)}
              width={unit(0.9)}
              height={unit(0.9)}
            />
          </Else>
        </If>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, FocusLayer);
