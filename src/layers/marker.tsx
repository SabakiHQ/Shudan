import { defineComponents, For, prop, useMemo } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex, VertexRange } from "../vertex.ts";
import { useGobanContext } from "../goban.tsx";

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
 * specified vertices or vertex ranges.
 *
 * As child of a `StoneLayer`, it can automatically adjust the color and outline
 * according to the underlying stones.
 */
export class MarkerLayer extends Layer({
  /**
   * The color of the markers.
   *
   * If set to `undefined`, it uses the default colors according to the
   * `stoneMap` of an underlying stone layer if available, or the board
   * foreground color.
   */
  color: prop<string>(undefined, { attribute: String }),
  /**
   * The outline color of the markers.
   *
   * If set to `undefined`, it uses the board background color on empty
   * vertices, and is transparent on occupied vertices according to the
   * `stoneMap` of an underlying stone layer if available.
   */
  outline: prop<string>(undefined, { attribute: String }),
  /**
   * A mapping from vertex ranges to markers.
   */
  markers: prop<Record<VertexRange, Marker>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
    const { stones, height } = useGobanContext();
    const outline = () =>
      this.props.outline() ?? "var(--shudan-board-background-color)";
    const stoneMap = useMemo(() =>
      Object.fromEntries(VertexRange.entries(stones() ?? {})),
    );

    const markers = useMemo(() =>
      VertexRange.entries(this.props.markers()).map(([vertex, marker]) => {
        const [x, y] = Vertex.parse(vertex as Vertex);
        const _marker = typeof marker === "string" ? { type: marker } : marker;

        return { x, y, vertex: vertex as Vertex, ..._marker };
      }),
    );

    return (
      <>
        <defs>
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
              flood-color={outline}
            />
            <feDropShadow
              dx="0"
              dy={unit(-0.05)}
              stdDeviation={0}
              flood-color={outline}
            />
            <feDropShadow
              dx={unit(0.05)}
              dy="0"
              stdDeviation={0}
              flood-color={outline}
            />
            <feDropShadow
              dx={unit(-0.05)}
              dy="0"
              stdDeviation={0}
              flood-color={outline}
            />
          </filter>

          <symbol id="shudan-circle" viewBox="0 0 1 1">
            <circle
              cx={0.5}
              cy={0.5}
              r={0.25}
              fill="none"
              stroke="currentColor"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="shudan-point" viewBox="0 0 1 1">
            <circle
              cx={0.5}
              cy={0.5}
              r={0.18}
              fill="currentColor"
              stroke="none"
            />
          </symbol>

          <symbol id="shudan-square" viewBox="0 0 1 1">
            <rect
              x={0.25}
              y={0.25}
              width={0.5}
              height={0.5}
              fill="none"
              stroke="currentColor"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="shudan-triangle" viewBox="0 0 1 1">
            <path
              d="M 0 0.5 L 0.6 0.5 L 0.3 0 z"
              transform="translate(0.2 0.2)"
              fill="none"
              stroke="currentColor"
              stroke-width={0.08}
            />
          </symbol>

          <symbol id="shudan-cross" viewBox="0 0 1 1">
            <path
              d="M 0 0 L 0.5 0.5 M 0.5 0 L 0 0.5"
              transform="translate(0.25 0.25)"
              stroke="currentColor"
              stroke-width={0.08}
            />
          </symbol>
        </defs>

        <For each={markers} key={(marker) => marker.vertex}>
          {(marker) => {
            const stone = () => stoneMap()?.[marker().vertex] ?? 0;
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
                href={() => `#shudan-${marker().type ?? "cross"}`}
                style={{ color }}
                x={() => unit(marker().x)}
                y={() => unit(height() - 1 - marker().y)}
                width={unit()}
                height={unit()}
                filter={() =>
                  this.props.outline() != null ||
                  (stones() != null && stone() === 0)
                    ? "url(#shudan-outline)"
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
