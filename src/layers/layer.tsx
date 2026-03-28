import {
  Component,
  css,
  Style,
  useContext,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { unit, unitSvg } from "../utils.ts";
import { Goban, GobanContext } from "../goban.tsx";

declare abstract class _LayerComponent {
  readonly goban: Goban;
  abstract renderSvg(): Template;
  render(): Template;
}

export interface LayerOptions {
  visibleOverflow?: boolean;
}

export function Layer<const M extends Metadata>(
  metadata: M,
  opts: LayerOptions = {},
): Omit<ComponentConstructor<M>, never> &
  (new () => Component<M> & _LayerComponent) {
  abstract class LayerComponent extends (Component(
    metadata,
  ) as ComponentConstructor<{}>) {
    get goban(): Goban {
      const host = (this.getRootNode() as ShadowRoot).host;
      const result =
        this.closest<Goban>("shudan-goban") ??
        (host instanceof Goban ? host : null) ??
        undefined;

      return result!;
    }

    abstract renderSvg(): Template;

    render() {
      if (this.goban == null) {
        throw new Error(
          "Layer elements need to be children of <shudan-goban>.",
        );
      }

      const width = useContext(GobanContext.width);
      const height = useContext(GobanContext.height);
      const rangeX = useContext(GobanContext.rangeX);
      const rangeY = useContext(GobanContext.rangeY);

      const left = () => -Math.max(rangeX()[0], 0);
      const top = () => -Math.max(rangeY()[0], 0);

      const content = this.renderSvg();
      const padding = opts.visibleOverflow ? 2 : 0;

      return (
        <>
          <svg
            viewBox={() =>
              `${unitSvg(-padding)} ${unitSvg(-padding)} ` +
              `${unitSvg(width() + 2 * padding)} ${unitSvg(height() + 2 * padding)}`
            }
          >
            {content}
          </svg>

          <slot />

          <Style>{css`
            :host {
              overflow: ${opts.visibleOverflow ? "visible" : "hidden"};
            }

            svg {
              position: absolute;
              left: ${() => unit(left() - padding)};
              top: ${() => unit(top() - padding)};
              width: ${() => unit(width() + 2 * padding)};
              height: ${() => unit(height() + 2 * padding)};
            }
          `}</Style>
        </>
      );
    }
  }

  return LayerComponent as any;
}
