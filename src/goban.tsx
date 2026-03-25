import {
  Component,
  css,
  defineComponents,
  If,
  prop,
  Style,
  useEffect,
} from "sinho";
import { COMPONENT_PREFIX } from "./constants.ts";
import { Coord } from "./coord.tsx";

export class Goban extends Component("goban", {
  width: prop<number>(19, { attribute: Number }),
  height: prop<number>(19, { attribute: Number }),
  vertexSize: prop<string | number>("1.2em", { attribute: String }),
  coords: prop<boolean>(false, { attribute: () => true }),
  coordX: prop<(x: number) => string>(),
  coordY: prop<(y: number) => string>(),
}) {
  render() {
    const coordX = () =>
      this.props.coordX() ?? ((x: number) => "ABCDEFGHJKLMNOPQRST"[x]);
    const coordY = () =>
      this.props.coordY() ??
      (this.props.height(), // Track height
      (y: number) => (this.props.height() - y).toString());

    useEffect(() => {
      // Make component focusable

      if (!this.hasAttribute("tabindex")) {
        this.tabIndex = 0;
      }
    }, []);

    return (
      <>
        <div class="layout">
          <If condition={this.props.coords}>
            <Coord size={this.props.width} label={coordX} position="top" />
            <Coord size={this.props.width} label={coordX} position="bottom" />
            <Coord size={this.props.height} label={coordY} position="left" />
            <Coord size={this.props.height} label={coordY} position="right" />
          </If>
        </div>

        <Style>{css`
          :host {
            --shudan-board-border-width: 0.15em;
            --shudan-board-border-color: #ca933a;
            --shudan-board-background-image: none;
            --shudan-board-background-color: #f1b458;
            --shudan-board-foreground-color: #131110;
            --shudan-black-image: none;
            --shudan-black-background-color: #222;
            --shudan-black-foreground-color: #eee;
            --shudan-white-image: none;
            --shudan-white-background-color: #eee;
            --shudan-white-foreground-color: #222;

            --shudan-vertex-size: ${this.props.vertexSize};

            display: inline-block;
          }

          .layout {
            display: grid;
            grid: auto 1fr auto / auto 1fr auto;
            grid-template-areas:
              ". top ."
              "left center right"
              ". bottom .";
            background: var(--shudan-board-background-image)
              var(--shudan-board-background-color);
            color: var(--shudan-board-foreground-color);
          }
          :host:not([coords]) {
            padding: 0.25em;
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, Goban);
