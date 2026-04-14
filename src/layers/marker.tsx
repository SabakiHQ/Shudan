import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { GobanContext } from "../goban.tsx";

/**
 * The shape of a marker placed on a vertex.
 */
export type MarkerType = "point" | "circle" | "cross" | "triangle" | "square";

/**
 * A marker placed on a vertex. Can be a shorthand `MarkerType` string, or an
 * object with optional `type` and `color` overrides.
 */
export type Marker =
  | MarkerType
  | {
      type?: MarkerType;
      color?: string;
    };

/**
 * A layer that renders shape markers (circles, crosses, triangles, etc.) on
 * specified vertices.
 */
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

          <symbol id="circle" viewBox="0 0 1 1">
            <circle
              cx={0.5}
              cy={0.5}
              r={0.25}
              fill="none"
              stroke="var(--color)"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="point" viewBox="0 0 1 1">
            <circle
              cx={0.5}
              cy={0.5}
              r={0.18}
              fill="var(--color)"
              stroke="none"
            />
          </symbol>

          <symbol id="square" viewBox="0 0 1 1">
            <rect
              x={0.25}
              y={0.25}
              width={0.5}
              height={0.5}
              fill="none"
              stroke="var(--color)"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="triangle" viewBox="0 0 1 1">
            <path
              d="M 0 0.5 L 0.6 0.5 L 0.3 0 z"
              transform="translate(0.2 0.2)"
              fill="none"
              stroke="var(--color)"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="cross" viewBox="0 0 1 1">
            <path
              d="M 0 0 L 0.5 0.5 M 0.5 0 L 0 0.5"
              transform="translate(0.25 0.25)"
              stroke="var(--color)"
              stroke-width={0.08}
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
                x={() => unit(marker().x)}
                y={() => unit(height() - 1 - marker().y)}
                width={unit()}
                height={unit()}
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
