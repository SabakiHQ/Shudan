import {
  defineComponents,
  Else,
  If,
  prop,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "sinho";
import { GobanContext } from "../goban.tsx";
import { Layer, unitSvg } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { BlackStone, WhiteStone } from "../assets.tsx";
import { useLightDomReference } from "../utils.ts";

export class FocusLayer extends Layer(
  {
    type: prop<"outline" | "black" | "white" | (string & {})>("outline", {
      attribute: String,
    }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const height = useContext(GobanContext.height);
    const interactive = useContext(GobanContext.interactive);
    const focused = useContext(GobanContext.focused);
    const focusedVertex = useContext(GobanContext.focusedVertex);
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
              cx={() => unitSvg(position()![0] + 0.5)}
              cy={() => unitSvg(height() - position()![1] - 0.5)}
              r={unitSvg(1.02 / 2)}
              fill="none"
              stroke="var(--shudan-board-foreground-color)"
              stroke-width={unitSvg(0.1)}
              stroke-dasharray={`${unitSvg(0.1)} ${unitSvg(0.1)}`}
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
              x={() => unitSvg(position()![0] + 0.05)}
              y={() => unitSvg(height() - position()![1] - 0.05)}
              width={unitSvg(0.9)}
              height={unitSvg(0.9)}
            />
          </Else>
        </If>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, FocusLayer);
