import { createElement as h, Component } from "preact";
import classnames from "classnames";

import {
  random,
  readjustShifts,
  neighborhood,
  vertexEquals,
  vertexEvents,
  diffSignMap,
  range,
  getHoshis,
} from "./helper.js";
import { CoordX, CoordY } from "./Coord.js";
import Grid from "./Grid.js";
import Vertex from "./Vertex.js";
import Line from "./Line.js";

export default class Goban extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidUpdate() {
    if (
      this.props.animateStonePlacement &&
      !this.state.clearAnimatedVerticesHandler &&
      this.state.animatedVertices.length > 0
    ) {
      // Handle stone animation

      for (let [x, y] of this.state.animatedVertices) {
        this.state.shiftMap[y][x] = random(7) + 1;
        readjustShifts(this.state.shiftMap, [x, y]);
      }

      this.setState({ shiftMap: this.state.shiftMap });

      // Clear animation classes

      this.setState({
        clearAnimatedVerticesHandler: setTimeout(() => {
          this.setState({
            animatedVertices: [],
            clearAnimatedVerticesHandler: null,
          });
        }, this.props.animationDuration ?? 200),
      });
    }
  }

  render() {
    let { width, height, rangeX, rangeY, xs, ys, hoshis, shiftMap, randomMap } =
      this.state;

    let {
      innerProps = {},
      vertexSize = 24,
      coordX,
      coordY,
      busy,
      signMap,
      paintMap,
      heatMap,
      markerMap,
      ghostStoneMap,
      fuzzyStonePlacement = false,
      showCoordinates = false,
      lines = [],
      selectedVertices = [],
      dimmedVertices = [],
    } = this.props;

    let animatedVertices = [].concat(
      ...this.state.animatedVertices.map(neighborhood)
    );

    return h(
      "div",
      {
        ...innerProps,
        id: this.props.id,
        className: classnames(
          "shudan-goban",
          "shudan-goban-image",
          {
            "shudan-busy": busy,
            "shudan-coordinates": showCoordinates,
          },
          this.props.class ?? this.props.className
        ),
        style: {
          display: "inline-grid",
          gridTemplateRows: showCoordinates ? "1em 1fr 1em" : "1fr",
          gridTemplateColumns: showCoordinates ? "1em 1fr 1em" : "1fr",
          fontSize: vertexSize,
          lineHeight: "1em",
          ...(this.props.style ?? {}),
        },
      },

      showCoordinates &&
        h(CoordX, { xs, style: { gridRow: "1", gridColumn: "2" }, coordX }),
      showCoordinates &&
        h(CoordY, {
          height,
          ys,
          style: { gridRow: "2", gridColumn: "1" },
          coordY,
        }),

      h(
        "div",
        {
          className: "shudan-content",
          style: {
            position: "relative",
            width: `${xs.length}em`,
            height: `${ys.length}em`,
            gridRow: showCoordinates ? "2" : "1",
            gridColumn: showCoordinates ? "2" : "1",
          },
        },

        h(Grid, {
          vertexSize,
          width,
          height,
          xs,
          ys,
          hoshis,
        }),

        h(
          "div",
          {
            className: "shudan-vertices",
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${xs.length}, 1em)`,
              gridTemplateRows: `repeat(${ys.length}, 1em)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            },
          },

          ys.map((y) =>
            xs.map((x) => {
              let equalsVertex = (v) => vertexEquals(v, [x, y]);
              let selected = selectedVertices.some(equalsVertex);

              return h(
                Vertex,
                Object.assign(
                  {
                    key: [x, y].join("-"),
                    position: [x, y],

                    shift: fuzzyStonePlacement ? shiftMap?.[y]?.[x] : 0,
                    random: randomMap?.[y]?.[x],
                    sign: signMap?.[y]?.[x],

                    heat: heatMap?.[y]?.[x],
                    marker: markerMap?.[y]?.[x],
                    ghostStone: ghostStoneMap?.[y]?.[x],
                    dimmed: dimmedVertices.some(equalsVertex),
                    animate: animatedVertices.some(equalsVertex),

                    paint: paintMap?.[y]?.[x],
                    paintLeft: paintMap?.[y]?.[x - 1],
                    paintRight: paintMap?.[y]?.[x + 1],
                    paintTop: paintMap?.[y - 1]?.[x],
                    paintBottom: paintMap?.[y + 1]?.[x],
                    paintTopLeft: paintMap?.[y - 1]?.[x - 1],
                    paintTopRight: paintMap?.[y - 1]?.[x + 1],
                    paintBottomLeft: paintMap?.[y + 1]?.[x - 1],
                    paintBottomRight: paintMap?.[y + 1]?.[x + 1],

                    selected,
                    selectedLeft:
                      selected &&
                      selectedVertices.some((v) => vertexEquals(v, [x - 1, y])),
                    selectedRight:
                      selected &&
                      selectedVertices.some((v) => vertexEquals(v, [x + 1, y])),
                    selectedTop:
                      selected &&
                      selectedVertices.some((v) => vertexEquals(v, [x, y - 1])),
                    selectedBottom:
                      selected &&
                      selectedVertices.some((v) => vertexEquals(v, [x, y + 1])),
                  },

                  ...vertexEvents.map((e) => ({
                    [`on${e}`]: this.props[`onVertex${e}`],
                  }))
                )
              );
            })
          )
        ),

        h(
          "svg",
          {
            className: "shudan-lines",
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
            },
          },

          h(
            "g",
            {
              transform: `translate(-${rangeX[0] * vertexSize} -${
                rangeY[0] * vertexSize
              })`,
            },

            lines.map(({ v1, v2, type }, i) =>
              h(Line, { key: i, v1, v2, type, vertexSize })
            )
          )
        )
      ),

      showCoordinates &&
        h(CoordY, {
          height,
          ys,
          style: { gridRow: "2", gridColumn: "3" },
          coordY,
        }),
      showCoordinates &&
        h(CoordX, { xs, style: { gridRow: "3", gridColumn: "2" }, coordX })
    );
  }
}

Goban.getDerivedStateFromProps = function (props, state) {
  let { signMap = [], rangeX = [0, Infinity], rangeY = [0, Infinity] } = props;

  let width = signMap.length === 0 ? 0 : signMap[0].length;
  let height = signMap.length;

  if (state.width === width && state.height === height) {
    let animatedVertices = state.animatedVertices;

    if (
      props.animateStonePlacement &&
      props.fuzzyStonePlacement &&
      state.clearAnimatedVerticesHandler == null
    ) {
      animatedVertices = diffSignMap(state.signMap, signMap);
    }

    let result = {
      signMap,
      animatedVertices,
    };

    if (
      !vertexEquals(state.rangeX, rangeX) ||
      !vertexEquals(state.rangeY, rangeY)
    ) {
      // Range changed

      Object.assign(result, {
        rangeX,
        rangeY,
        xs: range(width).slice(rangeX[0], rangeX[1] + 1),
        ys: range(height).slice(rangeY[0], rangeY[1] + 1),
      });
    }

    return result;
  }

  // Board size changed

  return {
    signMap,
    width,
    height,
    rangeX,
    rangeY,
    animatedVertices: [],
    clearAnimatedVerticesHandler: null,
    xs: range(width).slice(rangeX[0], rangeX[1] + 1),
    ys: range(height).slice(rangeY[0], rangeY[1] + 1),
    hoshis: getHoshis(width, height),
    shiftMap: readjustShifts(signMap.map((row) => row.map((_) => random(8)))),
    randomMap: signMap.map((row) => row.map((_) => random(4))),
  };
};
