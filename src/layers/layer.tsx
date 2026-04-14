import {
  Component,
  css,
  Style,
  useContext,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { Goban, GobanContext, useGobanRanges } from "../goban.tsx";
import { LAYER_PADDING } from "../constants.ts";

/**
 * Converts a vertex-count value to coordinate units.
 */
export function unit(value: number = 1): number {
  return value * 60;
}

/**
 * Options for the `Layer` base class factory.
 */
export interface LayerOptions {
  /**
   * When `true`, layer content that extends beyond the visible viewport is
   * not clipped.
   */
  visibleOverflow?: boolean;
  /**
   * When `true`, the layer content is rendered as HTML instead of SVG.
   */
  renderHTML?: boolean;
}

/**
 * Abstract base class mixed into every layer component.
 */
export declare abstract class _LayerComponent {
  /**
   * The nearest ancestor `<shudan-goban>` element.
   */
  readonly goban: Goban;
  /**
   * Renders the content of the layer. This method needs to be implemented by all concrete layer classes.
   */
  abstract renderContent(): Template;
  render(): Template;
}

export type Layer<M extends Metadata> = Component<M> & _LayerComponent;

/**
 * Base class factory for all goban layers. Extend the returned class and
 * implement `renderContent()` to create a custom layer.
 *
 * @param metadata Prop and event declarations passed to the underlying `Component`.
 * @param opts Layer rendering options.
 */
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
      const { rangeX, rangeY } = useGobanRanges();

      const content = this.renderContent();
      const padding = opts.visibleOverflow ? LAYER_PADDING : 0;

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
