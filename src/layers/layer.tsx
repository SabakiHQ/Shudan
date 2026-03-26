import {
  Component,
  css,
  Style,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { findGoban, unit } from "../utils.ts";
import type { Goban } from "../goban.tsx";

declare abstract class _LayerComponent {
  abstract renderSvg(goban: Goban): Template;
  render(): Template;
}

export function Layer<const M extends Metadata>(
  tagName: string,
  metadata: M,
): Omit<ComponentConstructor<M>, never> &
  (new () => Component<M> & _LayerComponent) {
  abstract class LayerComponent extends (Component(
    tagName,
    metadata,
  ) as ComponentConstructor<{}>) {
    abstract renderSvg(goban: Goban): Template;

    render() {
      const goban = findGoban(this)!;
      const width = () => goban.width;
      const height = () => goban.height;
      const content = this.renderSvg(goban);

      return (
        <>
          <svg viewBox={() => `-1 -1 ${width() + 2} ${height() + 2}`}>
            {content}
          </svg>

          <Style>{css`
            svg {
              position: absolute;
              left: ${unit(-1)};
              top: ${unit(-1)};
              width: ${unit("(var(--shudan-width) + 2)")};
              height: ${unit("(var(--shudan-height) + 2)")};
            }
          `}</Style>
        </>
      );
    }
  }

  return LayerComponent as any;
}
