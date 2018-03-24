const {h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('./helper')
const Vertex = require('./Vertex')
const Line = require('./Line')

class CoordX extends Component {
    shouldComponentUpdate({rangeX}) {
        return rangeX.length !== this.props.rangeX.length
    }

    render({rangeX}) {
        return h('ol', {class: 'coordx'},
            rangeX.map(i => h('li', {}, helper.alpha[i]))
        )
    }
}

class CoordY extends Component {
    shouldComponentUpdate({rangeY}) {
        return rangeY.length !== this.props.rangeY.length
    }

    render({rangeY}) {
        return h('ol', {class: 'coordy'},
            rangeY.map(i => h('li', {}, rangeY.length - i))
        )
    }
}

class Goban extends Component {
    constructor(props) {
        super(props)

        this.state = {
            fieldSize: 0,
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
        let {containerSize, signMap, paintMap, heatMap, showCoordinates = false,
            markers = {}, lines = [], ghostStones = {}, highlightVertices = [], dimmedStones = []} = this.props
        let {fieldSize, hoshis, animatedVertex, shiftMap, randomMap} = this.state

        let rangeY = helper.range(signMap.length)
        let rangeX = helper.range(signMap.length === 0 ? 0 : signMap[0].length)
        let animatedVertices = animatedVertex ? helper.neighborhood(animatedVertex) : []

        return h('section',
            {
                ref: el => this.element = el,
                class: classnames('sabaki-goban', {
                    coordinates: showCoordinates
                })
            },

            h('div', {},
                h(CoordY, {rangeY}),
                h(CoordX, {rangeX}),

                rangeY.map(y => h('ol', {key: y, class: 'row'}, rangeX.map(x => {
                    let equalsVertex = v => helper.vertexEquals(v, [x, y])

                    return h(Vertex, {
                        key: x,
                        position: [x, y],
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
                }))),

                h(CoordX, {rangeX}),
                h(CoordY, {rangeY})
            ),

            // Draw lines & arrows

            lines.map(({v1, v2, type}) =>
                h(Line, {v1, v2, type, fieldSize})
            )
        )
    }
}

module.exports = Goban
