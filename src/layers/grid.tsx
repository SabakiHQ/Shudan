import { defineComponents, For, prop, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { getHoshis } from "../utils.ts";
import { parseVertex, Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import type { Goban } from "../goban.tsx";

export class GridLayer extends Layer("grid-layer", {
  hoshis: prop<Vertex[]>(undefined, { attribute: JSON.parse }),
}) {
  renderSvg(goban: Goban) {
    const width = () => goban.width;
    const height = () => goban.height;
    const xs = useMemo(() => [...Array(width())].map((_, i) => i));
    const ys = useMemo(() => [...Array(height())].map((_, i) => i));
    const hoshis = useMemo(() =>
      (this.props.hoshis() ?? getHoshis(width(), height())).map((v) =>
        parseVertex(v),
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
              stroke-linecap="square"
              stroke="var(--shudan-board-foreground-color)"
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
              fill="var(--shudan-board-foreground-color)"
            />
          )}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, GridLayer);
