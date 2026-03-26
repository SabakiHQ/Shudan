import {
  Component,
  css,
  defineComponents,
  Else,
  For,
  If,
  MaybeSignal,
  Style,
  useContext,
  useMemo,
  type FunctionalComponent,
} from "sinho";
import { GobanContext } from "../goban.tsx";
import { COMPONENT_PREFIX } from "../constants.ts";
import { findGoban, unit } from "../utils.ts";
import { Vertex } from "../vertex.ts";

const BlackStone: FunctionalComponent<{
  width?: MaybeSignal<number>;
  height?: MaybeSignal<number>;
  x?: MaybeSignal<number>;
  y?: MaybeSignal<number>;
}> = (props) => (
  <svg {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient id="b">
        <stop offset="0" stop-color="#636363" stop-opacity=".4" />
        <stop offset="1" stop-color="#636363" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="a">
        <stop offset="0" stop-color="#0b0b0b" />
        <stop offset="1" stop-color="#443432" />
      </linearGradient>
      <linearGradient
        id="c"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        href="#a"
        gradientUnits="userSpaceOnUse"
      />
      <linearGradient
        id="d"
        x1="0"
        x2="0"
        y1="2.38"
        y2="19.27"
        href="#b"
        gradientUnits="userSpaceOnUse"
      />
    </defs>
    <g>
      <circle
        cx="21.5"
        cy="21.5"
        r="20.5"
        fill="url(#c)"
        stroke="#121112"
        stroke-width="1"
      />
      <circle cx="21.5" cy="21.5" r="18.5" fill="url(#d)" />
    </g>
  </svg>
);

const WhiteStone: FunctionalComponent<{
  width?: MaybeSignal<number>;
  height?: MaybeSignal<number>;
  x?: MaybeSignal<number>;
  y?: MaybeSignal<number>;
}> = (props) => (
  <svg {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient id="f">
        <stop offset="0" stop-color="#eee" stop-opacity=".8" />
        <stop offset="1" stop-color="#eee" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="e">
        <stop offset="0" stop-color="#C9D1FF" />
        <stop offset="1" stop-color="#fff" />
      </linearGradient>
      <linearGradient
        id="g"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        href="#e"
        gradientUnits="userSpaceOnUse"
      />
      <linearGradient
        id="h"
        x1="0"
        x2="0"
        y1="40.65"
        y2="30.65"
        href="#f"
        gradientUnits="userSpaceOnUse"
      />
    </defs>
    <g>
      <circle
        cx="21.5"
        cy="21.5"
        r="20.5"
        fill="url(#g)"
        stroke="#c3c3c3"
        stroke-width="1"
      />
      <circle cx="21.5" cy="21.5" r="18.5" fill="url(#h)" />
    </g>
  </svg>
);

export class StonesLayer extends Component("stones-layer", {}) {
  render() {
    const goban = findGoban(this)!;
    const width = () => goban.width;
    const height = () => goban.height;
    const signMap = useContext(GobanContext.signMap);
    const stones = useMemo(() =>
      signMap().flatMap((row, y) =>
        row.map((sign, x) => ({ sign, x, y })).filter(({ sign }) => sign !== 0),
      ),
    );

    return (
      <>
        <svg viewBox={() => `-1 -1 ${width() + 2} ${height() + 2}`}>
          <defs>
            <filter id="shadow" width="2" height="2">
              <feOffset in="SourceGraphic" dx="0" dy="0.1" />
              <feGaussianBlur stdDeviation=".1" />
            </filter>
          </defs>

          {/* Render shadows */}
          <For each={stones} key={(item) => Vertex(item.x, item.y)}>
            {(stone) => (
              <circle
                r={0.9 / 2}
                cx={() => stone().x + 0.5}
                cy={() => stone().y + 0.5}
                fill="rgba(23, 10, 2, .4)"
                filter="url(#shadow)"
              />
            )}
          </For>

          {/* Render stones */}
          <For each={stones} key={(item) => Vertex(item.x, item.y)}>
            {(stone) => (
              <>
                <If condition={() => stone().sign === 1}>
                  <BlackStone
                    width={0.9}
                    height={0.9}
                    x={() => stone().x + 0.05}
                    y={() => stone().y + 0.05}
                  />
                </If>
                <Else>
                  <WhiteStone
                    width={0.9}
                    height={0.9}
                    x={() => stone().x + 0.05}
                    y={() => stone().y + 0.05}
                  />
                </Else>
              </>
            )}
          </For>
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

defineComponents(COMPONENT_PREFIX, StonesLayer);
