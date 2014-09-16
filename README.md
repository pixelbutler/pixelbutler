<img src="http://www.stephenwhitmore.com/pixelbutler.png">

# pixelbutler

[![Build Status](https://secure.travis-ci.org/pixelbutler/pixelbutler.svg?branch=master)](http://travis-ci.org/pixelbutler/pixelbutler) [![NPM version](https://badge.fury.io/js/pixelbutler.svg)](http://badge.fury.io/js/pixelbutler) [![Dependency Status](https://david-dm.org/pixelbutler/pixelbutler.svg)](https://david-dm.org/pixelbutler/pixelbutler) [![devDependency Status](https://david-dm.org/pixelbutler/pixelbutler/dev-status.svg)](https://david-dm.org/pixelbutler/pixelbutler#info=devDependencies)

> Fast, simple, low-res framebuffer rendering: _at your service_.

pixelbutler features both a Canvas and WebGL renderer. The canvas rendering
ensures clean upscaling with 100% crispy pixels while the WebGL renderer runs
easily at 60 FPS in high resolutions. Works great on modern mobile devices,
too.

pixelbutler was initially hacked together for the
[2014 lowrezjam](http://jams.gamejolt.io/lowrezjam2014) by
[Stephen Whitmore][sww], and has grown significantly in code quality and
capabilities since thanks to [Bart van der Schoor][bvds].

## Installation

pixelbutler is available on `npm` and `bower`.

Since it uses [UMD](https://github.com/umdjs/umd), it will happily work as a
browser global, or as a CommonJS or AMD module. Browserify & Webpack users can
also use the npm package directly.

TypeScript users can use the source using `import`, or by using the npm or
bower packages with the `dist/pixelbutler.d.ts.` definition file.

## Quick 'n Easy Usage

```html
<canvas id="game" width="640" height="480"></canvas>

<script src="js/pixelbutler.js"></script>

<script type="text/javascript">
    var $pb = new pixelbutler.Stage({
        width: 160,
        height: 120,
        canvas: 'game'
    });

    // colours are in RGB format as a map with keys 'r', 'g', and 'b'.
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

        $pb.text(5, 5, "pixelbutler: serving you awesome", white);

        $pb.render();
    }, 30);
</script>
```

[Browse more examples](https://pixelbutler.github.io/pixelbutler/)!

## API

### Colours
##### `pixelbutler.rgb(r, g, b)`
Colours take the form `{ r: 100, g: 200, b: 255 }` or `pixelbutler.rgb(100, 200, 255)`.

Values range from `0` - `255`.

### Basics
##### `$fb = new pixelbutler.Stage({ width: 120, height: 160, canvas: 'canvasId', center: true, scale: 'fit' })`
Creates a new framebuffer object with the given `width` and `height`. This
assumes you already have a canvas element in your DOM with id `canvasId`. The
framebuffer will stretch to fill the canvas, so selecting the correct aspect
ratio is left up to the user. The resulting framebuffer object supports the
following operations:

##### `$fb.clear(rgb)`
Sets all pixels to the colour `rgb`.

##### `$fb.render()`
Draws the state of the framebuffer to the canvas.

##### `$fb.setPixel(x, y, rgb)`
Safely (ignoring any out-of-bounds coordinates for you) draws a single pixel at
coordinates `x`,`y` of colour `rgb`.

### Shapes
##### `$fb.drawRect(x, y, width, height, rgb)`
##### `$fb.fillRect(x, y, width, height, rgb)`
Draws a filled or unfilled rectangle at `x`,`y` with the given `width`,
`height` and colour `rgb`.

##### `$fb.drawCircle(x, y, radius, rgb)`
##### `$fb.fillCircle(x, y, radius, rgb)`
Draws a filled or unfilled circle at `x`,`y` with the given `radius` and colour
`rgb`.

### Text
##### `$fb.text(x, y, txt, rgb)`
pixelbutler includes a built-in low res 4x4 font that's ready to be used out of
the box.

### Sprites
##### `var sprite = new pixelbutler.Bitmap(width, height)`
Allocates a `width`x`height` offscreen buffer that functions not unlike the
framebuffer itself.

##### `sprite.setPixel(x, y, rgb)`
Does bounds checking.

##### `$fb.blit(sprite, x, y, width, height, sourceX, sourceY)`
Draws a sprite to the framebuffer at the given `x`,`y` coordinates.

`width` and `height` are used if present, but default to the full size of the sprite.

`sourceX` and `sourceY` refer to where within the source sprite the blit
begins, where `(0,0)` is the top left of the image.

### Shaders
pixelbutler supports software shaders!

##### `$fb.shader(func)`
This runs an arbitrary function across all of the framebuffer's pixels,
modifying the framebuffer immediately.

The function provided should have the form `function(x, y, rgb)`. Its return
value is the final colour the pixel at `x`,`y` will take.

e.g. grayscale shader
```javascript
$fb.shader(function(x, y, rgb) {
  var hsv = pixelbutler.hsv(rgb);
  return pixelbutler.rgb(hsv[0], 0, hsv[2]);
});
$fb.render();
```

Shaders can also be chained, creating pipelines.

```javascript
var invert = function(x, y, rgb) {
  return pixelbutler.rgb(255-rgb[0], 255-rgb[1], 255-rgb[2]);
};

var halfBrightness = function(x, y, rgb) {
  var hsv = pixelbutler.rgb2hsv(rgb);
  hsv[2] *= 0.5;
  return pixelbutler.hsv2rgb(hsv);
}

var pipeline = function(x, y, rgb) {
  return halfBrightness(x, y, invert(x, y, rgb));
};

$fb.shader(pipeline);
$fb.render();
```

### Utilities
pixelbutler provides a few helper methods for manipulating colour.

##### `pixelbutler.rand(n)`
Generates a random integer between `0` and `n`.

##### `pixelbutler.rgb2hsv(rgb)`
Converts a `rgb` value to an `hsv` value.

##### `pixelbutler.hsv2rgb(hsv)`
Converts an `hsv` value to an `rgb` value.

## Development

The project is written in [TypeScript](http://typescriptlang.org), and built
for browsers using [grunt](http://gruntjs.com) and
[webpack](https://github.com/webpack/webpack). Development tools run on
[node.js](http://nodejs.org/) and are pulled from
[npm](https://www.npmjs.org/).

To regenerate the bundles use the following steps:

1) Clone the git repos to you local machine.

2) Make sure you have the global grunt command:

```bash
$ npm install grunt-cli -g
```

4) Install development dependencies from npm:

```bash
$ npm install
```

5) Rebuild bundles using grunt:

```bash
$ grunt build
```

6) ~~Watch tasks to auto-build during development:~~

```bash
$ grunt watch
```

7) Run a local test server for the demo's and tests:

```bash
$ grunt server
```

See the `Gruntfile.js` and `$ grunt --help` for additional commands.


## Contributions

..are very welcome. Try to stay consistent with existing style, and make sure
to run `grunt test` before sending a pull request.

## License

Copyright (c) 2014 [Stephen Whitmore][sww] & [Bart van der Schoor][bvds]

Licensed under the MIT license.


[sww]: https://github.com/noffle
[bvds]: https://github.com/Bartvds
