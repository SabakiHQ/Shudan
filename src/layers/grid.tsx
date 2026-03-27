import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { getHoshis } from "../utils.ts";
import { parseVertex, Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";

export class GridLayer extends Layer("grid-layer", {
  hoshis: prop<Vertex[]>(undefined, { attribute: JSON.parse }),
}) {
  renderSvg() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);
    const rangeX = useContext(GobanContext.rangeX);
    const rangeY = useContext(GobanContext.rangeY);

    const xs = useMemo(() =>
      [...Array(width())].map((_, i) => i).slice(rangeX()[0], rangeX()[1] + 1),
    );
    const ys = useMemo(() =>
      [...Array(height())].map((_, i) => i).slice(rangeY()[0], rangeY()[1] + 1),
    );
    const hoshis = useMemo(() =>
      (this.props.hoshis() ?? getHoshis(width(), height()))
        .map((v) => parseVertex(v))
        .filter(
          ([x, y]) =>
            Math.max(rangeX()[0], 0) <= x &&
            x <= Math.min(rangeX()[1], width() - 1) &&
            Math.max(rangeY()[0], 0) <= y &&
            y <= Math.min(rangeY()[1], height() - 1),
        ),
    );

    return (
      <>
        <For each={ys}>
          {(y) => (
            <line
              stroke-width={0.04}
              stroke-linecap="square"
              stroke="var(--shudan-board-foreground-color)"
              x1={() => (xs()[0] === 0 ? 0.5 : xs()[0])}
              y1={() => y() + 0.5}
              x2={() =>
                xs().at(-1)! === width() - 1 ? width() - 0.5 : xs().at(-1)! + 1
              }
              y2={() => y() + 0.5}
            />
          )}
        </For>

        <For each={xs}>
          {(x) => (
            <line
              stroke-width={0.04}
              stroke-linecap="square"
              stroke="var(--shudan-board-foreground-color)"
              x1={() => x() + 0.5}
              y1={() => (ys()[0] === 0 ? 0.5 : ys()[0])}
              x2={() => x() + 0.5}
              y2={() =>
                ys().at(-1)! === height() - 1
                  ? height() - 0.5
                  : ys().at(-1)! + 1
              }
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
              fill="var(--shudan-board-foreground-color)"
            />
          )}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, GridLayer);
