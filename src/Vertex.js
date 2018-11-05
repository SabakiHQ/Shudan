const {createElement: h, Component} = require('preact')
const classnames = require('classnames')
const {vertexEvents} = require('./helper')

const absoluteStyle = zIndex => ({
    position: 'absolute',
    zIndex
})

class Vertex extends Component {
    constructor(props) {
        super(props)

        for (let e of vertexEvents) {
            this[`handle${e}`] = evt => {
                let handler = this.props[`on${e}`] || (() => {})
                handler(evt, this.props.position)
            }
        }
    }

    render() {
        let {shift, random, sign, selected, heat,
            paint, dimmed, marker, ghostStone, animate} = this.props

        return h('div',
            Object.assign({
                style: {
                    position: 'relative'
                },
                className: classnames(
                    'shudan-vertex',
                    `shudan-random_${random}`,
                    `shudan-sign_${sign}`,

                    {
                        [`shudan-shift_${shift}`]: !!shift,
                        [`shudan-heat_${!!heat && heat.strength}`]: !!heat,
                        [`shudan-paint_${paint}`]: !!paint,
                        'shudan-dimmed': dimmed,
                        'shudan-selected': selected,
                        'shudan-animate': animate
                    },

                    marker && marker.type && `shudan-marker_${marker.type}`,
                    marker && marker.type === 'label'
                        && marker.label
                        && (marker.label.includes('\n') || marker.label.length >= 3)
                        && `shudan-smalllabel`,

                    ghostStone && `shudan-ghost_${ghostStone.sign}`,
                    ghostStone && ghostStone.type && `shudan-ghost_${ghostStone.type}`,
                    ghostStone && ghostStone.faint && `shudan-ghost_faint`
                )
            }, ...vertexEvents.map(eventName => ({
                [`on${eventName}`]: this[`handle${eventName}`]
            }))),

            h('div', {key: 'stone', className: 'shudan-stone', style: absoluteStyle()},
                h('div', {key: 'shadow', className: 'shudan-shadow', style: absoluteStyle(1)}),
                h('div', {
                    key: 'inner',
                    className: classnames(
                        'shudan-inner',
                        'shudan-stone-image',
                        `shudan-random_${random}`,
                        `shudan-sign_${sign}`,
                    ),
                    style: absoluteStyle(2)
                }, sign),

                !!marker && h('div', {
                    key: 'marker',
                    className: 'shudan-marker',
                    title: marker.label,
                    style: absoluteStyle(!sign ? 0 : 3)
                })
            ),

            !sign && !!ghostStone && h('div', {key: 'ghost', className: 'shudan-ghost', style: absoluteStyle(4)}),
            !!paint && h('div', {key: 'paint', className: 'shudan-paint', style: absoluteStyle(5)}),
            !!selected && h('div', {key: 'selection', className: 'shudan-selection', style: absoluteStyle(6)}),

            h('div', {key: 'heat', className: 'shudan-heat', style: absoluteStyle(7)}),
            !!heat && h('div', {
                key: 'heatlabel',
                className: 'shudan-heatlabel',
                style: absoluteStyle(8)
            }, heat.text && heat.text.toString())
        )
    }
}

module.exports = Vertex
