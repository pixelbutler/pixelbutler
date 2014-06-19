# pixelbutler

[![Build Status](https://secure.travis-ci.org/pixelbutler/pixelbutler.svg?branch=master)](http://travis-ci.org/pixelbutler/pixelbutler) [![NPM version](https://badge.fury.io/js/pixelbutler.svg)](http://badge.fury.io/js/pixelbutler) [![Dependency Status](https://david-dm.org/pixelbutler/pixelbutler.svg)](https://david-dm.org/pixelbutler/pixelbutler) [![devDependency Status](https://david-dm.org/pixelbutler/pixelbutler/dev-status.svg)](https://david-dm.org/pixelbutler/pixelbutler#info=devDependencies)

Bitmap rendering system for low-res pixel rendering on big screens.

The canvas rendering ensures up-scaling with 100% crispy pixels while the WebGL renderer runs easily at 60 frames-per-second in high resolutions. This works great on modern mobile devices. 

pixelbutler is especially suited for 32x32 pixel micro games on large screens or classic 320x240 gaming.


Work-in-progress :sunglasses:

## Demo

Usage examples and demo gallery can be found on [pixelbutler.github.io/pixelbutler](https://pixelbutler.github.io/pixelbutler/)

## Get the code

### npm

~~The modules are also available as [npm](https://www.npmjs.org/) package for use with CommonJS enabled build systems like [browserify](https://github.com/substack/node-browserify).~~

:warning: This is queued for release.

````bash
$ npm install pixelbutler
````

### bower

~~Alternately install via [bower](https://github.com/twitter/bower) ans use a browser global or AMD module~~

:warning: This is queued for release.

````bash
$ bower install pixelbutler
````


## Development

The project is written in JavaScript using CommonJS module pattern, and build for browsers using [grunt](http://gruntjs.com) and [browserify](https://github.com/substack/node-browserify). Development tools run on [node.js](http://nodejs.org/) and are pulled from [npm](https://www.npmjs.org/).

The generated bundles support UMD and work as browser global, CommonJS and AMD module. Browserify users can also use the npm package directly.

To regenerate the bundles use the following steps:

1) Clone the git repos to you local machine.

2) Make sure you have the global grunt command:

````bash
$ npm install grunt-cli -g
```` 

3) Navigate your shell/terminal to the checkout directory.

4) Install development dependencies from npm:

````bash
$ npm install
````

5) Rebuild bundles using grunt:

````bash
$ grunt build
````

6) ~~Watch tasks to auto-build during development:~~

````bash
$ grunt watch
````

7) Run a local test server for the demos and tests:

````bash
$ grunt server
````

See the `Gruntfile.js` and `$ grunt --help` for additional commands.


## Contributions

They are very welcome.

## License

Copyright (c) 2014 [Stephen Whitmore](https://github.com/noffle) & [Bart van der Schoor](https://github.com/Bartvds)

Licensed under the MIT license.

