import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { unitSvg } from "./layer.tsx";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";

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
   */
  strokeWidth: prop<number>(0.04, { attribute: Number }),
  /**
   * The stroke width of the border lines as a fraction of the vertex size.
   */
  borderStrokeWidth: prop<number>(0.04, { attribute: Number }),
}) {
  renderContent() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);

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
                unitSvg(
                  i() === 0 || i() === ys().length - 1
                    ? this.props.borderStrokeWidth()
                    : this.props.strokeWidth(),
                )
              }
              x1={() => unitSvg(0.5)}
              y1={() => unitSvg(y() + 0.5)}
              x2={() => unitSvg(width() - 0.5)}
              y2={() => unitSvg(y() + 0.5)}
            />
          )}
        </For>

        <For each={xs}>
          {(x, i) => (
            <line
              stroke-width={() =>
                unitSvg(
                  i() === 0 || i() === ys().length - 1
                    ? this.props.borderStrokeWidth()
                    : this.props.strokeWidth(),
                )
              }
              x1={() => unitSvg(x() + 0.5)}
              y1={() => unitSvg(ys()[0] === 0 ? 0.5 : ys()[0])}
              x2={() => unitSvg(x() + 0.5)}
              y2={() =>
                ys().at(-1)! === height() - 1
                  ? unitSvg(height() - 0.5)
                  : unitSvg(ys().at(-1)! + 1)
              }
            />
          )}
        </For>

        <For each={hoshis}>
          {(hoshi) => (
            <circle
              cx={() => unitSvg(hoshi()[0] + 0.5)}
              cy={() => unitSvg(hoshi()[1] + 0.5)}
              r={unitSvg(0.12)}
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
