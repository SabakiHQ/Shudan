const {createElement: h, Component} = require('preact')
const classnames = require('classnames')

const helper = require('./helper')
const {CoordX, CoordY} = require('./Coord')
const Grid = require('./Grid')
const Vertex = require('./Vertex')
const Line = require('./Line')

class Goban extends Component {
    constructor(props) {
        super(props)

        this.state = Goban.getDerivedStateFromProps(props)
    }

    componentWillReceiveProps(props) {
        this.setState(Goban.getDerivedStateFromProps(props, this.state))
    }

    componentDidUpdate() {
        if (
            this.props.animateStonePlacement
            && !this.state.clearAnimatedVerticesHandler
            && this.state.animatedVertices.length > 0
        ) {
            // Handle stone animation

            for (let [x, y] of this.state.animatedVertices) {
                this.state.shiftMap[y][x] = helper.random(7) + 1
                helper.readjustShifts(this.state.shiftMap, [x, y])
            }

            this.setState({shiftMap: this.state.shiftMap})

            // Clear animation classes

            this.setState({
                clearAnimatedVerticesHandler: setTimeout(() => {
                    this.setState({
                        animatedVertices: [],
                        clearAnimatedVerticesHandler: null
                    })
                }, this.props.animationDuration || 200)
            })
        }
    }

    render() {
        let {
            width, height,
            rangeX, rangeY,
            xs, ys,
            hoshis,
            shiftMap,
            randomMap
        } = this.state

        let {
            innerProps = {},
            vertexSize = 24,
            coordX, coordY,
            busy,
            signMap,
            paintMap,
            heatMap,
            markerMap,
            ghostStoneMap,
            fuzzyStonePlacement = false,
            showCoordinates = false,
            lines = [],
            selectedVertices = [],
            dimmedVertices = []
        } = this.props

        let animatedVertices = [].concat(...this.state.animatedVertices.map(helper.neighborhood))

        return h('div',
            Object.assign({}, innerProps, {
                id: this.props.id,
                className: classnames(
                    'shudan-goban',
                    'shudan-goban-image',
                    {
                        'shudan-busy': busy,
                        'shudan-coordinates': showCoordinates
                    }
                ) + ' ' + (this.props.class || this.props.className || ''),

                style: Object.assign({
                    gridTemplateRows: showCoordinates ? '1em 1fr 1em' : '1fr',
                    gridTemplateColumns: showCoordinates ? '1em 1fr 1em' : '1fr',
                    fontSize: vertexSize,
                    lineHeight: '1em'
                }, this.props.style || {})
            }),

            showCoordinates && h(CoordX, {xs, style: {gridRow: '1', gridColumn: '2'}, coordX}),
            showCoordinates && h(CoordY, {height, ys, style: {gridRow: '2', gridColumn: '1'}, coordY}),

            h('div',
                {
                    className: 'shudan-content',
                    style: {
                        position: 'relative',
                        width: `${xs.length}em`,
                        height: `${ys.length}em`,
                        gridRow: showCoordinates ? '2' : '1',
                        gridColumn: showCoordinates ? '2' : '1'
                    }
                },

                h(Grid, {
                    width,
                    height,
                    xs,
                    ys,
                    hoshis
                }),

                h('div',
                    {
                        className: 'shudan-vertices',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: `repeat(${xs.length}, 1em)`,
                            gridTemplateRows: `repeat(${ys.length}, 1em)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1
                        }
                    },

                    ys.map(y => xs.map(x => {
                        let equalsVertex = v => helper.vertexEquals(v, [x, y])

                        return h(Vertex, Object.assign({
                            key: [x, y].join('-'),
                            position: [x, y],

                            shift: fuzzyStonePlacement ? shiftMap && shiftMap[y] && shiftMap[y][x] : 0,
                            random: randomMap && randomMap[y] && randomMap[y][x],
                            sign: signMap && signMap[y] && signMap[y][x],
                            heat: heatMap && heatMap[y] && heatMap[y][x],
                            paint: paintMap && paintMap[y] && paintMap[y][x],
                            marker: markerMap && markerMap[y] && markerMap[y][x],
                            ghostStone: ghostStoneMap && ghostStoneMap[y] && ghostStoneMap[y][x],
                            dimmed: dimmedVertices.some(equalsVertex),
                            selected: selectedVertices.some(equalsVertex),
                            animate: animatedVertices.some(equalsVertex),
                        }, ...helper.vertexEvents.map(e => ({
                            [`on${e}`]: this.props[`onVertex${e}`]
                        }))))
                    }))
                ),

                h('div',
                    {
                        className: 'shudan-lines',
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            zIndex: 2
                        }
                    },

                    h('div',
                        {
                            style: {
                                position: 'absolute',
                                top: `-${rangeY[0]}em`,
                                left: `-${rangeX[0]}em`,
                                width: `${width}em`,
                                height: `${height}em`,
                            }
                        },

                        lines.map(({v1, v2, type}) =>
                            h(Line, {v1, v2, type, vertexSize})
                        )
                    )
                )
            ),

            showCoordinates && h(CoordY, {height, ys, style: {gridRow: '2', gridColumn: '3'}, coordY}),
            showCoordinates && h(CoordX, {xs, style: {gridRow: '3', gridColumn: '2'}, coordX})
        )
    }
}

Goban.getDerivedStateFromProps = function(props, state) {
    let {
        signMap = [],
        rangeX = [0, Infinity],
        rangeY = [0, Infinity]
    } = props

    let width = signMap.length === 0 ? 0 : signMap[0].length
    let height = signMap.length

    if (state && state.width === width && state.height === height) {
        let animatedVertices = state.animatedVertices

        if (props.animateStonePlacement && props.fuzzyStonePlacement && state.clearAnimatedVerticesHandler == null) {
            animatedVertices = helper.diffSignMap(state.signMap, signMap)
        }

        let result = {
            signMap,
            animatedVertices
        }

        if (
            !helper.vertexEquals(state.rangeX, rangeX)
            || !helper.vertexEquals(state.rangeY, rangeY)
        ) {
            // Range changed

            Object.assign(result, {
                rangeX,
                rangeY,
                xs: helper.range(width).slice(rangeX[0], rangeX[1] + 1),
                ys: helper.range(height).slice(rangeY[0], rangeY[1] + 1)
            })
        }

        return result
    }

    // Board size changed

    return {
        signMap,
        width,
        height,
        rangeX,
        rangeY,
        animatedVertices: [],
        clearAnimatedVerticesHandler: null,
        xs: helper.range(width).slice(rangeX[0], rangeX[1] + 1),
        ys: helper.range(height).slice(rangeY[0], rangeY[1] + 1),
        hoshis: helper.getHoshis(width, height),
        shiftMap: helper.readjustShifts(signMap.map(row => row.map(_ => helper.random(8)))),
        randomMap: signMap.map(row => row.map(_ => helper.random(4)))
    }
}

module.exports = Goban
