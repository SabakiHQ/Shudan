const {h, Component} = require('preact')
const classnames = require('classnames')

class Vertex extends Component {
    shouldComponentUpdate(nextProps) {
        for (let i in nextProps)
            if (nextProps[i] !== this.props[i]) return true

        return false
    }

    render({
        position: [x, y],
        shift,
        random,
        sign,
        highlight,
        heat,
        paint,
        dimmed,
        hoshi,
        animate,
        markupType,
        label,
        ghostTypes,

        onMouseDown,
        onMouseUp,
        onMouseMove
    }) {
        return h('li',
            {
                'data-vertex': `${x}-${y}`,
                class: classnames(
                    `pos_${x}-${y}`,
                    `shift_${shift}`,
                    `random_${random}`,
                    `sign_${sign}`,
                    {
                        [`heat_${heat}`]: !!heat,
                        [`paint_${paint}`]: !!paint,
                        [markupType]: !!markupType,
                        dimmed,
                        hoshi,
                        animate,
                        smalllabel: label.length >= 3
                    },

                    ...ghostTypes
                ),

                onMouseDown,
                onMouseUp,
                onMouseMove
            },
            
            h('div', {class: 'heat'}),

            h('div', {class: 'stone'},
                h('img', {
                    // Blank image
                    src: 'data:image/svg+xml;base64,'
                        + 'PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaH'
                        + 'R0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='
                }),
                h('span', {title: label}),
            ),

            !!paint && h('div', {class: 'paint'}),
            highlight && h('div', {class: 'highlight'})
        )
    }
}

module.exports = Vertex
