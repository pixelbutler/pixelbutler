<img src="https://i.imgur.com/5VZKIzo.png">

# pixelbutler

[![Build Status](https://secure.travis-ci.org/pixelbutler/pixelbutler.svg?branch=master)](http://travis-ci.org/pixelbutler/pixelbutler) [![NPM version](https://badge.fury.io/js/pixelbutler.svg)](http://badge.fury.io/js/pixelbutler) [![Dependency Status](https://david-dm.org/pixelbutler/pixelbutler.svg)](https://david-dm.org/pixelbutler/pixelbutler) [![devDependency Status](https://david-dm.org/pixelbutler/pixelbutler/dev-status.svg)](https://david-dm.org/pixelbutler/pixelbutler#info=devDependencies)

> Low-res bitmap render engine for big screens

The canvas rendering ensures up-scaling with 100% crispy pixels while the WebGL renderer runs easily at 60 frames-per-second in high resolutions. This works great on modern mobile devices. 

pixelbutler is especially suited for 32x32 pixel micro games on large screens or classic 320x240 gaming.


Work-in-progress pre-release :sunglasses:


## Demo

Usage examples and demo gallery can be found on [pixelbutler.github.io/pixelbutler](https://pixelbutler.github.io/pixelbutler/)


## Get the code

The bundles support [UMD pattern](https://github.com/umdjs/umd) and work as browser global, CommonJS and AMD module. Browserify & Webpack users can also use the npm package directly. TypeScript users can use the source using `import`'s (at some point definition files will be available too).


### manual

Take one of the files from the `./dist` folder and include it in your project.


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


## Usage

A simple example using the browser global:

````html
<canvas id="gameScreen" width="640" height="480">
    What, no canvas support? :(
</canvas>
<script src="js/pixelbutler.js"></script>
<script type="text/javascript">

    var $pb = new pixelbutler.Stage({
        // size of the pixel buffer
        width: 160,
        height: 120,
        // id of the canvas element
        canvas: 'gameScreen'
    });

    // preset some colors
    var red = {r: 255, g: 0, b: 0};
    var green = {r: 0, g: 255, b: 0};
    var blue = {r: 0, g: 0, b: 255};
    var black = {r: 0, g: 0, b: 0};
    var white = {r: 255, g: 255, b: 255};

    setInterval(function () {
        $pb.clear(black);

        $pb.fillCircle(80, 60, 48, green);
        $pb.fillRect(50, 30, 60, 60, blue);

        for (var i = 0; i < 15; i++) {
            $pb.setPixel(pixelbutler.rand($pb.width), pixelbutler.rand($pb.height), red);
        }

        $pb.text(5, 5, "Pixelbutler is awesome", white);

        $pb.render();
    }, 30);
    
</script>
````
For more examples [browse the demo's](https://pixelbutler.github.io/pixelbutler/).

## Browser support

Any modern browser that supports canvas and reasonable JS performance, and preferably WebGL capable.

- Firefox
- Chrome
- Safari
- IE >= 10

Pixelbutler also runs well on WebGL capable modern mobile devices if the CPU load is not too crazy (eg: no PerlinNoise or shader frenzy). Tested on Chrome & Firefox Mobile on Samsung Galaxy S3.


## Development

The project is written in [TypeScript](http://typescriptlang.org), and build for browsers using [grunt](http://gruntjs.com) and [webpack](https://github.com/webpack/webpack). Development tools run on [node.js](http://nodejs.org/) and are pulled from [npm](https://www.npmjs.org/).


To regenerate the bundles use the following steps:

1) Clone the git repos to you local machine.

2) Make sure you have the global grunt command:

````bash
$ npm install grunt-cli -g
```` 

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

7) Run a local test server for the demo's and tests:

````bash
$ grunt server
````

See the `Gruntfile.js` and `$ grunt --help` for additional commands.


## Contributions

They are very welcome. Try to stay idiomatic and make sure you run `grunt test` before you send a pull request.


## License

Copyright (c) 2014 [Stephen Whitmore](https://github.com/noffle) & [Bart van der Schoor](https://github.com/Bartvds)

Licensed under the MIT license.
