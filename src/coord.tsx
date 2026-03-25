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

  return (
    <>
      <div
        class="coord"
        style={{
          flexDirection: direction,
          gridArea: props.position,
        }}
      >
        <For each={labels}>
          {(label) => (
            <>
              <span>{label}</span>
              {""}
            </>
          )}
        </For>
      </div>

      <Style>{css`
        .coord {
          display: flex;
          align-items: stretch;
        }

        .coord > span {
          display: grid;
          place-items: center;
          width: var(--shudan-vertex-size);
          height: var(--shudan-vertex-size);
        }
      `}</Style>
    </>
  );
};
