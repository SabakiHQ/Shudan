const { createElement: h, Component } = require("preact");
const classnames = require("classnames");
const { avg, vertexEvents } = require("./helper");

const absoluteStyle = (zIndex) => ({
  position: "absolute",
  zIndex,
});

function Marker(props) {
  let { sign, marker, zIndex: z } = props;

  return !marker
    ? null
    : marker.type === "label"
    ? h(
        "div",
        {
          className: "shudan-marker",
          style: absoluteStyle(z),
        },
        marker.label
      )
    : h(
        "svg",
        {
          className: "shudan-marker",
          viewBox: "0 0 1 1",
          style: absoluteStyle(z),
        },

        marker.type === "circle" ||
          marker.type === "loader" ||
          marker.type === "point"
          ? h("circle", {
              cx: 0.5,
              cy: 0.5,
              r: marker.type === "point" ? 0.18 : 0.25,
              "vector-effect": "non-scaling-stroke",
            })
          : marker.type === "square"
          ? h("rect", {
              x: 0.25,
              y: 0.25,
              width: 0.5,
              height: 0.5,
              "vector-effect": "non-scaling-stroke",
            })
          : marker.type === "cross"
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
          : marker.type === "triangle"
          ? h("path", {
              d: "M 0 .5 L .6 .5 L .3 0 z",
              transform: "translate(.2 .2)",
              "vector-effect": "non-scaling-stroke",
            })
          : null
      );
}

class Vertex extends Component {
  constructor(props) {
    super(props);

    for (let e of vertexEvents) {
      this[`handle${e}`] = (evt) => {
        let handler = this.props[`on${e}`] || (() => {});
        handler(evt, this.props.position);
      };
    }
  }

  render() {
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
    } = this.props;

    let markerMarkup = (zIndex) =>
      h(Marker, {
        key: "marker",
        sign,
        marker,
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
          [`on${eventName}`]: this[`handle${eventName}`],
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
                      (x) => !isNaN(x)
                    )
                ).map((x) => Math.abs(x ?? 0) * 0.5)
              ),
              boxShadow: [
                Math.sign(paintLeft) === Math.sign(paintTop) &&
                Math.sign(paintTop) === Math.sign(paintTopLeft)
                  ? [Math.sign(paintTop), "-.5em -.5em"]
                  : null,
                Math.sign(paintRight) === Math.sign(paintTop) &&
                Math.sign(paintTop) === Math.sign(paintTopRight)
                  ? [Math.sign(paintTop), ".5em -.5em"]
                  : null,
                Math.sign(paintLeft) === Math.sign(paintBottom) &&
                Math.sign(paintBottom) === Math.sign(paintBottomLeft)
                  ? [Math.sign(paintBottom), "-.5em .5em"]
                  : null,
                Math.sign(paintRight) === Math.sign(paintBottom) &&
                Math.sign(paintBottom) === Math.sign(paintBottomRight)
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
}

module.exports = Vertex;
