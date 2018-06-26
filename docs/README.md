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
