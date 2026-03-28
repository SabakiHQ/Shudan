import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";
import { COMPONENT_PREFIX } from "../constants.ts";

export class LabelLayer extends Layer({
  color: prop<string>(undefined, { attribute: String }),
  labels: prop<Record<Vertex, string>>({}, { attribute: JSON.parse }),
}) {
  renderSvg() {
    const stoneMap = useContext(GobanContext.stoneMap);

    const labels = useMemo(() =>
      Object.entries(this.props.labels()).map(([vertex, label]) => {
        const [x, y] = Vertex.parse(vertex as Vertex);
        return { x, y, vertex, label };
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
        </defs>

        <For each={labels} key={(label) => label.vertex}>
          {(label) => {
            const stone = () => stoneMap()?.[label().y]?.[label().x] ?? 0;
            const color = () =>
              this.props.color() ??
              (stoneMap() == null || stone() === 0
                ? "var(--shudan-board-foreground-color)"
                : stone() > 0
                  ? "var(--shudan-black-foreground-color)"
                  : stone() < 0
                    ? "var(--shudan-white-foreground-color)"
                    : "var(--shudan-board-foreground-color)");

            return (
              <text
                style={{ fontSize: unitSvg(0.6), whiteSpace: "wrap" }}
                fill={color}
                x={() => unitSvg(label().x + 0.5)}
                y={() => unitSvg(label().y + 0.5)}
                text-anchor="middle"
                alignment-baseline="central"
                textLength={unitSvg(1)}
                filter={() =>
                  stoneMap() != null && stone() === 0
                    ? "url(#outline)"
                    : undefined
                }
              >
                {() => label().label}
              </text>
            );
          }}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, LabelLayer);
