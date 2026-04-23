import "../src/main.ts";
import type {
  GridLayer,
  Goban,
  StoneLayer,
  MarkerLayer,
  StoneIndicatorLayer,
  LineLayer,
  HeatLayer,
  PaintLayer,
  HoverStoneLayer,
  LayerGroup,
} from "../src/main.ts";

const goban = document.querySelector<Goban>("shudan-goban")!;
const stones = goban.querySelector<StoneLayer>("shudan-goban .stones")!.stones;

goban.addEventListener("focused-vertex-change", (evt) => {
  console.log(evt);
});

goban.addEventListener("vertex-click", (evt) => {
  console.log(evt);
});

document
  .querySelector<HTMLInputElement>("input.interactive")!
  .addEventListener("change", (event) => {
    goban.interactive = (event.target! as HTMLInputElement).checked;
  });

document
  .querySelector<HTMLInputElement>("input.coordinates")!
  .addEventListener("change", (event) => {
    goban.coords = (event.target! as HTMLInputElement).checked;
  });

document
  .querySelector<HTMLInputElement>("input.alt-coordinates")!
  .addEventListener("change", (event) => {
    const chineseCoord = [
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
      "十一",
      "十二",
      "十三",
      "十四",
      "十五",
      "十六",
      "十七",
      "十八",
      "十九",
    ];

    goban.coordX = (event.target! as HTMLInputElement).checked
      ? (i) => chineseCoord[i]
      : undefined;
    goban.coordY = (event.target! as HTMLInputElement).checked
      ? (i) => (19 - i).toString()
      : undefined;
    goban.classList.toggle(
      "smallcoord",
      (event.target! as HTMLInputElement).checked,
    );
  });

document
  .querySelector<HTMLInputElement>("input.partial")!
  .addEventListener("change", (event) => {
    goban.partial = (event.target! as HTMLInputElement).checked
      ? "J7:T1"
      : undefined;
  });

document
  .querySelector<HTMLInputElement>("input.grid")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<GridLayer>("shudan-goban .grid")!;

    layer.style.display = (event.target! as HTMLInputElement).checked
      ? "block"
      : "none";
  });

document
  .querySelector<HTMLInputElement>("input.stones")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<StoneLayer>("shudan-goban .stones")!;

    layer.stones = (event.target! as HTMLInputElement).checked ? stones : {};
  });

document
  .querySelector<HTMLInputElement>("input.dead")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<StoneLayer>("shudan-goban .stones")!;

    layer.dimmedStones = (event.target! as HTMLInputElement).checked
      ? ["C6", "C5", "F6", "G6", "K16", "K14", "L14", "P12", "O6", "O5", "T6"]
      : [];
  });

document
  .querySelector<HTMLInputElement>("input.hover")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<HoverStoneLayer>("shudan-goban .hover")!;

    layer.style.display = (event.target! as HTMLInputElement).checked
      ? "block"
      : "none";
  });

document
  .querySelector<HTMLInputElement>("input.markers")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<LayerGroup>("shudan-goban .markers")!;

    layer.style.display = (event.target! as HTMLInputElement).checked
      ? "block"
      : "none";
  });

document
  .querySelector<HTMLInputElement>("input.stone-indicator")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<StoneIndicatorLayer>(
      "shudan-goban .stone-indicator",
    )!;

    layer.style.display = (event.target! as HTMLInputElement).checked
      ? "block"
      : "none";
  });

document
  .querySelector<HTMLInputElement>("input.heat")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<HeatLayer>("shudan-goban .heat")!;

    layer.style.opacity = (event.target! as HTMLInputElement).checked
      ? "1"
      : "0";
  });

document
  .querySelector<HTMLInputElement>("input.custom")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<StoneLayer>("shudan-goban .stones")!;

    layer.noShadows = (event.target! as HTMLInputElement).checked;
    layer.blackStoneHref = (event.target! as HTMLInputElement).checked
      ? "#custom-black-stone"
      : undefined;
    layer.whiteStoneHref = (event.target! as HTMLInputElement).checked
      ? "#custom-white-stone"
      : undefined;
  });

document
  .querySelector<HTMLInputElement>("input.line")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<LayerGroup>("shudan-goban .line")!;

    layer.style.display = (event.target! as HTMLInputElement).checked
      ? "block"
      : "none";
  });

document
  .querySelector<HTMLInputElement>("input.territory")!
  .addEventListener("change", (event) => {
    const layer = goban.querySelector<LayerGroup>("shudan-goban .territory")!;

    layer.style.opacity = (event.target! as HTMLInputElement).checked
      ? "1"
      : "0";
  });

document
  .querySelector<HTMLInputElement>("input.selection")!
  .addEventListener("change", (event) => {
    const selectionLayers = goban.querySelectorAll<PaintLayer>(
      "shudan-goban .selection",
    );

    selectionLayers.forEach((layer) => {
      layer.style.opacity = (event.target! as HTMLInputElement).checked
        ? "1"
        : "0";
    });
  });

document
  .querySelector<HTMLButtonElement>("button.zoomin")!
  .addEventListener("click", () => {
    goban.vertexSize = +goban.vertexSize! + 4;
  });

document
  .querySelector<HTMLButtonElement>("button.zoomout")!
  .addEventListener("click", () => {
    goban.vertexSize = Math.max(+goban.vertexSize! - 4, 4);
  });
