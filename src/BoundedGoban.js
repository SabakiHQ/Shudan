const {createElement: h, Component} = require('preact')
const Goban = require('./Goban')

class BoundedGoban extends Component {
    constructor(props) {
        super(props)

        this.state = {
            vertexSize: 1,
            visibility: 'hidden'
        }
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        let {maxWidth, maxHeight, onResized = () => {}} = this.props
        let {offsetWidth, offsetHeight} = this.element
        let scale = Math.min(maxWidth / offsetWidth, maxHeight / offsetHeight)
        let vertexSize = Math.max(Math.floor(this.state.vertexSize * scale), 1)

        if (this.state.vertexSize !== vertexSize) {
            this.setState({vertexSize}, onResized)
        }

        if (this.state.visibility !== 'visible') {
            this.setState({visibility: 'visible'})
        }
    }

    render() {
        let {innerProps = {}, style = {}} = this.props
        let {ref: innerRef = () => {}} = innerProps

        return h(Goban, Object.assign({}, this.props, {
            innerProps: Object.assign({}, innerProps, {
                ref: el => (innerRef(el), this.element = el),
            }),

            style: Object.assign({
                visibility: this.state.visibility
            }, style),

            vertexSize: this.state.vertexSize
        }))
    }
}

module.exports = BoundedGoban
