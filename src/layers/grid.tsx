import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { getHoshis, unitSvg } from "../utils.ts";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";

export class GridLayer extends Layer({
  hoshis: prop<Vertex[]>(undefined, { attribute: JSON.parse }),
}) {
  renderSvg() {
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
      <>
        <For each={ys}>
          {(y) => (
            <line
              stroke-width={unitSvg(0.04)}
              stroke-linecap="square"
              stroke="var(--shudan-board-foreground-color)"
              x1={() => unitSvg(0.5)}
              y1={() => unitSvg(y() + 0.5)}
              x2={() => unitSvg(width() - 0.5)}
              y2={() => unitSvg(y() + 0.5)}
            />
          )}
        </For>

        <For each={xs}>
          {(x) => (
            <line
              stroke-width={unitSvg(0.04)}
              stroke-linecap="square"
              stroke="var(--shudan-board-foreground-color)"
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
              fill="var(--shudan-board-foreground-color)"
            />
          )}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, GridLayer);
