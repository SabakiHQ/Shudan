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
              <foreignObject
                x={() => unitSvg(label().x)}
                y={() => unitSvg(label().y)}
                width={unitSvg(1)}
                height={unitSvg(1)}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    maxWidth: unitSvg(1),
                    maxHeight: unitSvg(1),
                    backgroundColor: () =>
                      stoneMap() != null && stone() === 0
                        ? "var(--shudan-board-background-color)"
                        : undefined,
                    overflow: "hidden",
                    transform: "translate(-50%, -50%)",
                    color,
                    fontSize: () =>
                      label().label.length >= 3 || label().label.includes("\n")
                        ? unitSvg(0.3)
                        : unitSvg(0.6),
                    lineHeight: () =>
                      label().label.includes("\n") ? `${unitSvg(0.33)}px` : 1,
                    textAlign: "center",
                    whiteSpace: "pre",
                    textOverflow: "ellipsis",
                  }}
                >
                  {() => label().label}
                </div>
              </foreignObject>
            );
          }}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, LabelLayer);
