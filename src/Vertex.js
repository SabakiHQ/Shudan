import { createElement as h } from "preact";
import { useCallback } from "preact/hooks";
import classnames from "classnames";

import { avg, vertexEvents, signEquals } from "./helper.js";
import Marker from "./Marker.js";

const absoluteStyle = (zIndex) => ({
  position: "absolute",
  zIndex,
});

export default function Vertex(props) {
  let {
    position,
    shift,
    random,
    sign,
    heat,
    paint,
    paintLeft,
    paintRight,
    paintTop,
    paintBottom,
    paintTopLeft,
    paintTopRight,
    paintBottomLeft,
    paintBottomRight,
    dimmed,
    marker,
    ghostStone,
    animate,
    selected,
    selectedLeft,
    selectedRight,
    selectedTop,
    selectedBottom,
  } = props;

  let eventHandlers = {};

  for (let eventName of vertexEvents) {
    eventHandlers[eventName] = useCallback(
      (evt) => {
        props[`on${eventName}`]?.(evt, position);
      },
      [...position, props[`on${eventName}`]]
    );
  }

  let markerMarkup = (zIndex) =>
    !!marker &&
    h(Marker, {
      key: "marker",
      sign,
      type: marker.type,
      label: marker.label,
      zIndex,
    });

  return h(
    "div",
    Object.assign(
      {
        "data-x": position[0],
        "data-y": position[1],

        title: marker?.label,
        style: {
          position: "relative",
        },
        className: classnames(
          "shudan-vertex",
          `shudan-random_${random}`,
          `shudan-sign_${sign}`,

          {
            [`shudan-shift_${shift}`]: !!shift,
            [`shudan-heat_${!!heat && heat.strength}`]: !!heat,
            "shudan-dimmed": dimmed,

            [`shudan-paint_${paint > 0 ? 1 : -1}`]: !!paint,
            "shudan-paintedleft":
              !!paint && Math.sign(paintLeft) === Math.sign(paint),
            "shudan-paintedright":
              !!paint && Math.sign(paintRight) === Math.sign(paint),
            "shudan-paintedtop":
              !!paint && Math.sign(paintTop) === Math.sign(paint),
            "shudan-paintedbottom":
              !!paint && Math.sign(paintBottom) === Math.sign(paint),

            "shudan-selected": selected,
            "shudan-selectedleft": selectedLeft,
            "shudan-selectedright": selectedRight,
            "shudan-selectedtop": selectedTop,
            "shudan-selectedbottom": selectedBottom,
            "shudan-animate": animate,
          },

          marker && marker.type && `shudan-marker_${marker.type}`,
          marker &&
            marker.type === "label" &&
            marker.label &&
            (marker.label.includes("\n") || marker.label.length >= 3) &&
            `shudan-smalllabel`,

          ghostStone && `shudan-ghost_${ghostStone.sign}`,
          ghostStone && ghostStone.type && `shudan-ghost_${ghostStone.type}`,
          ghostStone && ghostStone.faint && `shudan-ghost_faint`
        ),
      },
      ...vertexEvents.map((eventName) => ({
        [`on${eventName}`]: eventHandlers[eventName],
      }))
    ),

    !sign && markerMarkup(0),
    !sign &&
      !!ghostStone &&
      h("div", {
        key: "ghost",
        className: "shudan-ghost",
        style: absoluteStyle(1),
      }),

    h(
      "div",
      { key: "stone", className: "shudan-stone", style: absoluteStyle(2) },

      !!sign &&
        h("div", {
          key: "shadow",
          className: "shudan-shadow",
          style: absoluteStyle(),
        }),

      !!sign &&
        h(
          "div",
          {
            key: "inner",
            className: classnames(
              "shudan-inner",
              "shudan-stone-image",
              `shudan-random_${random}`,
              `shudan-sign_${sign}`
            ),
            style: absoluteStyle(),
          },
          sign
        ),

      !!sign && markerMarkup()
    ),

    (!!paint || !!paintLeft || !!paintRight || !!paintTop || !!paintBottom) &&
      h(
        "div",
        {
          key: "paint",
          className: "shudan-paint",
          style: absoluteStyle(3),
        },

        h("div", {
          className: "shudan-inner",
          style: {
            ...absoluteStyle(),
            opacity: avg(
              (!!paint
                ? [paint]
                : [paintLeft, paintRight, paintTop, paintBottom].map(
                    (x) => x !== 0 && !isNaN(x)
                  )
              ).map((x) => Math.abs(x ?? 0) * 0.5)
            ),
            boxShadow: [
              signEquals(paintLeft, paintTop, paintTopLeft)
                ? [Math.sign(paintTop), "-.5em -.5em"]
                : null,
              signEquals(paintRight, paintTop, paintTopRight)
                ? [Math.sign(paintTop), ".5em -.5em"]
                : null,
              signEquals(paintLeft, paintBottom, paintBottomLeft)
                ? [Math.sign(paintBottom), "-.5em .5em"]
                : null,
              signEquals(paintRight, paintBottom, paintBottomRight)
                ? [Math.sign(paintBottom), ".5em .5em"]
                : null,
            ]
              .filter((x) => !!x && x[0] !== 0)
              .map(
                ([sign, translation]) =>
                  `${translation} 0 0 var(${
                    sign > 0
                      ? "--shudan-black-background-color"
                      : "--shudan-white-background-color"
                  })`
              )
              .join(","),
          },
        })
      ),

    !!selected &&
      h("div", {
        key: "selection",
        className: "shudan-selection",
        style: absoluteStyle(4),
      }),

    h("div", {
      key: "heat",
      className: "shudan-heat",
      style: absoluteStyle(5),
    }),
    !!heat &&
      h(
        "div",
        {
          key: "heatlabel",
          className: "shudan-heatlabel",
          style: absoluteStyle(6),
        },
        heat.text && heat.text.toString()
      )
  );
}
