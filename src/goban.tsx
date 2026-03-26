import {
  Component,
  createContext,
  css,
  defineComponents,
  If,
  prop,
  Style,
  useContext,
  useEffect,
} from "sinho";
import { COMPONENT_PREFIX } from "./constants.ts";
import { Coord } from "./coord.tsx";
import { unit } from "./utils.ts";
import { GridLayer } from "./layers/grid.tsx";
import { StonesLayer } from "./layers/stones.tsx";

const defaultSignMap = Array(19).fill(Array(19).fill(0));

export const GobanContext = {
  vertexSize: createContext<string | number>("1.7em"),
  interactive: createContext<boolean>(false),
  coords: createContext<boolean>(false),
  coordX: createContext<(x: number) => string>(),
  coordY: createContext<(y: number) => string>(),
  rangeX: createContext<[number, number]>(),
  rangeY: createContext<[number, number]>(),
  signMap: createContext<number[][]>(defaultSignMap),
};

export class Goban extends Component("goban", {
  vertexSize: prop(GobanContext.vertexSize, { attribute: String }),
  interactive: prop(GobanContext.interactive, { attribute: () => true }),
  coords: prop(GobanContext.coords, { attribute: () => true }),
  coordX: prop(GobanContext.coordX),
  coordY: prop(GobanContext.coordY),
  rangeX: prop(GobanContext.rangeX, {
    attribute: (x) => x.split("..").map(Number) as [number, number],
  }),
  rangeY: prop(GobanContext.rangeY, {
    attribute: (x) => x.split("..").map(Number) as [number, number],
  }),
  signMap: prop(GobanContext.signMap, {
    attribute: (x) => x.split(";").map((row) => row.split(",").map(Number)),
  }),
}) {
  get width(): number {
    return (this.props.signMap() ?? defaultSignMap)[0]?.length ?? 0;
  }

  get height(): number {
    return (this.props.signMap() ?? defaultSignMap).length;
  }

  render() {
    const width = () => this.width;
    const height = () => this.height;
    const vertexSize = useContext(GobanContext.vertexSize);
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
            <GridLayer />
            <StonesLayer />

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
            background: var(--shudan-board-background);
            color: var(--shudan-board-foreground-color);
            transition: border-color 0.2s;
          }
          :host([interactive]:focus) .layout {
            border-color: var(--shudan-board-border-color);
          }
          :host(:not([coords])) .layout {
            padding: ${unit(0.2)};
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
