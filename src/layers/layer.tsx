import {
  Component,
  css,
  Style,
  useContext,
  type ComponentConstructor,
  type Metadata,
  type Template,
} from "sinho";
import { unit } from "../utils.ts";
import { GobanContext } from "../goban.tsx";

declare abstract class _LayerComponent {
  abstract renderSvg(): Template;
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
    abstract renderSvg(): Template;

    render() {
      const width = useContext(GobanContext.width);
      const height = useContext(GobanContext.height);
      const content = this.renderSvg();

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
