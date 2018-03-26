const {h, render, Component} = require('preact')
const Goban = require('..')

const signMap = [
    [0,0,0,-1,-1,-1,1,0,1,1,-1,-1,0,-1,0,-1,-1,1,0],
    [0,0,-1,0,-1,1,1,1,0,1,-1,0,-1,-1,-1,-1,1,1,0],
    [0,0,-1,-1,-1,1,1,0,0,1,1,-1,-1,1,-1,1,0,1,0],
    [0,0,0,0,-1,-1,1,0,1,-1,1,1,1,1,1,0,1,0,0],
    [0,0,0,0,-1,0,-1,1,0,0,1,1,0,0,0,1,1,1,0],
    [0,0,-1,0,0,-1,-1,1,0,-1,-1,1,-1,-1,0,1,0,0,1],
    [0,0,0,-1,-1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,1],
    [0,0,-1,1,1,0,1,-1,-1,1,0,1,-1,0,1,-1,-1,-1,1],
    [0,0,-1,-1,1,1,1,0,-1,1,-1,-1,0,-1,-1,1,1,1,1],
    [0,0,-1,1,1,-1,-1,-1,-1,1,1,1,-1,-1,-1,-1,1,-1,-1],
    [-1,-1,-1,-1,1,1,1,-1,0,-1,1,-1,-1,0,-1,1,1,-1,0],
    [-1,1,-1,0,-1,-1,-1,-1,-1,-1,1,-1,0,-1,-1,1,-1,0,-1],
    [1,1,1,1,-1,1,1,1,-1,1,0,1,-1,0,-1,1,-1,-1,0],
    [0,1,-1,1,1,-1,-1,1,-1,1,1,1,-1,1,-1,1,1,-1,1],
    [0,0,-1,1,0,0,1,1,-1,-1,0,1,-1,1,-1,1,-1,0,-1],
    [0,0,1,0,1,0,1,1,1,-1,-1,1,-1,-1,1,-1,-1,-1,0],
    [0,0,0,0,1,1,0,1,-1,0,-1,-1,1,1,1,1,-1,-1,-1],
    [0,0,1,1,-1,1,1,-1,0,-1,-1,1,1,1,1,0,1,-1,1],
    [0,0,0,1,-1,-1,-1,-1,-1,0,-1,-1,1,1,0,1,1,1,0]
]

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showCoordinates: true,
            showDimmedStones: false
        }
    }

    render() {
        let {showCoordinates, showDimmedStones} = this.state

        return h('section', {},
            h('form', {},
                h('label', {},
                    h('input', {
                        type: 'checkbox',
                        checked: showCoordinates,

                        onClick: () => {
                            this.setState(s => ({showCoordinates: !s.showCoordinates}))
                        }
                    }),

                    'Show coordinates'
                ),

                h('label', {},
                    h('input', {
                        type: 'checkbox',
                        checked: showDimmedStones,

                        onClick: () => {
                            this.setState(s => ({showDimmedStones: !s.showDimmedStones}))
                        }
                    }),

                    'Show dimmed stones'
                )
            ),

            h(Goban, {
                vertexSize: 33,
                signMap,
                showCoordinates,
                dimmedVertices: showDimmedStones ? [
                    [2, 14], [2, 13], [5, 13], [6, 13],
                    [9, 3], [9, 5], [10, 5], [14, 7],
                    [13, 13], [13, 14], [18, 13]
                ] : []
            })
        )
    }
}

render(h(App), document.body)
