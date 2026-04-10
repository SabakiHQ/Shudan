import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { Layer, unitSvg } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { GobanContext } from "../goban.tsx";

export type MarkerType = "point" | "circle" | "cross" | "triangle" | "square";

export type Marker =
  | MarkerType
  | {
      type?: MarkerType;
      color?: string;
    };

export class MarkerLayer extends Layer({
  /**
   * The color of the markers. If set to `undefined`, it uses the default colors
   * according to the `stoneMap` of an underlying stone layer if available, or
   * the board foreground color.
   */
  color: prop<string>(undefined, { attribute: String }),
  /**
   * A mapping from vertices to markers.
   */
  markers: prop<Record<Vertex, Marker>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
    const vertexViewBox = `0 0 ${unitSvg()} ${unitSvg()}`;

    const stones = useContext(GobanContext.stones);
    const height = useContext(GobanContext.height);

    const markers = useMemo(() =>
      Object.entries(this.props.markers()).map(([vertex, marker]) => {
        const [x, y] = Vertex.parse(vertex as Vertex);
        const _marker = typeof marker === "string" ? { type: marker } : marker;

        return { x, y, vertex, ..._marker };
      }),
    );

    return (
      <>
        <defs>
          <filter
            id="outline"
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
            const stone = () => stones()?.[marker().vertex] ?? 0;
            const color = () =>
              marker().color ??
              this.props.color() ??
              (stones() == null || stone() == 0
                ? "var(--shudan-board-foreground-color)"
                : stone() > 0
                  ? "var(--shudan-black-foreground-color)"
                  : stone() < 0
                    ? "var(--shudan-white-foreground-color)"
                    : "var(--shudan-board-foreground-color)");

            return (
              <use
                href={() => `#${marker().type ?? "cross"}`}
                style={{ "--color": color }}
                x={() => unitSvg(marker().x)}
                y={() => unitSvg(height() - 1 - marker().y)}
                width={unitSvg()}
                height={unitSvg()}
                filter={() =>
                  stones() != null && stone() === 0
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
