# Documentation

## Guide

### About Shudan

The Shudan Goban is the Goban component that powers [Sabaki](https://sabaki.yichuanshen.de). It is licensed under the MIT license and supports modern browsers. Shudan is written for [Preact](https://preactjs.com/), but should work with [React](https://reactjs.org) as well.

### Installation

Use npm to install:

~~~
$ npm install @sabaki/shudan-goban
~~~

To use this module, require it as follows:

~~~js
const {h} = require('preact')
const Shudan = require('@sabaki/shudan-goban')

const CustomComponent = props => (
    <Shudan
        vertexSize={24}
        signMap={props.signMap}
    />
)
~~~

In this case, we assume you have a bundler set up correctly and Preact installed.

### Board Representation

The board is represented by an array of arrays. Each of those subarrays represent one row, all of the same size. For `signMap`, the subarrays consists of integers: `-1` denotes a white stone, `1` a black stone, and `0` represents an empty vertex

#### Example

~~~js
[[ 0,  0,  1,  0, -1, -1,  1,  0, 0],
 [ 1,  0,  1, -1, -1,  1,  1,  1, 0],
 [ 0,  0,  1, -1,  0,  1, -1, -1, 0],
 [ 1,  1,  1, -1, -1, -1,  1, -1, 0],
 [ 1, -1,  1,  1, -1,  1,  1,  1, 0],
 [-1, -1, -1, -1, -1,  1,  0,  0, 0],
 [ 0, -1, -1,  0, -1,  1,  1,  1, 1],
 [ 0,  0,  0,  0,  0, -1, -1, -1, 1],
 [ 0,  0,  0,  0,  0,  0,  0, -1, 0]]
~~~

### Vertex Representation

Board positions are represented by an array of the form `[x, y]` where `x` and `y` are non-negative integers, zero-based coordinates of the vertex. `[0, 0]` denotes the top left position of the board.

## API Reference

### Board props

- `busy`
- `vertexSize`
- `rangeX`
- `rangeY`
- `fuzzyStonePlacement`
- `animateStonePlacement`

### Coordinates props

- `showCoordinates`
- `coordX`
- `coordY`

### Map props

- `signMap`
- `markerMap`
- `paintMap`
- `ghostStoneMap`
- `heatMap`

### Vertex specific props

- `selectedVertices`
- `dimmedVertices`
- `lines`
