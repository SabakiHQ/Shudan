import { describe, test } from "node:test";
import assert from "node:assert/strict";
import "@happy-dom/global-registrator/register.js";
import { useSignal, Component, defineComponents } from "sinho";
import { Coord } from "./coord.tsx";

class CoordContainer extends Component({}, { shadow: false }) {
  innerProps: Parameters<typeof Coord>[0];

  constructor(props?: Parameters<typeof Coord>[0]) {
    super();

    if (props == null) throw new Error("CoordContainer requires props");
    this.innerProps = props;
  }

  render() {
    return <Coord {...this.innerProps} />;
  }
}

defineComponents(CoordContainer);

function render(props: Parameters<typeof Coord>[0]) {
  const container = new CoordContainer(props);
  document.body.append(container);

  return {
    get element() {
      return container.firstElementChild as HTMLElement;
    },
    get entries() {
      return Array.from(container.querySelectorAll<HTMLElement>("span"));
    },
    cleanup() {
      container.remove();
    },
  };
}

describe("Coord structure", () => {
  test("gridArea matches position prop for all positions", () => {
    for (const position of ["top", "bottom", "left", "right"] as const) {
      const { element, cleanup } = render({
        size: 3,
        range: [0, 2],
        label: (i) => String(i),
        position,
      });
      assert.equal(
        element.style.gridArea,
        position,
        `gridArea for ${position}`,
      );
      cleanup();
    }
  });
});

describe("Coord row direction (position=top or bottom)", () => {
  test("entries receive part=coord-x", () => {
    for (const position of ["top", "bottom"] as const) {
      const { entries, cleanup } = render({
        size: 3,
        range: [0, 2],
        label: (i) => String(i),
        position,
      });
      assert.ok(entries.length > 0);
      for (const entry of entries) {
        assert.equal(entry.getAttribute("part"), "coord-x");
      }
      cleanup();
    }
  });
});

describe("Coord column direction (position=left or right)", () => {
  test("entries receive part=coord-y", () => {
    for (const position of ["left", "right"] as const) {
      const { entries, cleanup } = render({
        size: 3,
        range: [0, 2],
        label: (i) => String(i),
        position,
      });
      assert.ok(entries.length > 0);
      for (const entry of entries) {
        assert.equal(entry.getAttribute("part"), "coord-y");
      }
      cleanup();
    }
  });

  test("entries have reversed gridRow values", () => {
    const { entries, cleanup } = render({
      size: 3,
      range: [0, 2],
      label: (i) => String(i + 1),
      position: "left",
    });
    // labels = ["1","2","3"] (length=3)
    // gridRow at i=0: 3 - 0 = 3  (bottom-most in CSS grid)
    // gridRow at i=1: 3 - 1 = 2
    // gridRow at i=2: 3 - 2 = 1  (top-most)
    assert.equal(entries[0].style.gridRow, "3");
    assert.equal(entries[1].style.gridRow, "2");
    assert.equal(entries[2].style.gridRow, "1");
    cleanup();
  });
});

describe("Coord range slicing", () => {
  test("renders the correct number of entries", () => {
    const { entries, cleanup } = render({
      size: 10,
      range: [3, 7],
      label: (i) => String(i),
      position: "top",
    });
    assert.equal(entries.length, 5); // indices 3,4,5,6,7
    cleanup();
  });

  test("labels reflect the sliced indices", () => {
    const { entries, cleanup } = render({
      size: 10,
      range: [3, 7],
      label: (i) => `i${i}`,
      position: "top",
    });
    assert.deepEqual(
      entries.map((s) => s.textContent?.trim()),
      ["i3", "i4", "i5", "i6", "i7"],
    );
    cleanup();
  });

  test("full range renders all labels", () => {
    const { entries, cleanup } = render({
      size: 5,
      range: [0, 4],
      label: (i) => String.fromCharCode(65 + i), // A-E
      position: "top",
    });
    assert.deepEqual(
      entries.map((x) => x.textContent?.trim()),
      ["A", "B", "C", "D", "E"],
    );
    cleanup();
  });
});

describe("Coord signal reactivity", () => {
  test("updates entry part when position signal changes", () => {
    const [position, setPosition] = useSignal<"top" | "left">("top");
    const { entries, cleanup } = render({
      size: 3,
      range: [0, 2],
      label: (i) => String(i),
      position,
    });
    assert.equal(entries[0].getAttribute("part"), "coord-x");
    setPosition("left");
    assert.equal(entries[0].getAttribute("part"), "coord-y");
    cleanup();
  });

  test("updates entry count when range signal changes", () => {
    const [range, setRange] = useSignal<[number, number]>([0, 2]);
    const { entries, cleanup } = render({
      size: 10,
      range,
      label: (i) => String(i),
      position: "top",
    });
    assert.equal(entries.length, 3);
    setRange([0, 5]);
    assert.equal(entries.length, 6);
    cleanup();
  });
});
