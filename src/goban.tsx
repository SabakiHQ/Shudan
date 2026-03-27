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
};

export class Goban extends Component("goban", {
  width: prop(GobanContext.width, { attribute: Number }),
  height: prop(GobanContext.height, { attribute: Number }),
  vertexSize: prop(GobanContext.vertexSize, { attribute: String }),
  interactive: prop(GobanContext.interactive, { attribute: () => true }),
  coords: prop(GobanContext.coords, { attribute: () => true }),
  coordX: prop(GobanContext.coordX),
  coordY: prop(GobanContext.coordY),
  rangeX: prop(GobanContext.rangeX, { attribute: JSON.parse }),
  rangeY: prop(GobanContext.rangeY, { attribute: JSON.parse }),
  onStonesChange: event(),
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
    const coordX = () =>
      this.props.coordX() ??
      ((x: number) => "ABCDEFGHJKLMNOPQRSTUVWXYZ"[x % 25]);
    const coordY = () =>
      this.props.coordY() ??
      (height(), // Track height
      (y: number) => (height() - y).toString());

    useEffect(() => {
      // Make component focusable

      if (this.props.interactive() && !this.hasAttribute("tabindex")) {
        this.tabIndex = 0;
      }
    });

    return (
      <>
        <div class="layout">
          <If condition={coords}>
            <Coord size={width} label={coordX} position="top" />
            <Coord size={width} label={coordX} position="bottom" />
            <Coord size={height} label={coordY} position="left" />
            <Coord size={height} label={coordY} position="right" />
          </If>

          <div class="viewport">
            <slot />
          </div>
        </div>

        <Style>{css`
          :host {
            --shudan-vertex-size: ${vertexSize};
            --shudan-width: ${width};
            --shudan-height: ${height};
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

            display: inline-block;
            overflow: hidden;
          }

          .layout {
            display: grid;
            grid: auto 1fr auto / auto 1fr auto;
            grid-template-areas:
              ". top ."
              "left center right"
              ". bottom .";
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
            width: ${unit("var(--shudan-width)")};
            height: ${unit("var(--shudan-height)")};
          }

          .viewport > *,
          .viewport > ::slotted(*) {
            display: grid;
            place-items: stretch;
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
