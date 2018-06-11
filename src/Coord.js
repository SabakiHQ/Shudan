const {h, Component} = require('preact')
const helper = require('./helper')

class CoordX extends Component {
    shouldComponentUpdate({rangeX}) {
        return rangeX.length !== this.props.rangeX.length
    }

    render() {
        let {style, rangeX} = this.props

        return h('div',
            {
                className: 'coordx',
                style: Object.assign({
                    display: 'flex',
                    textAlign: 'center'
                }, style)
            },

            rangeX.map(i =>
                h('div', {style: {width: '1em'}},
                    h('span', {style: {display: 'block', fontSize: '.6em'}}, helper.alpha[i])
                )
            )
        )
    }
}

class CoordY extends Component {
    shouldComponentUpdate({rangeY}) {
        return rangeY.length !== this.props.rangeY.length
    }

    render() {
        let {style, rangeY} = this.props

        return h('div',
            {
                className: 'coordy',
                style: Object.assign({
                    textAlign: 'center'
                }, style)
            },

            rangeY.map(i =>
                h('div', {style: {height: '1em'}},
                    h('span', {style: {display: 'block', fontSize: '.6em'}}, rangeY.length - i)
                )
            )
        )
    }
}

module.exports = {CoordX, CoordY}
