import { defineComponents, For, If, prop, useMemo, useRef } from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { Layer, unit } from "./layer.tsx";
import { GobanContext, useGobanContext, useRanges } from "../goban.tsx";
import { useExternalReference } from "../utils.ts";
import { BlackStone, WhiteStone } from "../assets.tsx";

/**
 * A layer that renders black and white stones including shadows.
 */
export class StoneLayer extends Layer(
  {
    /**
     * A mapping from vertices to `-1` representing a white stone, or `1`
     * representing a black stone.
     */
    stones: prop<Record<Vertex, number> | undefined>(GobanContext.stones, {
      attribute: JSON.parse,
    }),
    /**
     * Whether to render shadows under the stones.
     *
     * @default false
     */
    noShadows: prop(GobanContext.noShadows, { attribute: () => true }),
    /**
     * A list of stones that should be marked as dimmed. Has no effect on
     * empty vertices.
     */
    dimmedStones: prop<Vertex[] | undefined>(GobanContext.dimmedStones, {
      attribute: JSON.parse,
    }),
    /**
     * The opacity of the dimmed stones, between 0 and 1.
     *
     * @default 0.6
     */
    dimOpacity: prop(0.6, { attribute: Number }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * black stone.
     */
    blackStoneHref: prop(GobanContext.blackStoneHref, { attribute: String }),
    /**
     * An id referencing an SVG object that should be used to represent a
     * white stone.
     */
    whiteStoneHref: prop(GobanContext.whiteStoneHref, { attribute: String }),
  },
  { visibleOverflow: true },
) {
  renderContent() {
    const { width, height, noShadows } = useGobanContext();
    const { rangeX, rangeY } = useRanges();

    const stones = useMemo(() =>
      Object.entries(this.props.stones() ?? {})
        .map(([vertex, sign]) => {
          const [x, y] = Vertex.parse(vertex as Vertex);
          return { sign, x, y, vertex: vertex as Vertex };
        })
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

    const defsRef = useRef<Element>();

    const customBlackStoneId = useExternalReference(
      this.getRootNode() as Element,
      this.props.blackStoneHref,
      defsRef,
    );
    const customWhiteStoneId = useExternalReference(
      this.getRootNode() as Element,
      this.props.whiteStoneHref,
      defsRef,
    );

    return (
      <>
        <defs ref={defsRef}>
          <BlackStone id="shudan-black-stone" />
          <WhiteStone id="shudan-white-stone" />

          <filter
            id="shudan-shadow"
            x={-unit()}
            y={-unit()}
            width={unit(3)}
            height={unit(3)}
          >
            <feOffset in="SourceGraphic" dx="0" dy={unit(0.1)} />
            <feGaussianBlur stdDeviation={unit(0.1)} />
          </filter>
        </defs>

        {/* Render shadows */}
        <If condition={() => !noShadows()}>
          <g fill="rgba(23, 10, 2, .4)" filter="url(#shudan-shadow)">
            <For each={stones} key={(stone) => stone.vertex}>
              {(stone) => (
                <circle
                  r={unit(0.95 / 2)}
                  cx={() => unit(stone().x + 0.5)}
                  cy={() => unit(height() - stone().y - 0.5)}
                  opacity={
                    () =>
                      this.props.dimmedStones()?.includes(stone().vertex)
                        ? this.props.dimOpacity() / 2
                        : 0.999 // Somehow makes hover faster
                  }
                />
              )}
            </For>
          </g>
        </If>

        {/* Render stones */}
        <g>
          <For each={stones} key={(stone) => stone.vertex}>
            {(stone) => (
              <use
                href={() =>
                  stone().sign > 0
                    ? customBlackStoneId() != null
                      ? `#${customBlackStoneId()}`
                      : "#shudan-black-stone"
                    : customWhiteStoneId() != null
                      ? `#${customWhiteStoneId()}`
                      : "#shudan-white-stone"
                }
                style={{
                  "--shudan-random": () => randomMap()[stone().y]?.[stone().x],
                }}
                width={unit(0.95)}
                height={unit(0.95)}
                x={() => unit(stone().x + 0.025)}
                y={() => unit(height() - 1 - stone().y + 0.025)}
                opacity={() =>
                  this.props.dimmedStones()?.includes(stone().vertex)
                    ? this.props.dimOpacity()
                    : 1
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
