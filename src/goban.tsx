import {
  Component,
  createContext,
  css,
  defineComponents,
  event,
  If,
  prop,
  Style,
  useContext,
  useEffect,
  useMemo,
} from "sinho";
import { COMPONENT_PREFIX } from "./constants.ts";
import { Coord } from "./coord.tsx";
import { unit } from "./utils.ts";
import { Vertex } from "./vertex.ts";
import { VertexEvent, VertexPointerEvent } from "./events.ts";

export const GobanContext = {
  width: createContext<number>(19),
  height: createContext<number>(19),
  vertexSize: createContext<string | number>("1.7em"),
  interactive: createContext<boolean>(false),
  hover: createContext<boolean>(false),
  coords: createContext<boolean>(false),
  coordX: createContext<(x: number) => string>(),
  coordY: createContext<(y: number) => string>(),
  rangeX: createContext<[number, number]>([0, Infinity]),
  rangeY: createContext<[number, number]>([0, Infinity]),
  focused: createContext<boolean>(false),
  focusedVertex: createContext<Vertex>(),

  stones: createContext<Record<string, number>>(),
};

export class Goban extends Component({
  width: prop(GobanContext.width, { attribute: Number }),
  height: prop(GobanContext.height, { attribute: Number }),
  vertexSize: prop(GobanContext.vertexSize, { attribute: String }),
  interactive: prop(GobanContext.interactive, { attribute: () => true }),
  hover: prop(GobanContext.hover, { attribute: () => true }),
  coords: prop(GobanContext.coords, { attribute: () => true }),
  coordX: prop(GobanContext.coordX),
  coordY: prop(GobanContext.coordY),
  rangeX: prop<[number, number]>(GobanContext.rangeX, {
    attribute: JSON.parse,
  }),
  rangeY: prop<[number, number]>(GobanContext.rangeY, {
    attribute: JSON.parse,
  }),
  _focused: prop(GobanContext.focused),
  focusedVertex: prop(GobanContext.focusedVertex, { attribute: Vertex }),

  onFocusedVertexChange: event(VertexEvent),
  onVertexClick: event(VertexPointerEvent),
  onVertexPointerUp: event(VertexPointerEvent),
  onVertexPointerDown: event(VertexPointerEvent),
  onVertexPointerMove: event(VertexPointerEvent),
}) {
  render() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);
    const _vertexSize = useContext(GobanContext.vertexSize);
    const vertexSize = useMemo(() =>
      /^\d+$/.test(_vertexSize().toString())
        ? _vertexSize() + "px"
        : _vertexSize().toString(),
    );

    const coords = useContext(GobanContext.coords);
    const coordX = (x: number) =>
      this.props.coordX()?.(x) ?? "ABCDEFGHJKLMNOPQRSTUVWXYZ"[x % 25];
    const coordY = (y: number) =>
      this.props.coordY()?.(y) ?? (height() - y).toString();

    const rangeX = useContext(GobanContext.rangeX);
    const rangeY = useContext(GobanContext.rangeY);
    const viewportWidth = () =>
      Math.min(rangeX()[1] - rangeX()[0] + 1, width());
    const viewportHeight = () =>
      Math.min(rangeY()[1] - rangeY()[0] + 1, height());

    useEffect(() => {
      // Set tabindex based on interactive prop

      if (!this.props.interactive()) {
        this.removeAttribute("tabindex");
      } else if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    });

    useEffect(() => {
      // Auto focus .layout

      this.addEventListener("focus", () => {
        this.shadowRoot!.querySelector<HTMLElement>(".layout")!.focus();
      });
    });

    useEffect(() => {
      // Clear focused vertex

      this.focusedVertex = undefined;
    }, [rangeX, rangeY, width, height, this.props.interactive]);

    useEffect(() => {
      // Emit focused vertex change event

      if (this.props.focusedVertex()) {
        this.events.onFocusedVertexChange(this.props.focusedVertex()!);
      }
    });

    function getVertexFromEvent(evt: PointerEvent): Vertex {
      const viewportElement = evt.currentTarget as HTMLElement;
      const rect = viewportElement.getBoundingClientRect();
      const [offsetX, offsetY] = [
        evt.clientX - rect.left,
        evt.clientY - rect.top,
      ];
      const vertexSize = rect.width / viewportWidth();
      const [x, y] = [
        (offsetX - vertexSize / 2) / vertexSize + Math.max(rangeX()[0], 0),
        (offsetY - vertexSize / 2) / vertexSize + Math.max(rangeY()[0], 0),
      ].map(Math.round);

      return Vertex(
        Math.max(0, rangeX()[0], Math.min(width() - 1, rangeX()[1], x)),
        Math.max(0, rangeY()[0], Math.min(height() - 1, rangeY()[1], y)),
      );
    }

    return (
      <>
        <div
          class="layout"
          tabIndex={() => (this.props.interactive() ? 0 : undefined)}
          onfocus={() => (this._focused = true)}
          onblur={() => (this._focused = false)}
          onkeydown={(evt) => {
            if (
              !this.interactive ||
              ![
                "ArrowLeft",
                "ArrowUp",
                "ArrowRight",
                "ArrowDown",
                "Escape",
              ].includes(evt.code)
            ) {
              return;
            }

            evt.preventDefault();

            if (evt.code === "Escape") {
              this.focusedVertex = undefined;
              return;
            }

            if (this.focusedVertex == null) {
              this.focusedVertex = Vertex(
                Math.max(0, rangeX()[0]),
                Math.max(0, rangeY()[0]),
              );
              return;
            }

            const [x, y] = Vertex.parse(this.focusedVertex);
            const newPosition =
              evt.code === "ArrowLeft"
                ? [x - 1, y]
                : evt.code === "ArrowUp"
                  ? [x, y - 1]
                  : evt.code === "ArrowRight"
                    ? [x + 1, y]
                    : [x, y + 1];

            this.focusedVertex = Vertex(
              Math.max(
                0,
                rangeX()[0],
                Math.min(width() - 1, rangeX()[1], newPosition[0]),
              ),
              Math.max(
                0,
                rangeY()[0],
                Math.min(height() - 1, rangeY()[1], newPosition[1]),
              ),
            );
          }}
        >
          <div
            class="viewport"
            onclick={(evt) =>
              this.events.onVertexClick({
                originalEvent: evt,
                vertex: getVertexFromEvent(evt),
              })
            }
            onpointerup={(evt) =>
              this.events.onVertexPointerUp({
                originalEvent: evt,
                vertex: getVertexFromEvent(evt),
              })
            }
            onpointerdown={(evt) =>
              this.events.onVertexPointerDown({
                originalEvent: evt,
                vertex: getVertexFromEvent(evt),
              })
            }
            onpointermove={(evt) => {
              const vertex = getVertexFromEvent(evt);

              if (this.props.hover() && this.focusedVertex !== vertex) {
                if (!this._focused) {
                  this.focus();
                }

                this.focusedVertex = vertex;
              }

              this.events.onVertexPointerMove({
                originalEvent: evt,
                vertex,
              });
            }}
          >
            <slot />
          </div>

          <If condition={coords}>
            <Coord size={width} range={rangeX} label={coordX} position="top" />
            <Coord
              size={height}
              range={rangeY}
              label={coordY}
              position="left"
            />
            <Coord
              size={height}
              range={rangeY}
              label={coordY}
              position="right"
            />
            <Coord
              size={width}
              range={rangeX}
              label={coordX}
              position="bottom"
            />
          </If>
        </div>

        <div class="gradient" />

        <Style>{css`
          :host {
            --_shudan-vertex-size: ${vertexSize};
            --_shudan-width: ${width};
            --_shudan-height: ${height};
            --_shudan-viewport-width: ${viewportWidth};
            --_shudan-viewport-height: ${viewportHeight};
          }
        `}</Style>

        <Style>{css`
          :host {
            --shudan-board-border-radius: ${unit(0.3)};
            --shudan-board-background: var(--shudan-board-background-color);
            --shudan-board-background-color: #f1b458;
            --shudan-board-foreground-color: #5e2e0c;
            --shudan-black-foreground-color: #eee;
            --shudan-white-foreground-color: #222;

            position: relative;
            display: inline-block;
          }

          .gradient {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            background:
              linear-gradient(to bottom, rgba(234, 220, 192, 0.1), transparent),
              linear-gradient(to bottom, transparent, rgba(23, 10, 2, 0.05));
            border-radius: var(--shudan-board-border-radius);
            pointer-events: none;
          }

          .layout {
            display: grid;
            grid: auto 1fr auto / auto 1fr auto;
            grid-template-areas:
              ". top ."
              "left center right"
              ". bottom .";
            gap: ${unit(0.1)};
            border-radius: var(--shudan-board-border-radius);
            padding: ${unit(0.35)};
            background: var(--shudan-board-background);
            color: var(--shudan-board-foreground-color);
            overflow: hidden;
          }
          :host(:focus) .layout {
            outline: 2px solid var(--shudan-board-foreground-color);
          }

          .viewport {
            grid-area: center;
            position: relative;
            width: ${unit("var(--_shudan-viewport-width)")};
            height: ${unit("var(--_shudan-viewport-height)")};
          }

          .viewport > *,
          .viewport > ::slotted(*) {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, Goban);
