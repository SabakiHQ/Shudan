const { createElement: h, Component } = require("preact");
const { vertexEquals } = require("./helper");

class Line extends Component {
  shouldComponentUpdate(nextProps) {
    let { v1, v2, type, vertexSize } = this.props;

    return (
      type !== nextProps.type ||
      vertexSize !== nextProps.vertexSize ||
      !vertexEquals(v1, nextProps.v1) ||
      !vertexEquals(v2, nextProps.v2)
    );
  }

  render() {
    let { v1, v2, type = "line", vertexSize } = this.props;
    if (vertexEquals(v1, v2)) return;

    let [pos1, pos2] = [v1, v2].map((v) => v.map((x) => x * vertexSize));
    let [dx, dy] = pos1.map((x, i) => pos2[i] - x);
    let [left, top] = pos1.map((x, i) => (x + pos2[i] + vertexSize) / 2);

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    let length = Math.sqrt(dx * dx + dy * dy);
    let right = left + length;

    return h("path", {
      className: `shudan-${type}`,
      d: `M ${left} ${top} h ${length} ${
        type === "arrow"
          ? (() => {
              let [x1, y1] = [right - vertexSize / 2, top - vertexSize / 4];
              let [x2, y2] = [right - vertexSize / 2, top + vertexSize / 4];

              return `L ${x1} ${y1} M ${right} ${top} L ${x2} ${y2}`;
            })()
          : ""
      }`,
      transform: `rotate(${angle} ${left} ${top}) translate(${-length / 2} 0)`,
    });
  }
}

module.exports = Line;
