import { createElement as h, Component } from "preact";
import Goban from "./Goban.js";

export default class BoundedGoban extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertexSize: 1,
      visibility: "hidden",
    };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate(prevProps) {
    let {
      showCoordinates,
      maxWidth,
      maxHeight,
      maxVertexSize,
      rangeX,
      rangeY,
      signMap,
      onResized = () => {},
    } = this.props;

    if (
      this.state.visibility !== "visible" ||
      showCoordinates !== prevProps.showCoordinates ||
      maxWidth !== prevProps.maxWidth ||
      maxHeight !== prevProps.maxHeight ||
      maxVertexSize !== prevProps.maxVertexSize ||
      JSON.stringify(rangeX) !== JSON.stringify(prevProps.rangeX) ||
      JSON.stringify(rangeY) !== JSON.stringify(prevProps.rangeY) ||
      signMap.length !== prevProps.signMap.length ||
      (signMap[0] || []).length !== (prevProps.signMap[0] || []).length
    ) {
      let { offsetWidth, offsetHeight } = this.element;
      let scale = Math.min(maxWidth / offsetWidth, maxHeight / offsetHeight);
      let vertexSize = Math.max(Math.floor(this.state.vertexSize * scale), 1);

      if (this.state.vertexSize !== vertexSize) {
        this.setState({ vertexSize }, onResized);
      }

      if (this.state.visibility !== "visible") {
        this.setState({ visibility: "visible" });
      }
    }
  }

  render() {
    let { innerProps = {}, style = {}, maxVertexSize = Infinity } = this.props;
    let { ref: innerRef = () => {} } = innerProps;

    return h(Goban, {
      ...this.props,

      innerProps: {
        ...innerProps,
        ref: (el) => (innerRef(el), (this.element = el)),
      },

      style: {
        visibility: this.state.visibility,
        ...style,
      },

      vertexSize: Math.min(this.state.vertexSize, maxVertexSize),
    });
  }
}
