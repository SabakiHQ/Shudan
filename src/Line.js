const {createElement: h, Component} = require('preact')
const {vertexEquals} = require('./helper')

class Line extends Component {
    shouldComponentUpdate(nextProps) {
        let {v1, v2, type, vertexSize} = this.props

        return type !== nextProps.type
            || vertexSize !== nextProps.vertexSize
            || !vertexEquals(v1, nextProps.v1)
            || !vertexEquals(v2, nextProps.v2)
    }

    render() {
        let {v1, v2, type = 'line', vertexSize} = this.props
        if (vertexEquals(v1, v2)) return

        let [pos1, pos2] = [v1, v2].map(v => v.map(x => x * vertexSize))
        let [dx, dy] = pos1.map((x, i) => pos2[i] - x)
        let [left, top] = pos1.map((x, i) => (x + pos2[i] + vertexSize) / 2)

        let angle = Math.atan2(dy, dx) * 180 / Math.PI
        let length = Math.sqrt(dx * dx + dy * dy)

        return h('div', {
            className: `shudan-${type}`,
            style: {
                position: 'absolute',
                left, top,
                margin: 0,
                width: length,
                transform: `translateX(${-length / 2}px) rotate(${angle}deg)`
            }
        })
    }
}

module.exports = Line
