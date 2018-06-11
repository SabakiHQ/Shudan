const {h, Component} = require('preact')
const classnames = require('classnames')

const absoluteStyle = zIndex => ({
    position: 'absolute',
    zIndex
})

class Vertex extends Component {
    render() {
        let {position: [x, y], types, shift, random, sign, selected, heat,
            paint, dimmed, hoshi, animate, marker, ghostStone} = this.props

        return h('div',
            {
                'data-vertex': `${x}-${y}`,
                style: {
                    position: 'relative',
                    width: '1em',
                    height: '1em'
                },
                class: classnames(
                    'vertex',
                    types,

                    `pos_${x}-${y}`,
                    `random_${random}`,
                    `sign_${sign}`,
                    {
                        [`shift_${shift}`]: shift != null,
                        [`heat_${heat}`]: !!heat,
                        [`paint_${paint}`]: !!paint,
                        dimmed,
                        animate,
                        selected
                    },

                    marker && `marker_${marker.type}`,
                    marker && marker.label && marker.label.length >= 3 && `smalllabel`,
                    ghostStone && `ghost_${ghostStone.type}`,
                    ghostStone && `ghost_${ghostStone.sign}`
                ),

                onMouseDown: this.props.onMouseDown,
                onMouseUp: this.props.onMouseUp,
                onMouseMove: this.props.onMouseMove
            },

            h('div', {key: 'board', class: 'board', style: absoluteStyle(1)}),
            hoshi && h('div', {key: 'hoshi', class: 'hoshi', style: absoluteStyle(2)}),

            h('div', {key: 'ghost', class: 'ghost', style: absoluteStyle(3)}),
            h('div', {key: 'stone', class: 'stone', style: absoluteStyle(4)},
                h('div', {key: 'shadow', class: 'shadow', style: absoluteStyle(1)}),
                h('div', {key: 'inner', class: 'inner', style: absoluteStyle(2)}, sign),
                h('div', {key: 'marker', class: 'marker', title: marker && marker.label, style: absoluteStyle(3)})
            ),

            !!paint && h('div', {key: 'paint', class: 'paint', style: absoluteStyle(5)}),
            selected && h('div', {key: 'selection', class: 'selection', style: absoluteStyle(6)}),
            h('div', {key: 'heat', class: 'heat', style: absoluteStyle(7)})
        )
    }
}

module.exports = Vertex
