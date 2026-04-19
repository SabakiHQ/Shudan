import {
  Component,
  css,
  defineComponents,
  Style,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { Goban, useGobanContext, useRanges } from "../goban.tsx";
import { COMPONENT_PREFIX, LAYER_PADDING } from "../constants.ts";
import { unit } from "../utils.ts";

export { unit };

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

declare abstract class _LayerComponent {
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

/**
 * Abstract base class mixed into every layer component.
 */
export type LayerComponent = _LayerComponent;

export type Layer<M extends Metadata> = Component<M> & LayerComponent;

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

      const { width, height } = useGobanContext();
      const { rangeX, rangeY } = useRanges();

      const content = this.renderContent();
      const padding = opts.visibleOverflow ? LAYER_PADDING : 0;

      return (
        <>
          {opts.renderHTML ? (
            content
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
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
            }

            .shudan-layer-content {
              position: absolute;
              left: ${() => unit(-padding)}px;
              top: ${() => unit(-padding)}px;
              right: ${() => unit(-padding)}px;
              bottom: ${() => unit(-padding)}px;
            }
          `}</Style>
        </>
      );
    }
  }

  return LayerComponent as any;
}

export class LayerGroup extends Layer({}, { renderHTML: true }) {
  renderContent() {
    return <></>;
  }
}

defineComponents(COMPONENT_PREFIX, LayerGroup);
