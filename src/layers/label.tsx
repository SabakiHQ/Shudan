import { defineComponents, For, prop, useContext, useMemo } from "sinho";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";
import { COMPONENT_PREFIX } from "../constants.ts";

export class LabelLayer extends Layer({
  /**
   * The text color of the labels. If set to `undefined`, it uses the default
   * colors according to the `stoneMap` of an underlying stone layer if
   * available, or the board foreground color.
   */
  color: prop<string>(undefined, { attribute: String }),
  /**
   * A map of vertices and their labels.
   */
  labels: prop<Record<Vertex, string>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
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
                width={unitSvg()}
                height={unitSvg()}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    maxWidth: unitSvg(),
                    maxHeight: unitSvg(),
                    overflow: "hidden",
                    transform: "translate(-50%, -50%)",
                    background: () =>
                      stoneMap() != null && stone() === 0
                        ? "var(--shudan-board-background)"
                        : undefined,
                    color,
                    fontSize: () =>
                      label().label.length >= 3 || label().label.includes("\n")
                        ? unitSvg(0.35)
                        : unitSvg(1 / 1.7),
                    lineHeight: () =>
                      label().label.includes("\n") ? `${unitSvg(0.4)}px` : undefined,
                    textAlign: "center",
                    whiteSpace: "pre",
                    textOverflow: "ellipsis",
                    pointerEvents: "auto",
                  }}
                  title={() => label().label}
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
