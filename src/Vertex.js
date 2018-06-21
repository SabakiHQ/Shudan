const {h, Component} = require('preact')
const classnames = require('classnames')

const absoluteStyle = zIndex => ({
    position: 'absolute',
    zIndex
})

class Vertex extends Component {
    constructor(props) {
        super(props)

        let generateMouseHandler = prop => {
            return evt => {
                let handler = this.props[prop] || (() => {})
                handler(evt, this.props.position)
            }
        }

        this.handleMouseDown = generateMouseHandler('onMouseDown')
        this.handleMouseUp = generateMouseHandler('onMouseUp')
        this.handleMouseMove = generateMouseHandler('onMouseMove')
    }

    render() {
        let {position: [x, y], types, shift, random, sign, selected, heat,
            paint, dimmed, hoshi, marker, ghostStone, animate} = this.props

        return h('div',
            {
                'data-vertex': `${x}-${y}`,
                style: {
                    position: 'relative'
                },
                className: classnames(
                    'shudan-vertex',
                    types.map(x => `shudan-${x}`),

                    `shudan-pos_${x}-${y}`,
                    `shudan-random_${random}`,
                    `shudan-sign_${sign}`,
                    {
                        [`shudan-shift_${shift}`]: !!shift,
                        [`shudan-heat_${heat}`]: !!heat,
                        [`shudan-paint_${paint}`]: !!paint,
                        'shudan-dimmed': dimmed,
                        'shudan-selected': selected,
                        'shudan-animate': animate
                    },

                    marker && marker.type && `shudan-marker_${marker.type}`,
                    marker && marker.label && marker.label.length >= 3 && `shudan-smalllabel`,

                    !sign && ghostStone && `shudan-ghost_${ghostStone.sign}`,
                    !sign && ghostStone && ghostStone.types && ghostStone.types.map(t => t && `shudan-ghost_${t}`)
                ),

                onMouseDown: this.handleMouseDown,
                onMouseUp: this.handleMouseUp,
                onMouseMove: this.handleMouseMove
            },

            h('div', {key: 'board', className: 'shudan-board', style: absoluteStyle(1)}),
            hoshi && h('div', {key: 'hoshi', className: 'shudan-hoshi', style: absoluteStyle(2)}),

            h('div', {key: 'stone', className: 'shudan-stone', style: absoluteStyle(3)},
                !!sign && h('div', {key: 'shadow', className: 'shudan-shadow', style: absoluteStyle(1)}),
                !!sign && h('div', {key: 'inner', className: 'shudan-inner', style: absoluteStyle(2)}, sign),

                !!marker && h('div', {
                    key: 'marker',
                    className: 'shudan-marker',
                    title: marker.label,
                    style: absoluteStyle(3)
                })
            ),

            !sign && !!ghostStone && h('div', {key: 'ghost', className: 'shudan-ghost', style: absoluteStyle(4)}),
            !!paint && h('div', {key: 'paint', className: 'shudan-paint', style: absoluteStyle(5)}),
            !!selected && h('div', {key: 'selection', className: 'shudan-selection', style: absoluteStyle(6)}),
            h('div', {key: 'heat', className: 'shudan-heat', style: absoluteStyle(7)})
        )
    }
}

module.exports = Vertex
