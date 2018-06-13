const {h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('./helper')
const {CoordX, CoordY} = require('./Coord')
const Vertex = require('./Vertex')
const Line = require('./Line')

class Goban extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hoshis: [],
            rangeX: [],
            rangeY: [],
            animatedVertex: null,
            shiftMap: null,
            randomMap: null
        }

        this.componentWillReceiveProps()
    }

    componentWillReceiveProps(nextProps) {
        let dim = props => [
            props.signMap.length === 0 ? 0 : props.signMap[0].length,
            props.signMap.length
        ]

        if (nextProps == null || !helper.vertexEquals(dim(this.props), dim(nextProps))) {
            if (nextProps == null) nextProps = this.props

            let nextDim = dim(nextProps)

            this.setState({
                hoshis: helper.getHoshis(...nextDim),
                rangeX: helper.range(nextDim[0]),
                rangeY: helper.range(nextDim[1]),
                shiftMap: nextProps.signMap.map(row => row.map(_ => helper.random(8))),
                randomMap: nextProps.signMap.map(row => row.map(_ => helper.random(5)))
            })

            this.readjustShifts()
        }
    }

    readjustShifts(vertex = null) {
        let {shiftMap} = this.state

        if (vertex == null) {
            let movedVertices = []

            for (let y = 0; y < shiftMap.length; y++) {
                for (let x = 0; x < shiftMap[0].length; x++) {
                    movedVertices.push(...this.readjustShifts([x, y]))
                }
            }

            return movedVertices
        }

        let [x, y] = vertex
        let direction = shiftMap[y][x]

        let data = [
            // Left
            [[1, 5, 8], [x - 1, y], [3, 7, 6]],
            // Top
            [[2, 5, 6], [x, y - 1], [4, 7, 8]],
            // Right
            [[3, 7, 6], [x + 1, y], [1, 5, 8]],
            // Bottom
            [[4, 7, 8], [x, y + 1], [2, 5, 6]],
        ]

        let movedVertices = []

        for (let [directions, [qx, qy], removeShifts] of data) {
            if (!directions.includes(direction)) continue

            if (shiftMap[qy] && removeShifts.includes(shiftMap[qy][qx])) {
                shiftMap[qy][qx] = 0
                movedVertices.push([qx, qy])
            }
        }

        return movedVertices
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
                className: classnames('sabaki-goban', {
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

module.exports = Goban
