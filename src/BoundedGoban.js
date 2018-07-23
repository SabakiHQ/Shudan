const {h, Component} = require('preact')
const Goban = require('./Goban')

class BoundedGoban extends Component {
    constructor(props) {
        super(props)

        this.state = BoundedGoban.getDerivedStateFromProps(props)
    }

    componentWillReceiveProps(props) {
        this.setState(BoundedGoban.getDerivedStateFromProps(props, this.state))
    }

    render() {
        return h(Goban, Object.assign(this.props, {
            style: Object.assign({}, this.props.style, {
                visibility: this.state.visibility
            }),
            vertexSize: this.state.vertexSize
        }))
    }
}

BoundedGoban.getDerivedStateFromProps = function(props, state) {
    if (state == null) {
        return {
            vertexSize: 1,
            visibility: 'hidden',
            maxWidth: null,
            maxHeight: null
        }
    } else if (props.maxWidth !== state.maxWidth || props.maxHeight !== state.maxHeight) {
        return {
            vertexSize: 1,
            visibility: 'hidden',
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight
        }
    }
}

module.exports = BoundedGoban
