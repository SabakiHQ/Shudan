# Shudan Goban

A highly customizable Preact Goban component. This is a work in progress.

![Screenshot](./screenshot.png)

## Features

- Easy customization
- Fuzzy stone placement
- Stone placing animation
- Board and stone markers
- Lines and arrows
- Heat and paint map
- Busy state
- Partial board

## Installation

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

We assume you have a bundler set up correctly and Preact installed.

## Build Demo

Make sure you have Node.js v8 and npm installed. First, clone this repository via Git, then install all dependencies with npm:

~~~
$ git clone https://github.com/SabakiHQ/shudan-goban
$ cd shudan-goban
$ npm install
~~~

Use the `build-demo` script to build the demo project:

~~~
$ npm run build-demo
~~~

You can use the `watch-demo` command for development:

~~~
$ npm run watch-demo
~~~
