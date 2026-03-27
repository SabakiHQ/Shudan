import {
  defineComponents,
  Else,
  event,
  For,
  If,
  MaybeSignal,
  prop,
  useContext,
  useEffect,
  useMemo,
  type FunctionalComponent,
} from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";

interface StoneProps {
  width?: MaybeSignal<number>;
  height?: MaybeSignal<number>;
  x?: MaybeSignal<number>;
  y?: MaybeSignal<number>;
  opacity?: MaybeSignal<number>;
}

const BlackStone: FunctionalComponent<StoneProps> = (props) => (
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

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#c)"
      stroke="#352c35"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#d)" />
  </svg>
);

const WhiteStone: FunctionalComponent<StoneProps> = (props) => (
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

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#g)"
      stroke="#c3c3c3"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#h)" />
  </svg>
);

const stoneMapInfo = new WeakMap<StonesLayer, number[][]>();

export function getStonesMap(layer: StonesLayer) {
  return stoneMapInfo.get(layer) ?? [];
}

export class StonesLayer extends Layer("stones-layer", {
  dimmedVertices: prop<Vertex[]>([], { attribute: JSON.parse }),
  stoneMap: prop<number[][]>([], { attribute: JSON.parse }),
  onStonesChange: event<number[][]>(),
}) {
  renderSvg() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);
    const rangeX = useContext(GobanContext.rangeX);
    const rangeY = useContext(GobanContext.rangeY);

    const stones = useMemo(() =>
      this.props
        .stoneMap()
        .flatMap((row, y) =>
          row.map((sign, x) => ({ sign, x, y, vertex: Vertex(x, y) })),
        )
        .filter(
          ({ x, y, sign }) =>
            sign !== 0 &&
            Math.max(rangeX()[0], 0) <= x &&
            x <= Math.min(rangeX()[1], width() - 1) &&
            Math.max(rangeY()[0], 0) <= y &&
            y <= Math.min(rangeY()[1], height() - 1),
        ),
    );

    useEffect(() => {
      stoneMapInfo.set(this, this.props.stoneMap());
      this.events.onStonesChange({
        bubbles: true,
        detail: this.props.stoneMap(),
      });

      return () => stoneMapInfo.delete(this);
    });

    return (
      <>
        <defs>
          <filter id="shadow" x="-1" y="-1" width="3" height="3">
            <feOffset in="SourceGraphic" dx="0" dy="0.1" />
            <feGaussianBlur stdDeviation=".1" />
          </filter>
        </defs>

        {/* Render shadows */}
        <For each={stones} key={(stone) => stone.vertex}>
          {(stone) => (
            <circle
              r={0.9 / 2}
              cx={() => stone().x + 0.5}
              cy={() => stone().y + 0.5}
              fill="rgba(23, 10, 2, .4)"
              filter="url(#shadow)"
              opacity={() =>
                this.props.dimmedVertices().includes(stone().vertex) ? 0.4 : 1
              }
            />
          )}
        </For>

        {/* Render stones */}
        <For each={stones} key={(stone) => stone.vertex}>
          {(stone) => (
            <>
              <If condition={() => stone().sign > 0}>
                <BlackStone
                  width={0.9}
                  height={0.9}
                  x={() => stone().x + 0.05}
                  y={() => stone().y + 0.05}
                  opacity={() =>
                    this.props.dimmedVertices().includes(stone().vertex)
                      ? 0.6
                      : 1
                  }
                />
              </If>
              <Else>
                <WhiteStone
                  width={0.9}
                  height={0.9}
                  x={() => stone().x + 0.05}
                  y={() => stone().y + 0.05}
                  opacity={() =>
                    this.props.dimmedVertices().includes(stone().vertex)
                      ? 0.6
                      : 1
                  }
                />
              </Else>
            </>
          )}
        </For>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, StonesLayer);
