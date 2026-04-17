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
  type Context,
  type Signal,
} from "sinho";
import { COMPONENT_PREFIX, LAYER_PADDING } from "./constants.ts";
import { Coord } from "./coord.tsx";
import { unit } from "./layers/layer.tsx";
import { Vertex, xToLetter } from "./vertex.ts";
import { VertexEvent, VertexPointerEvent } from "./events.ts";
import { unitCSS } from "./utils.ts";

export { Vertex } from "./vertex.ts";

export const GobanContext = {
  /**
   * The width of the goban in vertices.
   */
  width: createContext<number>(19),
  /**
   * The height of the goban in vertices.
   */
  height: createContext<number>(19),
  /**
   * The size of a vertex. Can be specified as any CSS length unit, or as a pixel number.
   */
  vertexSize: createContext<string | number>("1.7em"),
  /**
   * Whether the goban should be focusable and emit events when vertices are clicked or hovered.
   */
  interactive: createContext<boolean>(false),
  /**
   * Whether coordinates should be displayed around the goban.
   */
  coords: createContext<boolean>(false),
  /**
   * A function that returns the label to be displayed for a given x coordinate. Only has an effect if `coords` is enabled.
   */
  coordX: createContext<(x: number) => string>((x) => xToLetter(x)),
  /**
   * A function that returns the label to be displayed for a given y coordinate. Only has an effect if `coords` is enabled.
   */
  coordY: createContext<(y: number) => string>((y) => (y + 1).toString()),
  /**
   * Cuts off the goban to only display the area from the given vertex to the `bottomRight` vertex, inclusive.
   */
  topLeft: createContext<Vertex | undefined>(undefined),
  /**
   * Cuts off the goban to only display the area from the `topLeft` vertex to the given vertex, inclusive.
   */
  bottomRight: createContext<Vertex | undefined>(undefined),
  /**
   * @ignore
   */
  focused: createContext<boolean>(false),
  /**
   * The currently focused vertex. Only has a value if `interactive` is enabled.
   */
  focusedVertex: createContext<Vertex>(),

  /**
   * A mapping from vertices to `-1` representing a white stone, or `1`
   * representing a black stone.
   */
  stones: createContext<Record<string, number>>(),
  /**
   * A list of stones that should be marked as dimmed. Has no effect on
   * empty vertices.
   */
  dimmedStones: createContext<Vertex[]>(),
  /**
   * An id referencing an SVG object that should be used to represent a
   * black stone.
   */
  blackStoneHref: createContext<string>(),
  /**
   * An id referencing an SVG object that should be used to represent a
   * white stone.
   */
  whiteStoneHref: createContext<string>(),
};

export function useGobanContext(): {
  readonly [K in keyof typeof GobanContext]: (typeof GobanContext)[K] extends Context<
    infer T
  >
    ? Signal<T>
    : never;
} {
  const result: any = {};

  for (const key of Object.keys(GobanContext)) {
    Object.defineProperty(result, key, {
      enumerable: true,
      get: () =>
        useContext(
          GobanContext[key as keyof typeof GobanContext] as Context<unknown>,
        ),
    });
  }

  return result;
}

export function useRanges() {
  const topLeftVertex = useContext(GobanContext.topLeft);
  const bottomRightVertex = useContext(GobanContext.bottomRight);

  const topLeftParsed = useMemo<[number, number]>(() =>
    topLeftVertex() != null ? Vertex.parse(topLeftVertex()!) : [0, Infinity],
  );
  const bottomRightParsed = useMemo<[number, number]>(() =>
    bottomRightVertex() != null
      ? Vertex.parse(bottomRightVertex()!)
      : [Infinity, 0],
  );

  const rangeX = (): [number, number] => [
    topLeftParsed()[0],
    bottomRightParsed()[0],
  ];
  const rangeY = (): [number, number] => [
    bottomRightParsed()[1],
    topLeftParsed()[1],
  ];

  return { rangeX, rangeY };
}

