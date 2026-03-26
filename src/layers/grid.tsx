import { Component, css, defineComponents, For, Style, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { getHoshis, findGoban } from "../utils.ts";
import { parseVertex } from "../vertex.ts";

export class GridLayer extends Component("grid-layer", {}) {
  render() {
    const goban = findGoban(this)!;
    const width = () => goban.width;
    const height = () => goban.height;
    const xs = useMemo(() => [...Array(width())].map((_, i) => i));
    const ys = useMemo(() => [...Array(height())].map((_, i) => i));
    const hoshis = useMemo(() =>
      getHoshis(width(), height()).map((v) => parseVertex(v)),
    );

    return (
      <>
        <svg viewBox={() => `0 0 ${width()} ${height()}`}>
          <For each={ys}>
            {(y) => (
              <line
                stroke-width={0.04}
                x1="0.5"
                y1={() => y() + 0.5}
                x2={() => width() - 0.5}
                y2={() => y() + 0.5}
              />
            )}
          </For>

          <For each={xs}>
            {(x) => (
              <line
                stroke-width={0.04}
                x1={() => x() + 0.5}
                y1="0.5"
                x2={() => x() + 0.5}
                y2={() => height() - 0.5}
              />
            )}
          </For>

          <For each={hoshis}>
            {(hoshi) => (
              <circle
                cx={() => hoshi()[0] + 0.5}
                cy={() => hoshi()[1] + 0.5}
                r="0.12"
                stroke-width="0"
              />
            )}
          </For>
        </svg>

        <Style>{css`
          svg {
            stroke: var(--shudan-board-foreground-color);
            fill: var(--shudan-board-foreground-color);
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, GridLayer);
