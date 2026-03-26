import {
  css,
  For,
  MaybeSignal,
  Style,
  useMemo,
  type FunctionalComponent,
  type SignalLike,
} from "sinho";

export const Coord: FunctionalComponent<{
  size: MaybeSignal<number>;
  label: SignalLike<(i: number) => string>;
  position: MaybeSignal<"top" | "bottom" | "left" | "right">;
}> = (props) => {
  const direction = () =>
    MaybeSignal.get(props.position) === "top" ||
    MaybeSignal.get(props.position) === "bottom"
      ? "row"
      : "column";
  const labels = useMemo(() =>
    [...Array(MaybeSignal.get(props.size))].map((_, i) => props.label()(i)),
  );
  const grid = () =>
    `repeat(${MaybeSignal.get(props.size)}, var(--shudan-vertex-size))`;

  return (
    <div
      class="coord"
      style={{
        display: "grid",
        grid: () =>
          direction() === "row" ? `auto / ${grid()}` : `${grid()} / auto`,
        placeItems: "stretch",
        flexDirection: direction,
        gridArea: props.position,
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
