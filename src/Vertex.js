const {h, Component} = require('preact')
const classnames = require('classnames')

class Vertex extends Component {
    render() {
        let {position: [x, y], shift, random, sign, highlight, heat,
            paint, dimmed, hoshi, animate, marker, ghostStone, fieldSize} = this.props

        return h('li',
            {
                'data-vertex': `${x}-${y}`,
                style: {
                    width: fieldSize,
                    height: fieldSize
                },
                class: classnames(
                    `pos_${x}-${y}`,
                    `shift_${shift}`,
                    `random_${random}`,
                    `sign_${sign}`,
                    {
                        [`heat_${heat}`]: !!heat,
                        [`paint_${paint}`]: !!paint,
                        dimmed,
                        hoshi,
                        animate,
                        highlight
                    },

                    marker && marker.type,
                    marker && marker.label && marker.label.length >= 3 && 'smalllabel',
                    ghostStone && ghostStone.type,
                    ghostStone && `ghost_${ghostStone.sign}`
                ),

                onMouseDown: this.props.onMouseDown,
                onMouseUp: this.props.onMouseUp,
                onMouseMove: this.props.onMouseMove
            },
            
            h('div', {class: 'heat'}),

            h('div', {class: 'stone'},
                h('img', {
                    // Blank image
                    alt: sign,
                    src: 'data:image/svg+xml;base64,'
                        + 'PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaH'
                        + 'R0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='
                })
            ),

            h('div', {class: 'marker'}, marker && marker.label && h('span', {title: marker.label})),
            h('div', {class: 'ghost'}),
            !!paint && h('div', {class: 'paint'}),
            highlight && h('div', {class: 'highlight'})
        )
    }
}

module.exports = Vertex
