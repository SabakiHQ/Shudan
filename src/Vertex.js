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

  shouldComponentUpdate(nextProps) {
    return (
      this.props.shift !== nextProps.shift ||
      this.props.random !== nextProps.random ||
      this.props.sign !== nextProps.sign ||
      this.props.selected !== nextProps.selected ||
      this.props.heat !== nextProps.heat ||
      this.props.paint !== nextProps.paint ||
      this.props.dimmed !== nextProps.dimmed ||
      this.props.marker !== nextProps.marker ||
      this.props.ghostStone !== nextProps.ghostStone ||
      this.props.animate !== nextProps.animate ||
      this.props.vertexSize !== nextProps.vertexSize
    )
  }

  render() {
    let {
      position,
      shift,
      random,
      sign,
      heat,
      paint,
      dimmed,
      marker,
      ghostStone,
      animate,
      selected,
      selectedLeft,
      selectedRight,
      selectedTop,
      selectedBottom,
      allyLeft,
      allyRight,
      allyTop,
      allyBottom,
      allyTopLeft,
      allyTopRight,
      allyBottomLeft,
      allyBottomRight,
      vertexSize
    } = this.props

    let markerMarkup = z =>
      !!marker &&
      h('div', {
        key: 'marker',
        className: 'shudan-marker',
        title: marker.label,
        style: absoluteStyle(z)
      })

    function invertedRadiusStyleTop() {
        let borderRadius = [0, 0, 0, 0]
        if (allyLeft && allyBottomLeft && !allyBottom)
            borderRadius[0] = vertexSize / 4
        if (allyRight && allyBottomRight && !allyBottom)
            borderRadius[1] = vertexSize / 4;

        return borderRadius.join('px ') + 'px'
    }

    function invertedRadiusStyleBottom() {
        let borderRadius = [0, 0, 0, 0]
        if (allyRight && allyTopRight && !allyTop)
            borderRadius[2] = vertexSize / 4;
        if (allyLeft && allyTopLeft && !allyTop)
            borderRadius[3] = vertexSize / 4;

        return borderRadius.join('px ') + 'px'
    }

    return h(
      'div',
      Object.assign(
        {
          'data-x': position[0],
          'data-y': position[1],

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
              [`shudan-paint_${paint > 0 ? 1 : -1}`]: !!paint,
              'shudan-dimmed': dimmed,
              'shudan-selected': selected,
              'shudan-selectedleft': selectedLeft,
              'shudan-selectedright': selectedRight,
              'shudan-selectedtop': selectedTop,
              'shudan-selectedbottom': selectedBottom,
              'shudan-animate': animate
            },

            marker && marker.type && `shudan-marker_${marker.type}`,
            marker &&
              marker.type === 'label' &&
              marker.label &&
              (marker.label.includes('\n') || marker.label.length >= 3) &&
              `shudan-smalllabel`,

            ghostStone && `shudan-ghost_${ghostStone.sign}`,
            ghostStone && ghostStone.type && `shudan-ghost_${ghostStone.type}`,
            ghostStone && ghostStone.faint && `shudan-ghost_faint`
          )
        },
        ...vertexEvents.map(eventName => ({
          [`on${eventName}`]: this[`handle${eventName}`]
        }))
      ),

      !sign && markerMarkup(0),
      !sign &&
        !!ghostStone &&
        h('div', {
          key: 'ghost',
          className: 'shudan-ghost',
          style: absoluteStyle(1)
        }),

      h(
        'div',
        {key: 'stone', className: 'shudan-stone', style: absoluteStyle(2)},
        !!sign &&
          h('div', {
            key: 'shadow',
            className: 'shudan-shadow',
            style: absoluteStyle()
          }),
        !!sign &&
          h(
            'div',
            {
              key: 'inner',
              className: classnames(
                'shudan-inner',
                'shudan-stone-image',
                `shudan-random_${random}`,
                `shudan-sign_${sign}`
              ),
              style: absoluteStyle()
            },
            sign
          ),

        !!sign && markerMarkup()
      ),

    !!paint &&
    h('div', {},
        h('div', {
            key: 'paint',
            className: 'shudan-paint',
            style: {
                position: 'relative',
                ...absoluteStyle(3),
                opacity: Math.abs(paint || 0) * 0.5,
                borderRadius: `${(allyLeft || allyTop) ? 0 : 25}% ${(allyRight || allyTop) ? 0 : 25}%` +
                    ` ${(allyRight || allyBottom) ? 0 : 25}% ${(allyLeft || allyBottom) ? 0 : 25}%`,
            }
        }),
        // wrapper div for inverted upper corners
        h('div', {
            style: {
                position: 'relative',
                top: vertexSize,
                height: vertexSize,
                width: vertexSize,
                overflow: 'hidden',
            }
            },
            h('div', {
                style: {
                    borderRadius: invertedRadiusStyleTop(),
                    boxShadow: `0 -${vertexSize / 4}px 0 100px ` +
                        (paint > 0 ? 'var(--shudan-black-background-color)' : 'var(--shudan-white-background-color)'),
                    opacity: Math.abs(paint || 0) * 0.5,
                }
            })),
        // wrapper div for inverted lower corners
        h('div', {
            style: {
                position: 'relative',
                top: -2 * vertexSize,
                height: vertexSize,
                width: vertexSize,
                overflow: 'hidden',
            }
            },
            h('div', {
                style: {
                    borderRadius: invertedRadiusStyleBottom(),
                    boxShadow: `0 -${vertexSize / 4}px 0 100px ` +
                        (paint > 0 ? 'var(--shudan-black-background-color)' : 'var(--shudan-white-background-color)'),
                    opacity: Math.abs(paint || 0) * 0.5,
                }
            }))
        ),

      !!selected &&
        h('div', {
          key: 'selection',
          className: 'shudan-selection',
          style: absoluteStyle(4)
        }),

      h('div', {
        key: 'heat',
        className: 'shudan-heat',
        style: absoluteStyle(5)
      }),
      !!heat &&
        h(
          'div',
          {
            key: 'heatlabel',
            className: 'shudan-heatlabel',
            style: absoluteStyle(6)
          },
          heat.text && heat.text.toString()
        )
    )
  }
}

module.exports = Vertex
