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

const paintMap = [
    [-1,-1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,1,1],
    [-1,-1,-1,-1,-1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,1,1],
    [-1,-1,-1,-1,-1,1,1,1,1,1,1,-1,-1,1,-1,1,1,1,1],
    [-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,0,0,0,1,1,1,1],
    [-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,-1,-1,0,1,1,1,1],
    [-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,1],
    [-1,-1,-1,1,1,1,1,-1,-1,1,0,1,-1,-1,-1,-1,-1,-1,1],
    [-1,-1,-1,-1,1,1,1,0,-1,1,-1,-1,-1,-1,-1,1,1,1,1],
    [-1,-1,-1,1,1,-1,-1,-1,-1,1,1,1,-1,-1,-1,-1,1,-1,-1],
    [-1,-1,-1,-1,1,1,1,-1,-1,-1,1,-1,-1,-1,-1,1,1,-1,-1],
    [-1,1,-1,0,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,-1],
    [1,1,1,1,-1,1,1,1,-1,1,1,1,-1,-1,-1,1,-1,-1,-1],
    [1,1,1,1,1,1,1,1,-1,1,1,1,-1,-1,-1,1,1,-1,-1],
    [1,1,1,1,1,1,1,1,-1,-1,0,1,-1,-1,-1,1,-1,-1,-1],
    [1,1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,1,-1,-1,-1,-1],
    [1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1],
    [1,1,1,1,-1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,-1,1],
    [1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1]
]

const heatMap = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,7,9,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,5,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

const markerMap = (() => {
    let _ = null
    let O = {type: 'circle'}
    let X = {type: 'cross'}
    let T = {type: 'triangle'}
    let Q = {type: 'square'}
    let $ = {type: 'point'}
    let L = label => ({type: 'label', label})
    let A = L('a')
    let B = L('b')
    let C = L('c')

    return [
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,O,O,O,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,X,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,X,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,X,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,T,T,T,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,$,$,$,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,Q,_,_,_,_,_,_,_,_,_,L('Long label')],
        [_,_,_,_,_,_,_,_,Q,_,_,_,_,_,_,_,_,_,C],
        [_,_,_,_,_,_,_,_,Q,_,_,_,_,_,_,_,_,_,B],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,A]
    ]
})()

const ghostStoneMap = (() => {
    let _ = null
    let O = t => ({sign: -1, types: [t]})
    let X = t => ({sign: 1, types: [t]})
    let o = t => ({sign: -1, types: [t, 'sibling']})
    let x = t => ({sign: 1, types: [t, 'sibling']})

    return [
        [X(),x(),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [X('good'),x('good'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [X('interesting'),x('interesting'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [X('doubtful'),x('doubtful'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [X('bad'),x('bad'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [O(),o(),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [O('good'),o('good'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [O('interesting'),o('interesting'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [O('doubtful'),o('doubtful'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [O('bad'),o('bad'),_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
    ]
})()

const createTwoWayCheckBox = (state, setState) => (
    ({stateKey, text}) => h('label',
        {
            style: {
                display: 'flex',
                alignItems: 'center'
            }
        },

        h('input', {
            style: {marginRight: '.5em'},
            type: 'checkbox',
            checked: state[stateKey],

            onClick: () => setState(s => ({[stateKey]: !s[stateKey]}))
        }),

        h('span', {style: {userSelect: 'none'}}, text)
    )
)

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            vertexSize: 24,
            showCoordinates: false,
            showDimmedStones: false,
            fuzzyStonePlacement: false,
            showPaintMap: false,
            showHeatMap: false,
            showMarkerMap: false,
            showGhostStones: false,
            showLines: false,
            showSelection: false
        }

        this.CheckBox = createTwoWayCheckBox(this.state, this.setState.bind(this))
    }

    render() {
        let {vertexSize, showCoordinates, showDimmedStones,
            fuzzyStonePlacement, showPaintMap, showHeatMap,
            showMarkerMap, showGhostStones, showLines,
            showSelection} = this.state

        return h('section',
            {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '12em auto',
                    gridColumnGap: '1em'
                }
            },

            h('form',
                {
                    style: {
                        display: 'flex',
                        flexDirection: 'column'
                    }
                },

                h('p', {},
                    h('button', {
                        type: 'button',
                        onClick: evt => {
                            this.setState(s => ({vertexSize: Math.max(s.vertexSize - 4, 4)}))
                        }
                    }, '-'), ' ',

                    h('button', {
                        type: 'button',
                        onClick: evt => {
                            this.setState({vertexSize: 24})
                        }
                    }, '•'), ' ',

                    h('button', {
                        type: 'button',
                        onClick: evt => {
                            this.setState(s => ({vertexSize: s.vertexSize + 4}))
                        }
                    }, '+')
                ),

                h(this.CheckBox, {stateKey: 'showCoordinates', text: 'Show coordinates'}),
                h(this.CheckBox, {stateKey: 'showDimmedStones', text: 'Dim dead stones'}),
                h(this.CheckBox, {stateKey: 'fuzzyStonePlacement', text: 'Fuzzy stone placement'}),
                h(this.CheckBox, {stateKey: 'showMarkerMap', text: 'Show markers'}),
                h(this.CheckBox, {stateKey: 'showGhostStones', text: 'Show ghost stones'}),
                h(this.CheckBox, {stateKey: 'showPaintMap', text: 'Show paint map'}),
                h(this.CheckBox, {stateKey: 'showHeatMap', text: 'Show heat map'}),
                h(this.CheckBox, {stateKey: 'showLines', text: 'Show lines'}),
                h(this.CheckBox, {stateKey: 'showSelection', text: 'Show selection'})
            ),

            h('div', {},
                h(Goban, {
                    vertexSize,
                    signMap,
                    showCoordinates,
                    fuzzyStonePlacement,
                    paintMap: showPaintMap && paintMap,
                    heatMap: showHeatMap && heatMap,
                    markerMap: showMarkerMap && markerMap,
                    ghostStoneMap: showGhostStones && ghostStoneMap,

                    lines: showLines ? [
                        {type: 'line', v1: [15, 6], v2: [12, 15]},
                        {type: 'arrow', v1: [10, 4], v2: [5, 7]}
                    ] : [],

                    dimmedVertices: showDimmedStones ? [
                        [2, 14], [2, 13], [5, 13], [6, 13],
                        [9, 3], [9, 5], [10, 5], [14, 7],
                        [13, 13], [13, 14], [18, 13]
                    ] : [],

                    selectedVertices: showSelection ? [
                        [9, 7]
                    ] : []
                })
            )
        )
    }
}

render(h(App), document.body)
