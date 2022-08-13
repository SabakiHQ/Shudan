import { createElement as h } from "preact";

export default function Marker({ sign, type, label, zIndex }) {
  let containerProps = {
    className: "shudan-marker",
    style: {
      position: "absolute",
      zIndex,
    },
  };

  return type === "label"
    ? h("div", containerProps, label)
    : h(
        "svg",
        {
          ...containerProps,
          viewBox: "0 0 1 1",
        },

        type === "circle" || type === "loader" || type === "point"
          ? h("circle", {
              cx: 0.5,
              cy: 0.5,
              r: type === "point" ? 0.18 : 0.25,
              "vector-effect": "non-scaling-stroke",
            })
          : type === "square"
          ? h("rect", {
              x: 0.25,
              y: 0.25,
              width: 0.5,
              height: 0.5,
              "vector-effect": "non-scaling-stroke",
            })
          : type === "cross"
          ? [
              sign === 0 &&
                h("rect", {
                  x: 0.25,
                  y: 0.25,
                  width: 0.5,
                  height: 0.5,
                  stroke: "none",
                }),
              h("path", {
                d: "M 0 0 L .5 .5 M .5 0 L 0 .5",
                transform: "translate(.25 .25)",
                "vector-effect": "non-scaling-stroke",
              }),
            ]
          : type === "triangle"
          ? h("path", {
              d: "M 0 .5 L .6 .5 L .3 0 z",
              transform: "translate(.2 .2)",
              "vector-effect": "non-scaling-stroke",
            })
          : null
      );
}
