import {
  defineComponents,
  For,
  prop,
  useContext,
  useMemo,
  type FunctionalComponent,
  type JSX,
} from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";
import { unitSvg } from "../utils.ts";

const BlackStone: FunctionalComponent<JSX.IntrinsicElements["symbol"]> = (
  props,
) => (
  <symbol {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient
        id="b-ambient"
        x1="0"
        x2="0"
        y1="2.38"
        y2="19.27"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#636363" stop-opacity=".4" />
        <stop offset="1" stop-color="#636363" stop-opacity="0" />
      </linearGradient>
      <linearGradient
        id="b-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#0b0b0b" />
        <stop offset="1" stop-color="#463330" />
      </linearGradient>

      <radialGradient id="b-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="#f5d1ca" stop-opacity="0.9" />
        <stop offset="0.15" stop-color="#f5d1ca" stop-opacity="0.6" />
        <stop offset="0.35" stop-color="#f5d1ca" stop-opacity="0.25" />
        <stop offset="1" stop-color="#f5d1ca" stop-opacity="0" />
      </radialGradient>

      <mask id="b-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="white" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#b-base)"
      stroke="#35302c"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#b-ambient)" />

    <g mask="url(#b-stone-mask)">
      <ellipse
        cx="20"
        cy="9"
        rx="24"
        ry="12"
        fill="url(#b-specular)"
        transform="rotate(-40 20 9)"
        opacity=".6"
      />
      <ellipse
        cx="41"
        cy="31"
        rx="24"
        ry="12"
        fill="url(#b-specular)"
        transform="rotate(-40 41 31)"
        opacity=".4"
      />
    </g>
  </symbol>
);

const WhiteStone: FunctionalComponent<JSX.IntrinsicElements["symbol"]> = (
  props,
) => (
  <symbol {...props} viewBox="0 0 43 43">
    <defs>
      <linearGradient
        id="w-ambient"
        x1="0"
        x2="0"
        y1="40.65"
        y2="30.65"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#f6f7ff" stop-opacity=".6" />
        <stop offset="1" stop-color="#f6f7ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient
        id="w-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#d6d8ed" />
        <stop offset="1" stop-color="#f6f7ff" />
      </linearGradient>

      <pattern
        id="w-stripe"
        patternUnits="userSpaceOnUse"
        width="5"
        height="43"
      >
        <rect x="0" width="2" height="43" fill="#c0bab6" opacity=".4" />
      </pattern>

      <filter id="w-wavy">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.08 0.02"
          numOctaves="2"
          seed="3"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <mask id="w-fade">
        <radialGradient id="w-fade-gradient">
          <stop offset="40%" stop-color="white" stop-opacity="1" />
          <stop offset="90%" stop-color="white" stop-opacity="0" />
        </radialGradient>
        <rect width="43" height="43" fill="url(#w-fade-gradient)" />
      </mask>

      <radialGradient id="w-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="white" stop-opacity="0.9" />
        <stop offset="0.15" stop-color="white" stop-opacity="0.6" />
        <stop offset="0.35" stop-color="white" stop-opacity="0.25" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>

      <mask id="w-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="white" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#w-base)"
      stroke="#c3c3c3"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#w-ambient)" />

    <g mask="url(#w-fade)" filter="url(#w-wavy)">
      <circle
        style={{
          transform: "rotate(calc(var(--random, 0) * 360deg))",
          transformOrigin: "21.5px 21.5px",
        }}
        cx="21.5"
        cy="21.5"
        r="20"
        fill="url(#w-stripe)"
      />
    </g>

    <g mask="url(#w-stone-mask)">
      <ellipse
        cx="21"
        cy="10"
        rx="26"
        ry="14"
        fill="url(#w-specular)"
        transform="rotate(-40 21 10)"
      />
    </g>
  </symbol>
);

export class StoneLayer extends Layer(
  {
    stoneMap: prop<number[][] | undefined>(GobanContext.stoneMap, {
      attribute: JSON.parse,
    }),
    dimmedStones: prop<Vertex[]>([], { attribute: JSON.parse }),
  },
  { visibleOverflow: true },
) {
  renderSvg() {
    const width = useContext(GobanContext.width);
    const height = useContext(GobanContext.height);
    const rangeX = useContext(GobanContext.rangeX);
    const rangeY = useContext(GobanContext.rangeY);

    const stones = useMemo(() =>
      (this.props.stoneMap() ?? [])
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
    const randomMap = useMemo(() =>
      [...Array(height())].map((_) =>
        [...Array(width())].map((_) => Math.random()),
      ),
    );

    return (
      <>
        <defs>
          <BlackStone id="black-stone" />
          <WhiteStone id="white-stone" />

          <filter
            id="shadow"
            x={unitSvg(-1)}
            y={unitSvg(-1)}
            width={unitSvg(3)}
            height={unitSvg(3)}
          >
            <feOffset in="SourceGraphic" dx="0" dy={unitSvg(0.1)} />
            <feGaussianBlur stdDeviation={unitSvg(0.1)} />
          </filter>
        </defs>

        {/* Render shadows */}
        <g fill="rgba(23, 10, 2, .4)" filter="url(#shadow)">
          <For each={stones} key={(stone) => stone.vertex}>
            {(stone) => (
              <circle
                r={unitSvg(0.9 / 2)}
                cx={() => unitSvg(stone().x + 0.5)}
                cy={() => unitSvg(stone().y + 0.5)}
                opacity={() =>
                  this.props.dimmedStones().includes(stone().vertex) ? 0.4 : 1
                }
              />
            )}
          </For>
        </g>

        {/* Render stones */}
        <g>
          <For each={stones} key={(stone) => stone.vertex}>
            {(stone) => (
              <use
                href={() =>
                  stone().sign > 0 ? "#black-stone" : "#white-stone"
                }
                style={{
                  "--random": () => randomMap()[stone().y]?.[stone().x],
                }}
                width={unitSvg(0.9)}
                height={unitSvg(0.9)}
                x={() => unitSvg(stone().x + 0.05)}
                y={() => unitSvg(stone().y + 0.05)}
                opacity={() =>
                  this.props.dimmedStones().includes(stone().vertex) ? 0.6 : 1
                }
              />
            )}
          </For>
        </g>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, StoneLayer);
