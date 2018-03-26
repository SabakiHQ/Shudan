const {h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('./helper')
const Vertex = require('./Vertex')
const Line = require('./Line')

class CoordX extends Component {
    shouldComponentUpdate({rangeX}) {
        return rangeX.length !== this.props.rangeX.length
    }

    render() {
        let {style, rangeX} = this.props

        return h('div',
            {
                class: 'coordx',
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
                class: 'coordy',
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

class Goban extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hoshis: [],
            animatedVertex: null,
            shiftMap: null,
            randomMap: null
        }
    }

    readjustShifts(shifts, vertex = null) {
        if (vertex == null) {
            let movedVertices = []

            for (let y = 0; y < shifts.length; y++) {
                for (let x = 0; x < shifts[0].length; x++) {
                    movedVertices.push(...this.readjustShifts(shifts, [x, y]))
                }
            }

            return movedVertices
        }

        let [x, y] = vertex
        let direction = shifts[y][x]

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

            if (shifts[qy] && removeShifts.includes(shifts[qy][qx])) {
                shifts[qy][qx] = 0
                movedVertices.push([qx, qy])
            }
        }

        return movedVertices
    }

    render() {
        let {vertexSize = 24, signMap, paintMap, heatMap, showCoordinates = false,
            markers = {}, lines = [], ghostStones = {}, highlightVertices = [], dimmedStones = []} = this.props
        let {hoshis, animatedVertex, shiftMap, randomMap} = this.state

        let rangeY = helper.range(signMap.length)
        let rangeX = helper.range(signMap.length === 0 ? 0 : signMap[0].length)
        let animatedVertices = animatedVertex ? helper.neighborhood(animatedVertex) : []

        return h('section',
            {
                ref: el => this.element = el,
                style: {
                    display: 'inline-grid',
                    gridTemplateRows: showCoordinates ? '1em auto 1em' : '1fr',
                    gridTemplateColumns: showCoordinates ? '1em auto 1em' : '1fr',
                    fontSize: vertexSize,
                    lineHeight: '1em'
                },
                class: classnames('sabaki-goban', {
                    coordinates: showCoordinates
                })
            },

            showCoordinates && h(CoordX, {rangeX, style: {gridRow: '1', gridColumn: '2'}}),
            showCoordinates && h(CoordY, {rangeY, style: {gridRow: '2', gridColumn: '1'}}),

            h('div',
                {
                    class: 'content',
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
                        class: 'vertices',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: `repeat(${rangeX.length}, 1em)`,
                            gridTemplateRows: `repeat(${rangeY.length}, 1em)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }
                    },

                    rangeY.map(y => rangeX.map(x => {
                        let equalsVertex = v => helper.vertexEquals(v, [x, y])

                        return h(Vertex, {
                            key: x,
                            position: [x, y],
                            types: [
                                y === 0 && 'top',
                                x === rangeX.length - 1 && 'right',
                                y === rangeY.length - 1 && 'bottom',
                                x === 0 && 'left'
                            ],
                            shift: shiftMap && shiftMap[y][x],
                            random: randomMap && randomMap[y][x],
                            sign: signMap && signMap[y][x],
                            heat: heatMap && heatMap[y][x],
                            paint: paintMap && paintMap[y][x],
                            dimmed: dimmedStones.some(equalsVertex),
                            highlight: highlightVertices.some(equalsVertex),
                            hoshi: hoshis.some(equalsVertex),
                            animate: animatedVertices.some(equalsVertex),
                            marker: markers[[x, y]],
                            ghostStone: ghostStones[[x, y]],

                            onMouseUp: this.handleVertexMouseUp,
                            onMouseDown: this.handleVertexMouseDown,
                            onMouseMove: this.handleVertexMouseMove
                        })
                    }))
                ),

                h('div',
                    {
                        class: 'lines',
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none'
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
