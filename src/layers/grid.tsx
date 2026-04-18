import { defineComponents, For, prop, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Layer, unit } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * Returns the standard hoshi positions for a board of the given dimensions.
 */
export function getHoshis(width: number, height: number): Vertex[] {
  if (Math.min(width, height) <= 6) return [];

  let [nearX, nearY] = [width, height].map((x) => (x >= 13 ? 3 : 2));
  let [farX, farY] = [width - nearX - 1, height - nearY - 1];
  let [middleX, middleY] = [width, height].map((x) => (x - 1) / 2);

  let result = [
    Vertex(nearX, farY),
    Vertex(farX, nearY),
    Vertex(farX, farY),
    Vertex(nearX, nearY),
  ];

  if (width % 2 !== 0 && height % 2 !== 0 && width !== 7 && height !== 7)
    result.push(Vertex(middleX, middleY));
  if (width % 2 !== 0 && width !== 7)
    result.push(Vertex(middleX, nearY), Vertex(middleX, farY));
  if (height % 2 !== 0 && height !== 7)
    result.push(Vertex(nearX, middleY), Vertex(farX, middleY));

  return result;
}

/**
 * A layer that renders the grid lines and hoshi markers.
 */
export class GridLayer extends Layer({
  /**
   * The color of the grid lines and hoshi markers. Defaults to the board
   * foreground color.
   */
  color: prop<string>("var(--shudan-board-foreground-color)", {
    attribute: String,
  }),
  /**
   * The positions of the hoshi markers.
   */
  hoshis: prop<Vertex[]>(undefined, { attribute: JSON.parse }),
  /**
   * The stroke width of the grid lines as a fraction of the vertex size.
   * @default 0.04
   */
  strokeWidth: prop<number>(0.04, { attribute: Number }),
  /**
   * The stroke width of the border lines as a fraction of the vertex size.
   * @default 0.04
   */
  borderStrokeWidth: prop<number>(0.04, { attribute: Number }),
}) {
  renderContent() {
    const { width, height } = useGobanContext();

    const xs = useMemo(() => [...Array(width())].map((_, i) => i));
    const ys = useMemo(() => [...Array(height())].map((_, i) => i));
    const hoshis = useMemo(() =>
      (this.props.hoshis() ?? getHoshis(width(), height())).map((v) =>
        Vertex.parse(v),
      ),
    );

    return (
      <g stroke-linecap="square" stroke={this.props.color}>
        <For each={ys}>
          {(y, i) => (
            <line
              stroke-width={() =>
                unit(
                  i() === 0 || i() === ys().length - 1
                    ? this.props.borderStrokeWidth()
                    : this.props.strokeWidth(),
                )
              }
              x1={() => unit(0.5)}
              y1={() => unit(y() + 0.5)}
              x2={() => unit(width() - 0.5)}
              y2={() => unit(y() + 0.5)}
            />
          )}
        </For>

        <For each={xs}>
          {(x, i) => (
            <line
              stroke-width={() =>
                unit(
                  i() === 0 || i() === ys().length - 1
                    ? this.props.borderStrokeWidth()
                    : this.props.strokeWidth(),
                )
              }
              x1={() => unit(x() + 0.5)}
              y1={() => unit(0.5)}
              x2={() => unit(x() + 0.5)}
              y2={() => unit(height() - 0.5)}
            />
          )}
        </For>

        <For each={hoshis}>
          {(hoshi) => (
            <circle
              cx={() => unit(hoshi()[0] + 0.5)}
              cy={() => unit(height() - 1 - hoshi()[1] + 0.5)}
              r={unit(0.12)}
              stroke-width="0"
              fill={this.props.color}
            />
          )}
        </For>
      </g>
    );
  }
}

defineComponents(COMPONENT_PREFIX, GridLayer);
