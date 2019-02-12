const {createElement: h, Component} = require('preact')

class Grid extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.vertexSize !== this.props.vertexSize
            || nextProps.width !== this.props.width
            || nextProps.height !== this.props.height
            || nextProps.xs.length !== this.props.xs.length
            || nextProps.ys.length !== this.props.ys.length
            || nextProps.xs[0] !== this.props.xs[0]
            || nextProps.ys[0] !== this.props.ys[0]
    }

    render() {
        let {vertexSize, width, height, xs, ys, hoshis} = this.props
        let halfVertexSize = vertexSize / 2
        let fl = Math.floor

        return xs.length > 0 && ys.length > 0 && h('svg',
            {
                className: 'shudan-grid',
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                }
            },

            // Draw grid lines

            ys.map((_, i) => {
                let x = xs[0] === 0 ? halfVertexSize : 0

                return h('rect', {
                    key: `h${i}`,

                    className: 'shudan-gridline shudan-horizontal',
                    x: fl(x),
                    y: fl((2 * i + 1) * halfVertexSize),
                    width: xs[xs.length - 1] === width - 1
                        ? fl((2 * xs.length - 1) * halfVertexSize - x)
                        : fl(xs.length * vertexSize - x),
                    height: 1
                })
            }),

            xs.map((_, i) => {
                let y = ys[0] === 0 ? halfVertexSize : 0

                return h('rect', {
                    key: `v${i}`,

                    className: 'shudan-gridline shudan-vertical',
                    x: fl((2 * i + 1) * halfVertexSize),
                    y: fl(y),
                    width: 1,
                    height: ys[ys.length - 1] === height - 1
                        ? fl((2 * ys.length - 1) * halfVertexSize - y)
                        : fl(ys.length * vertexSize - y)
                })
            }),

            // Draw hoshi points

            hoshis.map(([x, y]) => {
                let i = xs.indexOf(x)
                let j = ys.indexOf(y)
                if (i < 0 || j < 0) return

                return h('circle', {
                    key: [x, y].join('-'),

                    className: 'shudan-hoshi',
                    cx: fl((2 * i + 1) * halfVertexSize) + .5,
                    cy: fl((2 * j + 1) * halfVertexSize) + .5,
                    r: '.1em'
                })
            })
        )
    }
}

module.exports = Grid
