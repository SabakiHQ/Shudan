import { defineComponents, For, prop, useContext } from "sinho";
import { Layer, unitSvg } from "./layer.tsx";
import { GobanContext, Vertex } from "../main.ts";
import { COMPONENT_PREFIX } from "../constants.ts";

export class LineLayer extends Layer({
  /**
   * The color of the lines. Defaults to the board foreground color.
   */
  color: prop<string>("var(--shudan-board-foreground-color)", {
    attribute: String,
  }),
  /**
   * The width of the lines as a fraction of the vertex size.
   */
  width: prop<number>(0.11, { attribute: Number }),
  /**
   * The list of lines, each defined by a pair of start and end vertices.
   */
  lines: prop<[start: Vertex, end: Vertex][]>([], { attribute: JSON.parse }),
}) {
  renderContent() {
    const height = useContext(GobanContext.height);

    return (
      <g
        fill="none"
        stroke={this.props.color}
        stroke-width={() => unitSvg(this.props.width())}
      >
        <For each={this.props.lines}>
          {(line) => {
            const [start, end] = [0, 1].map((i) => () => line()[i]);
            const [x1, y1] = [0, 1].map((i) => () => Vertex.parse(start())[i]);
            const [x2, y2] = [0, 1].map((i) => () => Vertex.parse(end())[i]);
            const [dx, dy] = [0, 1].map(
              (i) => () => (i === 0 ? x2() - x1() : y1() - y2()),
            );
            const angle = () => (Math.atan2(dy(), dx()) * 180) / Math.PI;
            const length = () =>
              Math.sqrt(unitSvg(dx()) ** 2 + unitSvg(dy()) ** 2);

            return (
              <path
                d={() =>
                  `M ${unitSvg(x1() + 0.5)} ${unitSvg(height() - y1() - 0.5)} h ${length()}`
                }
                transform={() =>
                  `rotate(${angle()} ${unitSvg(x1() + 0.5)} ${unitSvg(height() - y1() - 0.5)})`
                }
              />
            );
          }}
        </For>
      </g>
    );
  }
}

defineComponents(COMPONENT_PREFIX, LineLayer);
