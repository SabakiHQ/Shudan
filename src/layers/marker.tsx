import {
  defineComponents,
  For,
  prop,
  useContext,
  useMemo,
  type Template,
} from "sinho";
import { Layer } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";
import { GobanContext } from "../goban.tsx";

export type Marker = "point" | "circle" | "cross" | "triangle" | "square";

export class MarkerLayer extends Layer({
  /**
   * The color of the markers. If set to `undefined`, it uses the default colors
   * according to the `stoneMap` of an underlying stone layer if available, or
   * the board foreground color.
   */
  color: prop<string>(undefined, { attribute: String }),
  /**
   * A mapping from vertices to marker types.
   */
  markers: prop<Record<Vertex, Marker>>({}, { attribute: JSON.parse }),
}) {
  renderContent(): Template {
    const vertexViewBox = `0 0 ${unitSvg(1)} ${unitSvg(1)}`;

    const stoneMap = useContext(GobanContext.stoneMap);

    const markers = useMemo(() =>
      Object.entries(this.props.markers()).map(([vertex, type]) => {
        const [x, y] = Vertex.parse(vertex as Vertex);
        return { x, y, vertex, type };
      }),
    );

    return (
      <>
        <defs>
          <filter
            id="outline"
            x={unitSvg(-1)}
            y={unitSvg(-1)}
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

          <symbol id="circle" viewBox={vertexViewBox}>
            <circle
              cx={unitSvg(0.5)}
              cy={unitSvg(0.5)}
              r={unitSvg(0.25)}
              fill="none"
              stroke="var(--color)"
              stroke-width={unitSvg(0.08)}
            />
          </symbol>

          <symbol id="point" viewBox={vertexViewBox}>
            <circle
              cx={unitSvg(0.5)}
              cy={unitSvg(0.5)}
              r={unitSvg(0.18)}
              fill="var(--color)"
              stroke="none"
              stroke-width={unitSvg(0.08)}
            />
          </symbol>

          <symbol id="square" viewBox={vertexViewBox}>
            <rect
              x={unitSvg(0.25)}
              y={unitSvg(0.25)}
              width={unitSvg(0.5)}
              height={unitSvg(0.5)}
              fill="none"
              stroke="var(--color)"
              stroke-width={unitSvg(0.08)}
            />
          </symbol>

          <symbol id="triangle" viewBox={vertexViewBox}>
            <path
              d={`M 0 ${unitSvg(0.5)} L ${unitSvg(0.6)} ${unitSvg(0.5)} L ${unitSvg(0.3)} 0 z`}
              transform={`translate(${unitSvg(0.2)} ${unitSvg(0.2)})`}
              fill="none"
              stroke="var(--color)"
              stroke-width={unitSvg(0.08)}
            />
          </symbol>

          <symbol id="cross" viewBox={vertexViewBox}>
            <path
              d={`M 0 0 L ${unitSvg(0.5)} ${unitSvg(0.5)}
                M ${unitSvg(0.5)} 0 L 0 ${unitSvg(0.5)}`}
              transform={`translate(${unitSvg(0.25)} ${unitSvg(0.25)})`}
              stroke="var(--color)"
              stroke-width={unitSvg(0.08)}
            />
          </symbol>
        </defs>

        <For each={markers} key={(marker) => marker.vertex}>
          {(marker) => {
            const stone = () => stoneMap()?.[marker().y]?.[marker().x] ?? 0;
            const color = () =>
              this.props.color() ??
              (stoneMap() == null || stone() == 0
                ? "var(--shudan-board-foreground-color)"
                : stone() > 0
                  ? "var(--shudan-black-foreground-color)"
                  : stone() < 0
                    ? "var(--shudan-white-foreground-color)"
                    : "var(--shudan-board-foreground-color)");

            return (
              <use
                href={() => `#${marker().type}`}
                style={{ "--color": color }}
                x={() => unitSvg(marker().x)}
                y={() => unitSvg(marker().y)}
                width={unitSvg(1)}
                height={unitSvg(1)}
                filter={() =>
                  stoneMap() != null && stone() === 0
                    ? "url(#outline)"
                    : undefined
                }
              />
            );
          }}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, MarkerLayer);
