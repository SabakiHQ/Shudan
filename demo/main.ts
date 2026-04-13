import "../src/main.ts";
import { type Goban, type StoneLayer } from "../src/main.ts";

const goban = document.querySelector("shudan-goban")! as Goban;
const { stones } = goban.querySelector("shudan-goban .stones")! as StoneLayer;
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
const deadStones = [
  "C6",
  "C5",
  "F6",
  "G6",
  "K16",
  "K14",
  "L14",
  "P12",
  "O6",
  "O5",
  "T6",
];

document
  .querySelector("input.interactive")!
  .addEventListener("change", (event) => {
    goban.interactive = event.target.checked;
  });

document.querySelector("input.hover")!.addEventListener("change", (event) => {
  goban.hover = event.target.checked;
});

document
  .querySelector("input.coordinates")!
  .addEventListener("change", (event) => {
    goban.coords = event.target.checked;
  });

document
  .querySelector("input.alt-coordinates")!
  .addEventListener("change", (event) => {
    goban.coordX = event.target.checked ? (i) => chineseCoord[i] : undefined;
    goban.coordY = event.target.checked ? (i) => 19 - i : undefined;
    goban.classList.toggle("smallcoord", event.target.checked);
  });

document.querySelector("input.partial")!.addEventListener("change", (event) => {
  goban.rangeX = event.target.checked ? [8, 18] : undefined;
  goban.rangeY = event.target.checked ? [0, 6] : undefined;
});

document.querySelector("input.grid")!.addEventListener("change", (event) => {
  const layer = goban.querySelector("shudan-goban .grid")!;

  layer.style.display = event.target.checked ? "block" : "none";
});

document.querySelector("input.stones")!.addEventListener("change", (event) => {
  const layer = goban.querySelector("shudan-goban .stones")!;

  layer.stones = event.target.checked ? stones : {};
});

document.querySelector("input.dead")!.addEventListener("change", (event) => {
  const layer = goban.querySelector("shudan-goban .stones")!;

  layer.dimmedStones = event.target.checked ? deadStones : [];
});

document.querySelector("input.markers")!.addEventListener("change", (event) => {
  const layers = goban.querySelectorAll("shudan-goban .markers")!;

  layers.forEach((layer) => {
    layer.style.display = event.target.checked ? "block" : "none";
  });
});

document
  .querySelector("input.ghost-stones")!
  .addEventListener("change", (event) => {
    const layers = goban.querySelectorAll("shudan-goban .ghost-stones")!;

    layers.forEach((layer) => {
      layer.style.display = event.target.checked ? "block" : "none";
    });
  });

document.querySelector("input.line")!.addEventListener("change", (event) => {
  const lineLayers = goban.querySelectorAll("shudan-goban .line")!;

  lineLayers.forEach((layer) => {
    layer.style.display = event.target.checked ? "block" : "none";
  });
});

document
  .querySelector("input.territory")!
  .addEventListener("change", (event) => {
    const territoryLayers = goban.querySelectorAll("shudan-goban .territory");
    territoryLayers.forEach((layer) => {
      layer.style.opacity = event.target.checked ? "1" : "0";
    });
  });

document.querySelector("input.heat")!.addEventListener("change", (event) => {
  const heatLayers = goban.querySelectorAll("shudan-goban .heat");

  heatLayers.forEach((layer) => {
    layer.style.opacity = event.target.checked ? "1" : "0";
  });
});

document
  .querySelector("input.selection")!
  .addEventListener("change", (event) => {
    const selectionLayers = goban.querySelectorAll("shudan-goban .selection");

    selectionLayers.forEach((layer) => {
      layer.style.opacity = event.target.checked ? "1" : "0";
    });
  });

document.querySelector("button.zoomin")!.addEventListener("click", () => {
  goban.vertexSize = +goban.vertexSize! + 4;
});

document.querySelector("button.zoomout")!.addEventListener("click", () => {
  goban.vertexSize = Math.max(+goban.vertexSize! - 4, 4);
});
