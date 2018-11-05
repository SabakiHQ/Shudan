const {createElement: h, Component} = require('preact')

class Grid extends Component {
    constructor() {
        super()
    }

    componentWillUpdate(nextProps) {
        return nextProps.width !== this.props.width
            || nextProps.height !== this.props.height
            || nextProps.xs.length !== this.props.xs.length
            || nextProps.ys.length !== this.props.ys.length
            || nextProps.xs[0] !== this.props.xs[0]
            || nextProps.ys[0] !== this.props.ys[0]
    }

    render() {
        let {width, height, xs, ys, hoshis} = this.props

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

            ys.map((_, i) => h('line', {
                x1: xs[0] === 0 ? '.5em' : '0',
                y1: `${i + .5}em`,
                x2: xs[xs.length - 1] === width - 1 ? `${xs.length - .5}em` : `${xs.length}em`,
                y2: `${i + .5}em`,
                'shape-rendering': 'crispEdges'
            })),

            xs.map((_, i) => h('line', {
                x1: `${i + .5}em`,
                y1: ys[0] === 0 ? '.5em' : '0',
                x2: `${i + .5}em`,
                y2: ys[ys.length - 1] === height - 1 ? `${ys.length - .5}em` : `${ys.length}em`,
                'shape-rendering': 'crispEdges'
            })),

            // Draw hoshi points

            hoshis.map(([x, y]) => {
                let i = xs.indexOf(x)
                let j = ys.indexOf(y)
                if (i < 0 || j < 0) return

                return h('circle', {
                    cx: `${i + .5}em`,
                    cy: `${j + .5}em`,
                    r: '.1em'
                })
            })
        )
    }
}

module.exports = Grid
