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
                    position: 'relative'
                },
                className: classnames(
                    'vertex',
                    types,

                    `pos_${x}-${y}`,
                    `random_${random}`,
                    `sign_${sign}`,
                    {
                        [`shift_${shift}`]: !!shift,
                        [`heat_${heat}`]: !!heat,
                        [`paint_${paint}`]: !!paint,
                        dimmed,
                        animate,
                        selected
                    },

                    marker && marker.type && `marker_${marker.type}`,
                    marker && marker.label && marker.label.length >= 3 && `smalllabel`,
                    
                    !sign && ghostStone && `ghost_${ghostStone.sign}`,
                    !sign && ghostStone && ghostStone.types && ghostStone.types.map(t => t && `ghost_${t}`)
                ),

                onMouseDown: this.props.onMouseDown,
                onMouseUp: this.props.onMouseUp,
                onMouseMove: this.props.onMouseMove
            },

            h('div', {key: 'board', className: 'board', style: absoluteStyle(1)}),
            hoshi && h('div', {key: 'hoshi', className: 'hoshi', style: absoluteStyle(2)}),
            
            h('div', {key: 'stone', className: 'stone', style: absoluteStyle(3)},
                !!sign && h('div', {key: 'shadow', className: 'shadow', style: absoluteStyle(1)}),
                !!sign && h('div', {key: 'inner', className: 'inner', style: absoluteStyle(2)}, sign),
                
                !!marker && h('div', {
                    key: 'marker',
                    className: 'marker',
                    title: marker.label,
                    style: absoluteStyle(3)
                })
            ),

            !sign && !!ghostStone && h('div', {key: 'ghost', className: 'ghost', style: absoluteStyle(4)}),
            !!paint && h('div', {key: 'paint', className: 'paint', style: absoluteStyle(5)}),
            !!selected && h('div', {key: 'selection', className: 'selection', style: absoluteStyle(6)}),
            h('div', {key: 'heat', className: 'heat', style: absoluteStyle(7)})
        )
    }
}

module.exports = Vertex
