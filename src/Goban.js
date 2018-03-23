const {h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('../modules/helper')
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
        super()

        this.componentWillReceiveProps(props)

        this.handleVertexMouseUp = this.handleVertexMouseUp.bind(this)
        this.handleVertexMouseDown = this.handleVertexMouseDown.bind(this)
        this.handleVertexMouseMove = this.handleVertexMouseMove.bind(this)
    }

    componentDidMount() {
        document.addEventListener('mouseup', () => {
            this.mouseDown = false

            if (this.state.temporaryLine)
                this.setState({temporaryLine: null})
        })

        // Measure CSS

        let {borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth,
            paddingLeft, paddingTop, paddingRight, paddingBottom} = window.getComputedStyle(this.element)

        this.setState({
            borderLeftWidth: parseFloat(borderLeftWidth),
            borderTopWidth: parseFloat(borderTopWidth),
            borderRightWidth: parseFloat(borderRightWidth),
            borderBottomWidth: parseFloat(borderBottomWidth),
            paddingLeft: parseFloat(paddingLeft),
            paddingTop: parseFloat(paddingTop),
            paddingRight: parseFloat(paddingRight),
            paddingBottom: parseFloat(paddingBottom)
        })

        // Resize board when window is resizing

        window.addEventListener('resize', () => {
            this.resize()
        })

        this.resize()
    }

    componentWillReceiveProps({board, animatedVertex}) {
        let dim = board => [board.width, board.height]

        if (!this.props || !helper.vertexEquals(dim(board), dim(this.props.board))) {
            // Update state to accomodate new board size

            let rangeX = helper.range(board.width)
            let rangeY = helper.range(board.height)
            let hoshis = helper.getHoshis(board.width, board.height)

            let shifts = rangeY.map(_ => rangeX.map(__ => helper.random(9)))
            this.readjustShifts(shifts)

            this.setState({
                rangeX,
                rangeY,
                hoshis,
                randomizer: rangeY.map(_ => rangeX.map(__ => helper.random(5))),
                shifts
            }, () => this.resize())
        } else if (animatedVertex
        && !(this.props.animatedVertex && helper.vertexEquals(animatedVertex, this.props.animatedVertex))) {
            // Update shift

            let [x, y] = animatedVertex
            let {shifts} = this.state

            shifts[y][x] = helper.random(9)
            this.readjustShifts(shifts, animatedVertex)

            this.setState({shifts, animatedVertex})
            setTimeout(() => this.setState({animatedVertex: null}), 200)
        }
    }

    componentDidUpdate({showCoordinates}) {
        if (showCoordinates !== this.props.showCoordinates) {
            this.resize()
        }
    }

    resize() {
        if (!this.element || !this.element.parentElement) return

        let {board, showCoordinates, onBeforeResize = () => {}} = this.props
        onBeforeResize()

        let {width: outerWidth, height: outerHeight} = window.getComputedStyle(this.element.parentElement)
        outerWidth = parseFloat(outerWidth)
        outerHeight = parseFloat(outerHeight)

        let boardWidth = board.width
        let boardHeight = board.height

        if (showCoordinates) {
            boardWidth += 2
            boardHeight += 2
        }

        let width = helper.floorEven(outerWidth
            - this.state.paddingLeft - this.state.paddingRight
            - this.state.borderLeftWidth - this.state.borderRightWidth)
        let height = helper.floorEven(outerHeight
            - this.state.paddingTop - this.state.paddingBottom
            - this.state.borderTopWidth - this.state.borderBottomWidth)

        let fieldSize = helper.floorEven(Math.min(width / boardWidth, height / boardHeight, 150))
        let minX = fieldSize * boardWidth
        let minY = fieldSize * boardHeight

        this.setState({
            width: minX + outerWidth - width,
            height: minY + outerHeight - height,
            marginLeft: -(minX + outerWidth - width) / 2,
            marginTop: -(minY + outerHeight - height) / 2,
            innerWidth: minX,
            innerHeight: minY,
            innerMarginLeft: -minX / 2,
            innerMarginTop: -minY / 2,
            fieldSize
        })
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

    handleVertexMouseDown(evt) {
        let {currentTarget} = evt

        this.mouseDown = true
        this.startVertex = currentTarget.dataset.vertex.split('-').map(x => +x)
    }

    handleVertexMouseUp(evt) {
        if (!this.mouseDown) return

        let {onVertexClick = () => {}, onLineDraw = () => {}} = this.props
        let {currentTarget} = evt

        this.mouseDown = false
        evt.vertex = currentTarget.dataset.vertex.split('-').map(x => +x)
        evt.line = this.state.temporaryLine

        if (evt.x == null) evt.x = evt.clientX
        if (evt.y == null) evt.y = evt.clientY

        if (evt.line) {
            onLineDraw(evt)
        } else {
            onVertexClick(evt)
        }
    }

    handleVertexMouseMove(evt) {
        let {drawLineMode, onVertexMouseMove = () => {}} = this.props
        let {currentTarget} = evt

        onVertexMouseMove(Object.assign(evt, {
            mouseDown: this.mouseDown,
            startVertex: this.startVertex,
            vertex: currentTarget.dataset.vertex.split('-').map(x => +x)
        }))

        if (!!drawLineMode && evt.mouseDown && evt.button === 0) {
            let temporaryLine = [evt.startVertex, evt.vertex]

            if (!helper.lineEquals(temporaryLine, this.state.temporaryLine)) {
                this.setState({temporaryLine})
            }
        }
    }

    render({
        board,
        paintMap,
        heatMap,
        highlightVertices = [],
        dimmedStones = [],

        crosshair = false,
        showCoordinates = false,
        showMoveColorization = true,
        showNextMoves = true,
        showSiblings = true,
        fuzzyStonePlacement = true,
        animatedStonePlacement = true,

        drawLineMode = null
    }, state) {
        let {fieldSize, rangeY, rangeX, temporaryLine, animatedVertex} = state
        let animatedVertices = animatedVertex
            ? [animatedVertex, ...board.getNeighbors(animatedVertex)] : []
        let drawTemporaryLine = !!drawLineMode && !!temporaryLine

        return h('section',
            {
                ref: el => this.element = el,
                id: 'goban',
                class: classnames('goban', {
                    crosshair,
                    coordinates: showCoordinates,
                    movecolorization: showMoveColorization,
                    variations: showNextMoves,
                    siblings: showSiblings,
                    fuzzy: fuzzyStonePlacement,
                    animation: animatedStonePlacement
                })
            },

            h('style', {}, `
                #goban {
                    font-size: ${fieldSize}px;
                    width: ${state.width}px;
                    height: ${state.height}px;
                    margin-left: ${state.marginLeft}px;
                    margin-top: ${state.marginTop}px;
                }
                #goban > div {
                    width: ${state.innerWidth}px;
                    height: ${state.innerHeight}px;
                    margin-left: ${state.innerMarginLeft}px;
                    margin-top: ${state.innerMarginTop}px;
                }
                #goban > div > ol > li {
                    width: ${fieldSize}px;
                    height: ${fieldSize}px;
                }
                #goban > div > ol:not(.coordy) {
                    height: ${fieldSize}px;
                    line-height: ${fieldSize}px;
                    margin-left: ${showCoordinates ? fieldSize : 0}px;
                }
                #goban > div > ol.coordy {
                    width: ${fieldSize}px;
                    top: ${fieldSize}px;
                    line-height: ${fieldSize}px;
                }
                #goban > div > ol.coordy:last-child {
                    left: ${fieldSize * (board.width + 1)}px;
                }
            `),

            h('div', {},
                h(CoordY, {rangeY}),
                h(CoordX, {rangeX}),

                rangeY.map(y => h('ol', {class: 'row'}, rangeX.map(x => {
                    let sign = board.get([x, y])
                    let [markupType, label] = board.markups[[x, y]] || [null, '']
                    let equalsVertex = v => helper.vertexEquals(v, [x, y])

                    return h(Vertex, {
                        position: [x, y],
                        shift: this.state.shifts[y][x],
                        random: this.state.randomizer[y][x],
                        sign,
                        heat: heatMap && heatMap[y] && heatMap[y][x],
                        paint: paintMap && paintMap[y] && paintMap[y][x],
                        dimmed: dimmedStones.some(equalsVertex),
                        highlight: highlightVertices.some(equalsVertex),
                        hoshi: this.state.hoshis.some(equalsVertex),
                        animate: animatedVertices.some(equalsVertex),
                        smalllabel: label.length >= 3,
                        markupType,
                        label,
                        ghostTypes: board.ghosts[[x, y]] || [],

                        onMouseUp: this.handleVertexMouseUp,
                        onMouseDown: this.handleVertexMouseDown,
                        onMouseMove: this.handleVertexMouseMove
                    })
                }))),

                h(CoordX, {rangeX}),
                h(CoordY, {rangeY})
            ),

            // Draw lines & arrows

            board.lines.map(([v1, v2, arrow]) => {
                if (drawTemporaryLine) {
                    if (helper.lineEquals([v1, v2], temporaryLine)
                    || (!arrow || drawLineMode === 'line')
                    && helper.lineEquals([v2, v1], temporaryLine)) {
                        drawTemporaryLine = false
                        return
                    }
                }

                return h(Line, {
                    v1, v2, showCoordinates, fieldSize,
                    type: arrow ? 'arrow' : 'line'
                })
            }),

            drawTemporaryLine && h(Line, {
                temporary: true,
                v1: temporaryLine[0], v2: temporaryLine[1],
                showCoordinates, fieldSize,
                type: drawLineMode
            })
        )
    }
}

module.exports = Goban
