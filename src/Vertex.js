const {h, Component} = require('preact')
const classnames = require('classnames')

class Vertex extends Component {
    render() {
        let {position: [x, y], shift, random, sign, highlight, heat,
            paint, dimmed, hoshi, animate, marker, ghostStone} = this.props

        return h('div',
            {
                'data-vertex': `${x}-${y}`,
                style: {
                    width: '1em',
                    height: '1em'
                },
                class: classnames(
                    'vertex',
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
            
            h('div', {class: 'board'}),
            hoshi && h('div', {class: 'hoshi'}),

            h('div', {class: 'ghost'}),
            h('div', {class: 'stone'}, 
                h('div', {class: 'shadow'}),
                h('div', {class: 'inner'}, sign),
                h('div', {class: 'marker'}, marker && marker.label && h('span', {title: marker.label}))
            ),

            !!paint && h('div', {class: 'paint'}),
            highlight && h('div', {class: 'highlight'}),
            h('div', {class: 'heat'})
        )
    }
}

module.exports = Vertex
