import {
  Component,
  css,
  Style,
  useContext,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { Goban, GobanContext } from "../goban.tsx";

export function unit(value: number = 1): number {
  return value * 60;
}

export interface LayerOptions {
  visibleOverflow?: boolean;
  renderHTML?: boolean;
}

export declare abstract class _LayerComponent {
  readonly goban: Goban;
  abstract renderContent(): Template;
  render(): Template;
}

export type Layer<M extends Metadata> = Component<M> & _LayerComponent;

export function Layer<const M extends Metadata>(
  metadata: M,
  opts: LayerOptions = {},
): Omit<ComponentConstructor<M>, never> & (new () => Layer<M>) {
  abstract class LayerComponent extends (Component(
    metadata,
  ) as ComponentConstructor<{}>) {
    get goban(): Goban {
      const host = (this.getRootNode() as ShadowRoot).host;
      const result =
        this.closest<Goban>("shudan-goban") ??
        host.closest<Goban>("shudan-goban");

      return result!;
    }

    abstract renderContent(): Template;

    render() {
      if (this.goban == null) {
        throw new Error(
          "Layer elements need to be descendants of <shudan-goban>.",
        );
      }

      const width = useContext(GobanContext.width);
      const height = useContext(GobanContext.height);
      const rangeX = useContext(GobanContext.rangeX);
      const rangeY = useContext(GobanContext.rangeY);

      const content = this.renderContent();
      const padding = opts.visibleOverflow ? 2 : 0;

      return (
        <>
          {opts.renderHTML ? (
            <div class="shudan-layer-content">{content}</div>
          ) : (
            <svg
              class="shudan-layer-content"
              viewBox={() =>
                `${unit(-padding)} ${unit(-padding)} ` +
                `${unit(width() + 2 * padding)} ${unit(height() + 2 * padding)}`
              }
            >
              <defs>
                <mask id="shudan-layer-mask">
                  <rect
                    x={() => unit(Math.max(rangeX()[0], 0))}
                    y={() => unit(Math.max(height() - 1 - rangeY()[1], 0))}
                    width={() =>
                      unit(Math.min(rangeX()[1] - rangeX()[0] + 1, width()))
                    }
                    height={() =>
                      unit(Math.min(rangeY()[1] - rangeY()[0] + 1, height()))
                    }
                    fill="white"
                  />
                </mask>
              </defs>

              <g
                mask={
                  opts.visibleOverflow ? undefined : "url(#shudan-layer-mask)"
                }
              >
                {content}
              </g>
            </svg>
          )}

          <slot />

          <Style>{css`
            :host {
              display: block;
              pointer-events: none;
            }

            .shudan-layer-content {
              position: absolute;
              left: ${() => unit(-padding)}px;
              top: ${() => unit(-padding)}px;
              right: ${() => unit(-padding)}px;
              bottom: ${() => unit(-padding)}px;
            }

            ::slotted(*) {
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
            }
          `}</Style>
        </>
      );
    }
  }

  return LayerComponent as any;
}
