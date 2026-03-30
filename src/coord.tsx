import { For, MaybeSignal, useMemo, type FunctionalComponent } from "sinho";
import { unit } from "./utils.ts";

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
  const grid = () => `repeat(${labels().length}, ${unit(1)})`;

  return (
    <div
      part={() => (direction() === "row" ? "coord-x" : "coord-y")}
      style={{
        display: "grid",
        grid: () =>
          direction() === "row" ? `auto / ${grid()}` : `${grid()} / auto`,
        placeItems: "stretch",
        gridArea: props.position,
        position: "relative",
        fontSize: unit(1 / 1.7),
      }}
    >
      <For each={labels}>
        {(label) => (
          <>
            <span
              style={{
                display: "grid",
                placeItems: "center",
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
