const {h, Component} = require('preact')
const classnames = require('classnames')
const {vertexEquals} = require('./helper')

class Line extends Component {
    shouldComponentUpdate(nextProps) {
        let {v1, v2, type, fieldSize} = this.props

        return type !== nextProps.type
            || fieldSize !== nextProps.fieldSize
            || !vertexEquals(v1, nextProps.v1)
            || !vertexEquals(v2, nextProps.v2)
    }

    render() {
        let {v1, v2, type, fieldSize} = this.props
        if (vertexEquals(v1, v2)) return

        let [pos1, pos2] = [v1, v2].map(v => v.map(x => x * fieldSize))
        let [dx, dy] = pos1.map((x, i) => pos2[i] - x)
        let [left, top] = pos1.map((x, i) => (x + pos2[i] + fieldSize) / 2)

        let angle = Math.atan2(dy, dx) * 180 / Math.PI
        let length = Math.sqrt(dx * dx + dy * dy)

        return h('hr', {
            class: type,
            style: {
                width: length,
                transform: [
                    `translate(${left - length / 2}px, ${top}px)`,
                    `rotate(${angle}deg)`
                ].join(' ')
            }
        })
    }
}

module.exports = Line
