import { defineComponents, For, prop, useMemo } from "sinho";
import { Layer, unit } from "./layer.tsx";
import { Vertex, VertexRange } from "../vertex.ts";
import { COMPONENT_PREFIX } from "../constants.ts";
import { useGobanContext } from "../goban.tsx";

/**
 * A text label placed on a vertex. Can be a plain string, or an object with
 * optional `text`, `color`, and `tooltip` overrides.
 */
export type Label =
  | string
  | {
      text?: string;
      color?: string;
      tooltip?: string;
    };

/**
 * A layer that renders text labels on specified vertices or vertex ranges.
 *
 * If used as a child of a `StoneLayer`, it can automatically adjust the text
 * color and background according to the underlying stones.
 */
export class LabelLayer extends Layer({
  /**
   * The text color of the labels.
   *
   * If set to `undefined`, it uses the default colors according to the
   * `stoneMap` of an underlying stone layer if available, or the board
   * foreground color.
   */
  color: prop<string>(undefined, { attribute: String }),
  /**
   * The background of the labels.
   *
   * If set to `undefined`, it uses the board background on empty vertices, and
   * is transparent on occupied vertices according to the `stoneMap` of an
   * underlying stone layer if available.
   */
  background: prop<string>(undefined, { attribute: String }),
  /**
   * A map of vertex ranges and their labels.
   */
  labels: prop<Record<VertexRange, Label>>({}, { attribute: JSON.parse }),
}) {
  renderContent() {
    const { stones, height } = useGobanContext();
    const stoneMap = useMemo(() =>
      VertexRange.index(stones() ?? {}),
    );

    const labels = useMemo(() =>
      Object.entries(VertexRange.index(this.props.labels())).map(([vertex, label]) => {
        const [x, y] = Vertex.parse(vertex as Vertex);
        const _label = typeof label === "string" ? { text: label } : label;

        return { x, y, vertex: vertex as Vertex, ..._label };
      }),
    );

    return (
      <>
        <For each={labels} key={(label) => label.vertex}>
          {(label) => {
            const stone = () => stoneMap()?.[label().vertex] ?? 0;
            const color = () =>
              label().color ??
              this.props.color() ??
              (stones() == null || stone() === 0
                ? "var(--shudan-board-foreground-color)"
                : stone() > 0
                  ? "var(--shudan-black-foreground-color)"
                  : stone() < 0
                    ? "var(--shudan-white-foreground-color)"
                    : "var(--shudan-board-foreground-color)");

            return (
              <foreignObject
                x={() => unit(label().x)}
                y={() => unit(height() - 1 - label().y)}
                width={unit()}
                height={unit()}
              >
                <div
                  part="label"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    maxWidth: unit(),
                    maxHeight: unit(),
                    overflow: "hidden",
                    transform: "translate(-50%, -50%)",
                    background: () =>
                      stones() != null &&
                      stone() === 0 &&
                      this.props.background() === undefined
                        ? "var(--shudan-board-background)"
                        : this.props.background(),
                    color,
                    fontSize: () =>
                      (label().text?.length ?? 0) >= 3 ||
                      label().text?.includes("\n")
                        ? unit(0.35)
                        : unit(1 / 1.7),
                    lineHeight: () =>
                      label().text?.includes("\n")
                        ? `${unit(0.4)}px`
                        : `${unit(1 / 1.7)}px`,
                    textAlign: "center",
                    whiteSpace: "pre",
                    textOverflow: "ellipsis",
                    pointerEvents: "auto",
                  }}
                  title={() => label().tooltip ?? label().text}
                >
                  {() => label().text}
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
