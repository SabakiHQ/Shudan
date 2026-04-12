import {
  defineComponents,
  For,
  If,
  prop,
  useContext,
  useMemo,
  useRef,
} from "sinho";
import { Layer, unitSvg } from "./layer.tsx";
import { GobanContext, Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useLightDomReference } from "../utils.ts";

export class LineLayer extends Layer({
  /**
   * The color of the lines. Defaults to the board foreground color.
   */
  color: prop<string>("var(--shudan-board-foreground-color)", {
    attribute: String,
  }),
  /**
   * The width of the lines as a fraction of the vertex size.
   */
  width: prop<number>(0.11, { attribute: Number }),
  /**
   * The style of the head of the lines. Can be "none", "arrow", or an id
   * referencing a custom SVG object.
   */
  head: prop<"none" | "arrow" | (string & {})>("none", { attribute: String }),
  /**
   * The style of the tail of the lines. Can be "none" or an id
   * referencing a custom SVG object.
   */
  tail: prop<"none" | (string & {})>("none", { attribute: String }),
  /**
   * The list of lines, each defined by a pair of start and end vertices.
   */
  lines: prop<[start: Vertex, end: Vertex][]>([], { attribute: JSON.parse }),
}) {
  renderContent() {
    const height = useContext(GobanContext.height);

    const defsRef = useRef<Element>();
    const customHead = useMemo(() =>
      ["none", "arrow"].includes(this.props.head())
        ? undefined
        : this.props.head(),
    );
    const customTail = useMemo(() =>
      this.props.tail() === "none" ? undefined : this.props.tail(),
    );

    const customHeadId = useLightDomReference(customHead, defsRef);
    const customTailId = useLightDomReference(customTail, defsRef);

    return (
      <>
        <defs ref={defsRef}>
          <filter
            id="shudan-outline"
            x={-unitSvg()}
            y={-unitSvg()}
            width={unitSvg(3)}
            height={unitSvg(3)}
          >
            <feDropShadow
              dx="0"
              dy={unitSvg(0.05)}
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx="0"
              dy={unitSvg(-0.05)}
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx={unitSvg(0.05)}
              dy="0"
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx={unitSvg(-0.05)}
              dy="0"
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
          </filter>

          <symbol id="shudan-arrowhead" viewBox="0 0 1 1">
            <path d="M 0.2 0.25 L 0.5 0.5 L 0.2 0.75" />
          </symbol>
        </defs>

        <g
          fill="none"
          stroke={this.props.color}
          stroke-width={() => unitSvg(this.props.width())}
        >
          <For each={this.props.lines}>
            {(line) => {
              const [start, end] = [0, 1].map((i) => () => line()[i]);
              const [x1, y1] = [0, 1].map(
                (i) => () => Vertex.parse(start())[i],
              );
              const [x2, y2] = [0, 1].map((i) => () => Vertex.parse(end())[i]);
              const [dx, dy] = [0, 1].map((i) =>
                i === 0 ? () => x2() - x1() : () => y1() - y2(),
              );
              const angle = () => (Math.atan2(dy(), dx()) * 180) / Math.PI;
              const length = () =>
                Math.sqrt(unitSvg(dx()) ** 2 + unitSvg(dy()) ** 2);

              return (
                <g
                  transform={() =>
                    `translate(${unitSvg(x1() + 0.5)} ${unitSvg(height() - y1() - 0.5)})
                    rotate(${angle()} 0 0)`
                  }
                  filter="url(#shudan-outline)"
                >
                  {/*
                    This hidden rect is needed to prevent drop shadow from
                    removing pure horizontal/vertical lines
                   */}
                  <rect
                    x={0}
                    y={0}
                    width={() => length()}
                    height={unitSvg(0.11)}
                    opacity={0}
                  />

                  <path d={() => `M 0 0 h ${length()}`} />

                  <If condition={() => this.props.tail() !== "none"}>
                    <use
                      href={`#${customTailId}`}
                      x={-unitSvg(0.5)}
                      y={-unitSvg(0.5)}
                      width={unitSvg()}
                      height={unitSvg()}
                      stroke-width={this.props.width}
                    />
                  </If>
                  <If condition={() => this.props.head() !== "none"}>
                    <use
                      href={() =>
                        this.props.head() === "arrow"
                          ? "#shudan-arrowhead"
                          : `#${customHeadId}`
                      }
                      x={() => length() - unitSvg(0.5)}
                      y={-unitSvg(0.5)}
                      width={unitSvg()}
                      height={unitSvg()}
                      stroke-width={this.props.width}
                    />
                  </If>
                </g>
              );
            }}
          </For>
        </g>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, LineLayer);