export class Goban extends Component({
  /**
   * The width of the goban in vertices.
   */
  width: prop(GobanContext.width, { attribute: Number }),
  /**
   * The height of the goban in vertices.
   */
  height: prop(GobanContext.height, { attribute: Number }),
  /**
   * The size of a vertex. Can be specified as any CSS length unit, or as a pixel number.
   */
  vertexSize: prop(GobanContext.vertexSize, { attribute: String }),
  /**
   * Whether the goban should be focusable and emit events when vertices are clicked or hovered.
   */
  interactive: prop(GobanContext.interactive, { attribute: () => true }),
  /**
   * Whether coordinates should be displayed around the goban.
   */
  coords: prop(GobanContext.coords, { attribute: () => true }),
  /**
   * A function that returns the label to be displayed for a given x coordinate. Only has an effect if `coords` is enabled.
   */
  coordX: prop(GobanContext.coordX),
  /**
   * A function that returns the label to be displayed for a given y coordinate. Only has an effect if `coords` is enabled.
   */
  coordY: prop(GobanContext.coordY),
  /**
   * Cuts off the goban to only display the area from the given vertex to the bottom-right vertex, inclusive.
   */
  topLeft: prop(GobanContext.topLeft, { attribute: Vertex }),
  /**
   * Cuts off the goban to only display the area from the top-left vertex to the given vertex, inclusive.
   */
  bottomRight: prop(GobanContext.bottomRight, { attribute: Vertex }),
  /**
   * @ignore
   */
  _focused: prop(GobanContext.focused),
  /**
   * The currently focused vertex. Only has a value if `interactive` is enabled.
   */
  focusedVertex: prop(GobanContext.focusedVertex, { attribute: Vertex }),

  /**
   * This event is emitted when the focused vertex changes. Only emitted if `interactive` is enabled.
   */
  onFocusedVertexChange: event(VertexEvent),
  /**
   * This event is emitted when a vertex is clicked. Only emitted if `interactive` is enabled.
   */
  onVertexClick: event(VertexPointerEvent),
  /**
   * This event is emitted when a pointer is released while hovering over a vertex. Only emitted if `interactive` is enabled.
   */
  onVertexPointerUp: event(VertexPointerEvent),
  /**
   * This event is emitted when a pointer is pressed down while hovering over a vertex. Only emitted if `interactive` is enabled.
   */
  onVertexPointerDown: event(VertexPointerEvent),
  /**
   * This event is emitted when a pointer moves while hovering over a vertex. Only emitted if `interactive` is enabled.
   */
  onVertexPointerMove: event(VertexPointerEvent),
  onVertexPointerEnter: event(VertexPointerEvent),
  onVertexPointerLeave: event(PointerEvent),
}) {
  render() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);
    const _vertexSize = useContext(GobanContext.vertexSize);
    const vertexSize = useMemo(() =>
      /^\d+(\.\d+)?|\.\d+$/.test(_vertexSize().toString())
        ? _vertexSize() + "px"
        : _vertexSize().toString(),
    );

    const coords = useContext(GobanContext.coords);
    const coordX = useContext(GobanContext.coordX);
    const coordY = useContext(GobanContext.coordY);

    const { rangeX, rangeY } = useRanges();
    const viewportWidth = () =>
      Math.min(rangeX()[1] - rangeX()[0] + 1, width());
    const viewportHeight = () =>
      Math.min(rangeY()[1] - rangeY()[0] + 1, height());

    const layerLeft = () => -Math.max(rangeX()[0], 0);
    const layerTop = () => -Math.max(height() - 1 - rangeY()[1], 0);

    useEffect(() => {
      // Set tabindex based on interactive prop

      if (!this.props.interactive()) {
        this.removeAttribute("tabindex");
      } else if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    });

    useEffect(() => {
      // Host events

      this.addEventListener("focus", () => {
        this._focused = true;
      });

      this.addEventListener("blur", () => {
        this._focused = false;
      });

      this.addEventListener("keydown", (evt) => {
        // Keyboard navigation

        if (
          !this.interactive ||
          ![
            "ArrowLeft",
            "ArrowUp",
            "ArrowRight",
            "ArrowDown",
            "Escape",
            "Enter",
            "Space",
          ].includes(evt.code)
        ) {
          return;
        }

        evt.preventDefault();

        if (["Enter", "Space"].includes(evt.code)) {
          if (this.focusedVertex != null) {
            this.events.onVertexClick({
              originalEvent: new PointerEvent("click"),
              vertex: this.focusedVertex,
            });
          }
          return;
        } else if (evt.code === "Escape") {
          if (this.focusedVertex != null) {
            this.focusedVertex = undefined;
          } else {
            this.blur();
          }
          return;
        }

        const newPosition =
          this.focusedVertex == null
            ? ([
                Math.max(0, rangeX()[0]),
                Math.min(height() - 1, rangeY()[1]),
              ] as const)
            : (() => {
                const [x, y] = Vertex.parse(this.focusedVertex);
                return (
                  (
                    {
                      ArrowLeft: [x - 1, y],
                      ArrowUp: [x, y + 1],
                      ArrowRight: [x + 1, y],
                      ArrowDown: [x, y - 1],
                    } as const
                  )[evt.code] ?? [x, y]
                );
              })();

        const focusedVertex = Vertex(
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

        const prevented = this.events.onFocusedVertexChange(focusedVertex);
        if (prevented) this.focusedVertex = focusedVertex;
      });
    });

    useEffect(() => {
      // Clear focused vertex

      this.focusedVertex = undefined;
    }, [rangeX, rangeY, width, height, this.props.interactive]);

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
        height() -
          1 -
          (offsetY - vertexSize / 2) / vertexSize -
          Math.max(height() - 1 - rangeY()[1], 0),
      ].map(Math.round);

      return Vertex(
        Math.max(0, rangeX()[0], Math.min(width() - 1, rangeX()[1], x)),
        Math.max(0, rangeY()[0], Math.min(height() - 1, rangeY()[1], y)),
      );
    }

    return (
      <>
        <div class="layout">
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
            onpointerenter={(evt) =>
              this.events.onVertexPointerEnter({
                originalEvent: evt,
                vertex: getVertexFromEvent(evt),
              })
            }
            onpointermove={(evt) =>
              this.events.onVertexPointerMove({
                originalEvent: evt,
                vertex: getVertexFromEvent(evt),
              })
            }
            onpointerleave={(evt) => {
              this.events.onVertexPointerLeave({ ...evt });
            }}
          >
            <svg
              viewBox={() =>
                `${unit(-LAYER_PADDING)} ${unit(-LAYER_PADDING)} ` +
                `${unit(viewportWidth() + 2 * LAYER_PADDING)} ` +
                `${unit(viewportHeight() + 2 * LAYER_PADDING)}`
              }
            >
              <foreignObject
                x={unit(-LAYER_PADDING)}
                y={unit(-LAYER_PADDING)}
                width={() => unit(viewportWidth() + 2 * LAYER_PADDING)}
                height={() => unit(viewportHeight() + 2 * LAYER_PADDING)}
              >
                <slot />
              </foreignObject>
            </svg>
          </div>

          <If condition={coords}>
            <Coord
              size={width}
              range={() => rangeX()}
              label={(x) => coordX()(x)}
              position="top"
            />
            <Coord
              size={height}
              range={() => rangeY()}
              label={(y) => coordY()(y)}
              position="left"
            />
            <Coord
              size={height}
              range={() => rangeY()}
              label={(y) => coordY()(y)}
              position="right"
            />
            <Coord
              size={width}
              range={() => rangeX()}
              label={(x) => coordX()(x)}
              position="bottom"
            />
          </If>
        </div>

        <div class="gradient" />

        <Style>{css`
          :host {
            --_shudan-vertex-size: ${vertexSize};
            --_shudan-viewport-width: ${viewportWidth};
            --_shudan-viewport-height: ${viewportHeight};
          }

          ::slotted(*) {
            position: absolute;
            transform: translate(
              ${() => unit(layerLeft())}px,
              ${() => unit(layerTop())}px
            );
            width: ${() => unit(width())}px;
            height: ${() => unit(height())}px;
            top: ${unit(LAYER_PADDING)}px;
            left: ${unit(LAYER_PADDING)}px;
          }
        `}</Style>

        <Style>{css`
          :host {
            --shudan-board-background: var(--shudan-board-background-color);
            --shudan-board-background-color: #f1b458;
            --shudan-board-foreground-color: #5e2e0c;
            --shudan-board-outline-color: #ca933a;
            --shudan-black-foreground-color: #eee;
            --shudan-white-foreground-color: #222;

            position: relative;
            display: inline-block;
            border-radius: ${unitCSS(0.3)};
            overflow: hidden;
            background: var(--shudan-board-background);
            color: var(--shudan-board-foreground-color);
          }
          :host(:focus) {
            outline: 3px solid var(--shudan-board-outline-color);
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
            pointer-events: none;
          }

          .layout {
            display: grid;
            grid: auto 1fr auto / auto 1fr auto;
            grid-template-areas:
              ". top ."
              "left center right"
              ". bottom .";
            gap: ${unitCSS(0.1)};
            padding: ${unitCSS(0.35)};
            overflow: hidden;
          }
          .layout:focus {
            outline: none;
          }

          .viewport {
            grid-area: center;
            position: relative;
            width: ${unitCSS("var(--_shudan-viewport-width)")};
            height: ${unitCSS("var(--_shudan-viewport-height)")};
          }
          .viewport > svg {
            position: absolute;
            left: ${unitCSS(-LAYER_PADDING)};
            top: ${unitCSS(-LAYER_PADDING)};
            width: ${unitCSS(
              `var(--_shudan-viewport-width) + ${2 * LAYER_PADDING}`,
            )};
            height: ${unitCSS(
              `var(--_shudan-viewport-height) + ${2 * LAYER_PADDING}`,
            )};
            pointer-events: none;
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, Goban);
