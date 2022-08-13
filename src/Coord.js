import { createElement as h } from "preact";
import { alpha } from "./helper.js";

export function CoordX({
  style,
  xs,
  coordX = (i) => alpha[i] || alpha[alpha.length - 1],
}) {
  return h(
    "div",
    {
      className: "shudan-coordx",
      style: {
        display: "flex",
        textAlign: "center",
        ...style,
      },
    },

    xs.map((i) =>
      h(
        "div",
        { key: i, style: { width: "1em" } },
        h("span", { style: { display: "block" } }, coordX(i))
      )
    )
  );
}

export function CoordY({ style, height, ys, coordY = (i) => height - i }) {
  return h(
    "div",
    {
      className: "shudan-coordy",
      style: {
        textAlign: "center",
        ...style,
      },
    },

    ys.map((i) =>
      h(
        "div",
        { key: i, style: { height: "1em" } },
        h("span", { style: { display: "block" } }, coordY(i))
      )
    )
  );
}
