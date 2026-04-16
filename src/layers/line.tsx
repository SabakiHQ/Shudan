import { defineComponents, For, If, prop, useMemo, useRef } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useLightDomReference } from "../utils.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A layer that renders lines between pairs of vertices.
 */
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
    const { height } = useGobanContext();

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
            x={-unit()}
            y={-unit()}
            width={unit(3)}
            height={unit(3)}
          >
            <feDropShadow
              dx="0"
              dy={unit(0.05)}
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx="0"
              dy={unit(-0.05)}
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx={unit(0.05)}
              dy="0"
              stdDeviation={0}
              flood-color="var(--shudan-board-background-color)"
            />
            <feDropShadow
              dx={unit(-0.05)}
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
          stroke-width={() => unit(this.props.width())}
        >
          <For each={this.props.lines}>
            {(line) => {
              const data = useMemo(() => {
                const [start, end] = line();
                const [x1, y1] = Vertex.parse(start);
                const [x2, y2] = Vertex.parse(end);
                const [dx, dy] = [x2 - x1, y1 - y2];

                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                const length = Math.sqrt(unit(dx) ** 2 + unit(dy) ** 2);

                return { x1, y1, angle, length };
              });

              return (
                <g
                  transform={() =>
                    `translate(${unit(data().x1 + 0.5)} ${unit(height() - data().y1 - 0.5)})
                    rotate(${data().angle} 0 0)`
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
                    width={() => data().length}
                    height={unit(0.11)}
                    opacity={0}
                  />

                  <path d={() => `M 0 0 h ${data().length}`} />

                  <If condition={() => this.props.tail() !== "none"}>
                    <use
                      href={`#${customTailId}`}
                      x={-unit(0.5)}
                      y={-unit(0.5)}
                      width={unit()}
                      height={unit()}
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
                      x={() => data().length - unit(0.5)}
                      y={-unit(0.5)}
                      width={unit()}
                      height={unit()}
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
