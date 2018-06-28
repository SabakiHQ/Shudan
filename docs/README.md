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

The board is represented by an array of arrays. Each of those subarrays represent one row, all of the same size. We shall refer to this structure as a **map**. For `signMap`, the subarrays consists of integers: `-1` denotes a white stone, `1` a black stone, and `0` represents an empty vertex

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

Board positions are represented by a **vertex**, i.e. an array of the form `[x, y]` where `x` and `y` are non-negative integers, zero-based coordinates. `[0, 0]` denotes the upper left position of the board.

### Styling

## API Reference

All props are optional. The following props are supported:

### Board Props

- `busy` `<boolean>` - Default: `false`

  Determines whether component is busy. When busy, no user input are accepted.

- `vertexSize` `<integer>` - Default: `24`

  The width and height of a single vertex in pixels. Adjust this prop to change the size of the component.

- `rangeX` `<[<integer>, <integer>]>` - Default: `[0, Infinity]`

  Only vertices with `x` value inside this range are displayed.

- `rangeY` `<[<integer>, <integer>]>` - Default: `[0, Infinity]`

  Only vertices with `y` value inside this range are displayed.

### Coordinates Props

- `showCoordinates` `<boolean>` - Default: `false`

  Determines rendering of coordinates.

- `coordX` `<Function>` - Default: `x => ['A', 'B', 'C', ...][x]`

  A function that determines coordinate label by `x` value of a vertex.

- `coordY` `<Function>` - Default: `y => height - y`

  A function that determines coordinate label by `y` value of a vertex.

### Behavior Props

- `fuzzyStonePlacement` `<boolean>` - Default: `false`

  When set to `true`, stones are rendered slightly off-grid.

- `animateStonePlacement` `<boolean>` - Default: `false`

  When set to `true`, stones that are added to the board will slide into place, adjusting nearby stones if necessary. Only works if `fuzzyStonePlacement` is set to `true`.

### Map Props

- `signMap` `<Map<integer>>`

  A [`map`](#board-representation) consisting of `-1` (white stone), `0` (empty field), or `1` (black stone), representing the stone arrangement on the board.

- `markerMap` `<Map<null | Object>>`

  A [`map`](#board-representation) consisting of objects of the following structure:

  ~~~js
  {
      type: <string>,
      label?: <string>
  }
  ~~~

  Shudan provides styles for the following types:

  - `'circle'`
  - `'cross'`
  - `'triangle'`
  - `'square'`
  - `'point'`
  - `'loader'`
  - `'label'`

- `paintMap` `<Map<integer>>`

  A [`map`](#board-representation) consisting of `-1` (white), `0` (none), or `1` (black) that will paint the corresponding vertices accordingly.

- `ghostStoneMap` `<Map<null | Object>>`

  A [`map`](#board-representation) consisting of objects of the following structure:

  ~~~js
  {
      sign: <integer>,
      types: <Array<string>>
  }
  ~~~

  `sign` can be `-1` (white stone), `0` (empty field), or `1` (black stone). Shudan provides styles for the following `types`:

  - Empty array
  - `'good'`
  - `'interesting'`
  - `'doubtful'`
  - `'bad'`
  - `'faint'` - Reduces opacity

- `heatMap` `<Map<integer>>`

  A [`map`](#board-representation) consisting of integers from `0` to `9`, representing the importance of certain vertices.

### Vertex Specific Props

- `selectedVertices` `<Array<Vertex>>` - Default: `[]`

  An array of [vertices](#vertex-representation) which should be in a selected state.

- `dimmedVertices` `<Array<Vertex>>` - Default: `[]`

  An array of [vertices](#vertex-representation) which should be dimmed.

- `lines` `<Array<Object>>` - Default: `[]`

  An array of objects of the following form:

  ~~~js
  {
      v1: <Vertex>,
      v2: <Vertex>,
      type: <string>
  }
  ~~~

  Shudan provides default styles for `'line'` and `'arrow'` types.

### Event Props

- `onVertexMouseUp` `<Function>`

  This function will be called when a pointing device button is released over a vertex. It will be called with two arguments:

  1. `evt` - The original mouse event
  2. `vertex` [`<Vertex>`](#vertex-representation)

- `onVertexMouseDown` `<Function>`

  This function will be called when a pointing device button is pressed on a vertex. It will be called with two arguments:

  1. `evt` - The original mouse event
  2. `vertex` [`<Vertex>`](#vertex-representation)

- `onVertexMouseMove` `<Function>`

  This function will be called when a pointing device button is moved while over a vertex. It will be called with two arguments:

  1. `evt` - The original mouse event
  2. `vertex` [`<Vertex>`](#vertex-representation)
