import { defineComponents, For, If, prop, useMemo, type JSX } from "sinho";
import { Layer } from "./layer.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { unitSvg } from "../utils.ts";

const borderRadius = unitSvg(0.2);

export class PaintLayer extends Layer({
  paintedVertices: prop<Vertex[]>([], { attribute: JSON.parse }),
  color: prop<string>("rgba(0, 0, 0, .5)", { attribute: String }),
}) {
  renderContent() {
    const verticesSet = useMemo(() => new Set(this.props.paintedVertices()));
    const bridgeVertices = useMemo(
      () =>
        new Set(
          this.props.paintedVertices().flatMap((vertex) => {
            const [x, y] = Vertex.parse(vertex);

            return [
              verticesSet().has(Vertex(x - 1, y)) &&
              verticesSet().has(Vertex(x, y - 1))
                ? Vertex(x - 1, y - 1)
                : null,
              verticesSet().has(Vertex(x - 1, y)) &&
              verticesSet().has(Vertex(x, y + 1))
                ? Vertex(x - 1, y + 1)
                : null,
              verticesSet().has(Vertex(x + 1, y)) &&
              verticesSet().has(Vertex(x, y - 1))
                ? Vertex(x + 1, y - 1)
                : null,
              verticesSet().has(Vertex(x + 1, y)) &&
              verticesSet().has(Vertex(x, y + 1))
                ? Vertex(x + 1, y + 1)
                : null,
            ].filter((v): v is Vertex => v != null && !verticesSet().has(v));
          }),
        ),
    );

    return (
      <>
        <defs>
          <mask id="mask">
            <rect
              width={unitSvg(1)}
              height={unitSvg(1)}
              fill="white"
              stroke="none"
            />
          </mask>
          <mask id="inverted">
            <rect
              width={unitSvg(1)}
              height={unitSvg(1)}
              fill="white"
              stroke="none"
            />
            <rect
              rx={borderRadius}
              ry={borderRadius}
              width={unitSvg(1)}
              height={unitSvg(1)}
              fill="black"
              stroke="none"
            />
          </mask>
        </defs>

        <g>
          <For each={this.props.paintedVertices} key={(vertex) => vertex}>
            {(vertex) => {
              const [x, y] = Vertex.parse(vertex());
              const left = () =>
                verticesSet().has(Vertex(x - 1, y)) ? unitSvg(-1) : 0;
              const top = () =>
                verticesSet().has(Vertex(x, y - 1)) ? unitSvg(-1) : 0;
              const right = () =>
                verticesSet().has(Vertex(x + 1, y)) ? unitSvg(2) : unitSvg(1);
              const bottom = () =>
                verticesSet().has(Vertex(x, y + 1)) ? unitSvg(2) : unitSvg(1);

              return (
                <rect
                  rx={borderRadius}
                  ry={borderRadius}
                  x={left}
                  y={top}
                  width={() => right() - left()}
                  height={() => bottom() - top()}
                  fill={this.props.color}
                  transform={() => `translate(${unitSvg(x)} ${unitSvg(y)})`}
                  mask="url(#mask)"
                />
              );
            }}
          </For>
        </g>

        <g>
          <For each={() => [...bridgeVertices()]} key={(vertex) => vertex}>
            {(vertex) => {
              const [x, y] = Vertex.parse(vertex());
              const topLeft = () =>
                [Vertex(x - 1, y), Vertex(x, y - 1)].every((v) =>
                  verticesSet().has(v),
                );
              const topRight = () =>
                [Vertex(x + 1, y), Vertex(x, y - 1)].every((v) =>
                  verticesSet().has(v),
                );
              const bottomRight = () =>
                [Vertex(x + 1, y), Vertex(x, y + 1)].every((v) =>
                  verticesSet().has(v),
                );
              const bottomLeft = () =>
                [Vertex(x - 1, y), Vertex(x, y + 1)].every((v) =>
                  verticesSet().has(v),
                );
              const commonProps: JSX.IntrinsicElements["rect"] = {
                width: unitSvg(0.5),
                height: unitSvg(0.5),
                fill: this.props.color,
                transform: () => `translate(${unitSvg(x)} ${unitSvg(y)})`,
                mask: "url(#inverted)",
              };

              return (
                <>
                  <If condition={topLeft}>
                    <rect x="0" y="0" {...commonProps} />
                  </If>
                  <If condition={topRight}>
                    <rect x={unitSvg(0.5)} y="0" {...commonProps} />
                  </If>
                  <If condition={bottomRight}>
                    <rect x={unitSvg(0.5)} y={unitSvg(0.5)} {...commonProps} />
                  </If>
                  <If condition={bottomLeft}>
                    <rect x="0" y={unitSvg(0.5)} {...commonProps} />
                  </If>
                </>
              );
            }}
          </For>
        </g>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, PaintLayer);
