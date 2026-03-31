import {
  defineComponents,
  For,
  prop,
  useContext,
  useEffect,
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
        id="shudan-b-ambient"
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
        id="shudan-b-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#0b0b0b" />
        <stop offset="1" stop-color="#463330" />
      </linearGradient>

      <radialGradient id="shudan-b-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="#f5d1ca" stop-opacity="0.9" />
        <stop offset="0.15" stop-color="#f5d1ca" stop-opacity="0.6" />
        <stop offset="0.35" stop-color="#f5d1ca" stop-opacity="0.25" />
        <stop offset="1" stop-color="#f5d1ca" stop-opacity="0" />
      </radialGradient>

      <mask id="shudan-b-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="white" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#shudan-b-base)"
      stroke="#35302c"
      stroke-width="1"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#shudan-b-ambient)" />

    <g mask="url(#shudan-b-stone-mask)">
      <ellipse
        cx="20"
        cy="9"
        rx="24"
        ry="12"
        fill="url(#shudan-b-specular)"
        transform="rotate(-40 20 9)"
        opacity=".6"
      />
      <ellipse
        cx="41"
        cy="31"
        rx="24"
        ry="12"
        fill="url(#shudan-b-specular)"
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
        id="shudan-w-ambient"
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
        id="shudan-w-base"
        x1="0"
        x2="0"
        y1="43"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#d6d8ed" />
        <stop offset="1" stop-color="#f6f7ff" />
      </linearGradient>

      <filter id="shudan-w-wavy">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.08 0.02"
          numOctaves="2"
          seed="15"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          result="displacement"
          scale="3"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur in="displacement" stdDeviation=".5" />
      </filter>

      <radialGradient id="shudan-w-specular" cx="32%" cy="28%" r="18%">
        <stop offset="0" stop-color="#fff" />
        <stop offset=".15" stop-color="#fff" stop-opacity=".6" />
        <stop offset=".35" stop-color="#fff" stop-opacity=".25" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </radialGradient>

      <mask id="shudan-w-stone-mask">
        <circle cx="21.5" cy="21.5" r="18.5" fill="#fff" />
      </mask>
    </defs>

    <circle
      cx="21.5"
      cy="21.5"
      r="20.5"
      fill="url(#shudan-w-base)"
      stroke="#c3c3c3"
    />
    <circle cx="21.5" cy="21.5" r="18.5" fill="url(#shudan-w-ambient)" />

    <g
      style={{
        transformOrigin: "21.5px 21.5px",
        transform: "rotate(calc(var(--shudan-random) * 360deg))",
      }}
      mask="url(#shudan-w-stone-mask)"
      filter="url(#shudan-w-wavy)"
      stroke="#c0bab6"
      stroke-width="2"
      fill="none"
      opacity=".4"
    >
      <path d="M0 0h43v43H0z" />
      <path d="M1.324 32.87s2.363 1.361 5.347 2.326c7.343 2.373 22.915 2.014 27.722-.008 4.507-1.895 7.33-3.361 7.33-3.361" />
      <path d="M1.084 28.41s1.761 1.731 4.826 2.4c7.398 1.616 25.49 1.16 30.253-.23 4.694-1.371 6.623-2.655 6.623-2.655" />
      <path d="M.5 23.603s1.8 1.575 4.826 2.4c6.273 1.712 26.148.736 30.253-.23 4.73-1.114 6.623-2.654 6.623-2.654" />
      <path d="M.5 18.697s1.79 1.996 4.863 2.624c7.093 1.45 26.466.914 30.254-.23 4.68-1.415 6.585-2.878 6.585-2.878" />
      <path d="M.845 11.242s2.089 3.103 4.922 4.45c5.32 2.528 25.884 1.896 30.141.587 3.36-1.033 6.247-4.54 6.247-4.54" />
      <path d="M5.197 6.028s1.753 3.704 4.33 5.493c2.754 1.913 22.354 2.028 25.744-.813C38.68 7.85 38.916 5.26 38.916 5.26" />
      <path d="M13.052 1.988s-3.576 2.675-.907 4.323c3.863 2.386 14.317 3.192 18.64.25 4-2.723-.722-4.455-.722-4.455" />
    </g>

    <g mask="url(#shudan-w-stone-mask)" fill="url(#shudan-w-specular)">
      <ellipse cx="20" cy="9" rx="24" ry="12" transform="rotate(-40 20 9)" />
      <ellipse
        cx="41"
        cy="31"
        rx="24"
        ry="12"
        transform="rotate(-40 41 31)"
        opacity=".6"
      />
    </g>
  </symbol>
);

export class StoneLayer extends Layer(
  {
    /**
     * An array of arrays of numbers representing the stone arrangement. `-1`
     * denotes a white stone, `1` denotes a black stone, and `0` denotes an
     * empty vertex.
     */
    stoneMap: prop<number[][] | undefined>(GobanContext.stoneMap, {
      attribute: JSON.parse,
    }),
    /**
     * A list of stones that should be marked as dimmed. Has no effect on
     * empty vertices.
     */
    dimmedStones: prop<Vertex[]>([], { attribute: JSON.parse }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * black stone.
     */
    blackStoneHref: prop<string>(undefined, { attribute: String }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * black stone.
     */
    whiteStoneHref: prop<string>(undefined, { attribute: String }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
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

    for (const stoneHref of [
      this.props.blackStoneHref,
      this.props.whiteStoneHref,
    ]) {
      useEffect(() => {
        // Clone referenced custom stone elements into the shadow DOM so they can
        // be used for rendering

        if (stoneHref() == null) return;

        const customStoneId =
          stoneHref === this.props.blackStoneHref
            ? "shudan-custom-black-stone"
            : "shudan-custom-white-stone";
        const defsElement = this.shadowRoot!.querySelector("defs")!;
        const stoneElement = document.querySelector(stoneHref()!);

        defsElement.querySelector("#" + customStoneId)?.remove();

        if (stoneElement != null) {
          const clonedStone = stoneElement.cloneNode(true) as Element;
          clonedStone.id = customStoneId;

          defsElement.appendChild(clonedStone);
        }
      });
    }

    return (
      <>
        <defs>
          <BlackStone id="shudan-black-stone" />
          <WhiteStone id="shudan-white-stone" />

          <filter
            id="shudan-shadow"
            x={-unitSvg()}
            y={-unitSvg()}
            width={unitSvg(3)}
            height={unitSvg(3)}
          >
            <feOffset in="SourceGraphic" dx="0" dy={unitSvg(0.1)} />
            <feGaussianBlur stdDeviation={unitSvg(0.1)} />
          </filter>
        </defs>

        {/* Render shadows */}
        <g fill="rgba(23, 10, 2, .4)" filter="url(#shudan-shadow)">
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
                  stone().sign > 0
                    ? this.props.blackStoneHref() != null
                      ? "#shudan-custom-black-stone"
                      : "#shudan-black-stone"
                    : this.props.whiteStoneHref() != null
                      ? "#shudan-custom-white-stone"
                      : "#shudan-white-stone"
                }
                style={{
                  "--shudan-random": () => randomMap()[stone().y]?.[stone().x],
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
