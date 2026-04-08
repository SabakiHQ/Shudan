import {
  defineComponents,
  For,
  prop,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "sinho";
import { COMPONENT_PREFIX } from "../constants.ts";
import { Vertex } from "../vertex.ts";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../goban.tsx";
import { unitSvg } from "./layer.tsx";
import { useLightDomReference } from "../utils.ts";
import { BlackStone, WhiteStone } from "../assets.tsx";

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

    const defsContainer = useRef<Element>();

    useLightDomReference(
      this.props.blackStoneHref,
      "shudan-custom-black-stone",
      defsContainer,
    );

    useLightDomReference(
      this.props.whiteStoneHref,
      "shudan-custom-white-stone",
      defsContainer,
    );

    return (
      <>
        <defs ref={defsContainer}>
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
                  this.props.dimmedStones().includes(stone().vertex)
                    ? 0.4
                    : 0.999 // Somehow makes hover faster
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
