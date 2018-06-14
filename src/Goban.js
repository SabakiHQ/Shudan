const {h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('./helper')
const {CoordX, CoordY} = require('./Coord')
const Vertex = require('./Vertex')
const Line = require('./Line')

class Goban extends Component {
    constructor(props) {
        super(props)

        this.state = Goban.getDerivedStateFromProps(props, {})
    }

    componentWillReceiveProps(props) {
        this.setState(Goban.getDerivedStateFromProps(props, this.state))
    }

    render() {
        let {vertexSize = 24, signMap, paintMap, heatMap, fuzzyStonePlacement = false,
            showCoordinates = false, markerMap, ghostStoneMap, lines = [],
            selectedVertices = [], dimmedVertices = []} = this.props
        let {hoshis, rangeX, rangeY, animatedVertex, shiftMap, randomMap} = this.state

        let animatedVertices = animatedVertex ? helper.neighborhood(animatedVertex) : []

        return h('section',
            {
                ref: el => this.element = el,
                style: {
                    display: 'inline-grid',
                    gridTemplateRows: showCoordinates ? '1em 1fr 1em' : '1fr',
                    gridTemplateColumns: showCoordinates ? '1em 1fr 1em' : '1fr',
                    fontSize: vertexSize,
                    lineHeight: '1em'
                },
                className: classnames('shudan-goban', {
                    coordinates: showCoordinates
                })
            },

            showCoordinates && h(CoordX, {rangeX, style: {gridRow: '1', gridColumn: '2'}}),
            showCoordinates && h(CoordY, {rangeY, style: {gridRow: '2', gridColumn: '1'}}),

            h('div',
                {
                    className: 'content',
                    style: {
                        position: 'relative',
                        width: `${rangeX.length}em`,
                        height: `${rangeY.length}em`,
                        gridRow: showCoordinates ? '2' : '1',
                        gridColumn: showCoordinates ? '2' : '1'
                    }
                },

                h('div',
                    {
                        className: 'vertices',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: `repeat(${rangeX.length}, 1em)`,
                            gridTemplateRows: `repeat(${rangeY.length}, 1em)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 0
                        }
                    },

                    rangeY.map(y => rangeX.map(x => {
                        let equalsVertex = v => helper.vertexEquals(v, [x, y])

                        return h(Vertex, {
                            key: [x, y].join('-'),

                            position: [x, y],
                            types: [
                                y === 0 && 'top',
                                x === rangeX.length - 1 && 'right',
                                y === rangeY.length - 1 && 'bottom',
                                x === 0 && 'left'
                            ],
                            shift: fuzzyStonePlacement ? shiftMap && shiftMap[y] && shiftMap[y][x] : 0,
                            random: randomMap && randomMap[y] && randomMap[y][x],
                            sign: signMap && signMap[y] && signMap[y][x],
                            heat: heatMap && heatMap[y] && heatMap[y][x],
                            paint: paintMap && paintMap[y] && paintMap[y][x],
                            marker: markerMap && markerMap[y] && markerMap[y][x],
                            ghostStone: ghostStoneMap && ghostStoneMap[y] && ghostStoneMap[y][x],
                            dimmed: dimmedVertices.some(equalsVertex),
                            selected: selectedVertices.some(equalsVertex),
                            hoshi: hoshis.some(equalsVertex),
                            animate: animatedVertices.some(equalsVertex),

                            onMouseUp: this.handleVertexMouseUp,
                            onMouseDown: this.handleVertexMouseDown,
                            onMouseMove: this.handleVertexMouseMove
                        })
                    }))
                ),

                h('div',
                    {
                        className: 'lines',
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            zIndex: 1
                        }
                    },

                    lines.map(({v1, v2, type}) =>
                        h(Line, {v1, v2, type, vertexSize})
                    )
                )
            ),

            showCoordinates && h(CoordY, {rangeY, style: {gridRow: '2', gridColumn: '3'}}),
            showCoordinates && h(CoordX, {rangeX, style: {gridRow: '3', gridColumn: '2'}})
        )
    }
}

Goban.getDerivedStateFromProps = function(props, state) {
    let {signMap = []} = props
    let width = signMap.length === 0 ? 0 : signMap[0].length
    let height = signMap.length

    if (state.width === width && state.height === height) {
        return null
    }

    return {
        width,
        height,
        hoshis: helper.getHoshis(width, height),
        rangeX: helper.range(width),
        rangeY: helper.range(height),
        shiftMap: helper.readjustShifts(signMap.map(row => row.map(_ => helper.random(8)))),
        randomMap: signMap.map(row => row.map(_ => helper.random(5)))
    }
}

module.exports = Goban
