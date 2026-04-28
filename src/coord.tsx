import { For, MaybeSignal, useMemo, type FunctionalComponent } from "sinho";
import { unitCSS } from "./utils.ts";

export const Coord: FunctionalComponent<{
  size: MaybeSignal<number>;
  range: MaybeSignal<[number, number]>;
  label: (i: number) => string;
  position: MaybeSignal<"top" | "bottom" | "left" | "right">;
}> = (props) => {
  const size = MaybeSignal.upgrade(props.size);
  const range = MaybeSignal.upgrade(props.range);
  const position = MaybeSignal.upgrade(props.position);

  const direction = () =>
    position() === "top" || position() === "bottom" ? "row" : "column";
  const labels = useMemo(() =>
    [...Array(size())]
      .map((_, i) => props.label(i))
      .slice(range()[0], range()[1] + 1),
  );
  const grid = () => `repeat(${labels().length}, ${unitCSS()})`;

  return (
    <div
      style={{
        display: "grid",
        grid: () =>
          direction() === "row" ? `auto / ${grid()}` : `${grid()} / auto`,
        placeItems: "stretch",
        gridArea: props.position,
        position: "relative",
      }}
    >
      <For each={labels}>
        {(label, i) => (
          <>
            <span
              part={() => (direction() === "row" ? "coord-x" : "coord-y")}
              style={{
                display: "grid",
                placeItems: "center",
                fontSize: `min(${unitCSS(1 / 1.7)}, 1em)`,
                gridRow: () =>
                  direction() === "column" ? labels().length - i() : undefined,
              }}
            >
              {label}
            </span>{" "}
          </>
        )}
      </For>
    </div>
  );
};
