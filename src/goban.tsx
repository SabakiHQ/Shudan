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
import { unit, unitSvg } from "./utils.ts";
import { Vertex } from "./vertex.ts";

export const GobanContext = {
  width: createContext<number>(19),
  height: createContext<number>(19),
  vertexSize: createContext<string | number>("1.7em"),
  interactive: createContext<boolean>(false),
  coords: createContext<boolean>(false),
  coordX: createContext<(x: number) => string>(),
  coordY: createContext<(y: number) => string>(),
  rangeX: createContext<[number, number]>([0, Infinity]),
  rangeY: createContext<[number, number]>([0, Infinity]),

  stoneMap: createContext<number[][]>(),
  dimmedStones: createContext<Vertex[]>([]),
};

export class Goban extends Component({
  width: prop(GobanContext.width, { attribute: Number }),
  height: prop(GobanContext.height, { attribute: Number }),
  vertexSize: prop(GobanContext.vertexSize, { attribute: String }),
  interactive: prop(GobanContext.interactive, { attribute: () => true }),
  coords: prop(GobanContext.coords, { attribute: () => true }),
  coordX: prop(GobanContext.coordX),
  coordY: prop(GobanContext.coordY),
  rangeX: prop<[number, number]>(GobanContext.rangeX, {
    attribute: JSON.parse,
  }),
  rangeY: prop<[number, number]>(GobanContext.rangeY, {
    attribute: JSON.parse,
  }),
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
      // Make component focusable

      if (this.props.interactive() && !this.hasAttribute("tabindex")) {
        this.tabIndex = 0;
      }
    });

    return (
      <>
        <div class="layout">
          <div class="viewport">
            <slot />
          </div>

          <If condition={coords}>
            <Coord size={width} range={rangeX} label={coordX} position="top" />
            <Coord
              size={width}
              range={rangeX}
              label={coordX}
              position="bottom"
            />
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
          </If>
        </div>

        <div class="gradient" />

        <Style>{css`
          :host {
            --shudan-vertex-size: ${vertexSize};
            --shudan-width: ${width};
            --shudan-height: ${height};
            --shudan-viewport-width: ${viewportWidth};
            --shudan-viewport-height: ${viewportHeight};
          }
        `}</Style>

        <Style>{css`
          :host {
            --shudan-board-border-width: 0.15em;
            --shudan-board-border-color: #a8731e;
            --shudan-board-background: var(--shudan-board-background-color);
            --shudan-board-background-color: #f1b458;
            --shudan-board-foreground-color: #5e2e0c;
            --shudan-black-foreground-color: #eee;
            --shudan-white-foreground-color: #222;

            position: relative;
            display: inline-block;
            overflow: hidden;
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
            gap: ${unit(0.1)};
            border: ${unit(0.2)} solid transparent;
            border-radius: ${unit(0.4)};
            padding: ${unit(0.2)};
            background: var(--shudan-board-background);
            color: var(--shudan-board-foreground-color);
            transition: border-color 0.2s;
          }
          :host([interactive]:focus) .layout {
            border-color: var(--shudan-board-border-color);
          }

          .viewport {
            grid-area: center;
            position: relative;
            width: ${unit("var(--shudan-viewport-width)")};
            height: ${unit("var(--shudan-viewport-height)")};
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
