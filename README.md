framebufferJS
=============
framebufferJS is a framebuffer abstraction build on top of Canvas. It provides simple access to a raw framebuffer (big 'ol array of RGB values), as well as a collection of helper functions for graphical effects.

It takes care to handle annoying details for you: all RGB values are automatically [0,255] capped, writes that go outside the framebuffer are silently ignored, and all arguments get properly `floor`ed for you to pixel boundaries.

The canvas rendering is specialised for up-scaling with 100% crispy pixels and in modern browsers the optional WebGL renderer can easily run at 60 frames-per-second in HD resolution. 

framebufferJS is espcially suited for 32x32 pixel micro games displaying on large screens.

Coded with ♥ by [@noffle](http://www.twitter.com/noffle) for the [2014 lowrezjam](http://jams.gamejolt.io/lowrezjam2014). 

Performance upgrade ♣ by [@bartvds](http://github.com/bartvd)

<p align="center">
  <img src="https://github.com/noffle/lowrez-js/raw/master/screenshot.png"/>
</p>

Demo page
-------------

For some pixel instant action and usage examples see the [Wee little demo page](http://rawgit.com/noffle/framebufferJS/master/demo/index.html) or browse the [demo](https://github.com/noffle/framebufferJS/blob/master/demo) and [gallery](https://github.com/noffle/framebufferJS/blob/master/demo/gallery) source files.

Example Usage
-------------
````javascript
<html>
  <body>
    <!-- 1. Create a canvas element. -->
    <canvas id="gameScreen" width="640" height="480">
      What, no canvas support? D:
    </canvas>
  </body>

  <!-- 2. Include framebufferJS -->
  <script src="fb.js"></script>

  <!-- 3. <your awesomeness here> -->
  <script type="text/javascript">
    var $fb = new Framebuffer({
      width: 160,
      height: 120,
      canvasId: "gameScreen"
    });
    $fb.clear([0,0,0]);
    $fb.fillcircle(80, 60, 48, [93,27,175]);
    $fb.pixel(10, 20, [255,0, 123]);
    $fb.render();
  </script>
</html>
````

Get the code
-------

Pre-build files are located in the report in the `./dist` directory. The `fb.js` bundle is the main export and has the essentials needed to work with framebuffers and render to a canvas.

The `suite.js` as everything from `fb.js` but contains additional helpers useful to get a project started quickly; see the usage sction for more info. 

At some point pre-minified bundles could be provided there as well.

### npm

~~The modules are also available as [npm](https://www.npmjs.org/) package for use with CommonJS enabled build systems like [browserify](https://github.com/substack/node-browserify).~~

:warning: This is queued for release.

````bash
$ npm install framebufferjs
````

### bower

~~Alternately install via [bower](https://github.com/twitter/bower) ans use a browser global or AMD module~~

:warning: This is queued for release.

````bash
$ bower install framebufferjs
````

Colours
-------
Colours throughout framebufferJS are specified as an array of size 3, with Red Green Blue values ranging from 0 to 255.

```
var brightGreen = [0, 255, 0];

$fb.clear(brightGreen);
```

Basics
------
#### `$fb = framebuffer(width, height, canvasId)`
Creates a new framebuffer object with the given `width` and `height`. This assumes you already have a canvas element in your DOM with id `canvasId`. The framebuffer will stretch to fill the canvas, so selecting the correct aspect ratio is left up to the user. The resulting framebuffer object supports the following operations:

#### `$fb.clear(rgb)`
Sets all framebuffer pixels to the colour `rgb`.

#### `$fb.render()`
Draws the state of the framebuffer to the screen.

#### `$fb.pixel(x, y, rgb)`
Safely (ignoring any out-of-bounds coordinates for you) draws a single pixel at coordinates `x`,`y` of colour `rgb`.

Shapes
------
#### `$fb.rect(x, y, width, height, rgb)`
#### `$fb.fillrect(x, y, width, height, rgb)`
Draws a filled or unfilled rectangle at `x`,`y` with the given `width`, `height` and colour `rgb`.

#### `$fb.circle(x, y, radius, rgb)`
#### `$fb.fillcircle(x, y, radius, rgb)`
Draws a filled or unfilled circle at `x`,`y` with the given `radius` and colour `rgb`.

Text
----
#### `$fb.text(x, y, txt, rgb)`
framebufferJS has a built-in low res 4x4(-ish) font that's ready to be used out of the box!

```
$fb.text(7, 3, "Hello Warld.", [255,128,64]);
```
Sprites
-------
#### `$fb.makesprite(width, height)`
Allocates a `width`x`height` offscreen buffer, suitable for populating with RGB sprite pixel data that your game may have generated/loaded.

#### `$fb.blit(sprite, x, y, width, height, sourceX, sourceY)`
Draws a sprite (allocated with `$fb.makesprite()` to the framebuffer at the given `x`,`y` coordinates.

`width` and `height` are used if present, but default to the full size of the sprite.

`sourceX` and `sourceY` refer to where within the source sprite the blit begins, where `(0,0)` is the top left of the image.

Shaders
-------
framebufferJS supports software shaders!

#### `$fb.shader(func)`
This runs an arbitrary function across all of the framebuffer's pixels, modifying the framebuffer immediately.

The function provided should have the form `function(x, y, rgb)`. Its return value is the final colour the pixel at `x`,`y` will take.

e.g. a grayscale shader
```javascript
$fb.shader(function(x, y, rgb) {
  var hsv = rgb2hsv(rgb);
  return hsv2rgb(hsv[0], 0, hsv[2]);
});
$fb.render();
```

Shaders can also be chained, creating shader pipelines.

```javascript
var invert = function(x, y, rgb) {
  return [255-rgb[0], 255-rgb[1], 255-rgb[2]];
};

var halfBrightness = function(x, y, rgb) {
  var hsv = rgb2hsv(rgb);
  return hsv2rgb(hsv[0], hsv[1], hsv[2]/2);
}

var pipeline = function(x, y, rgb) {
  return halfBrightness(x, y, invert(x, y, rgb));
};

$fb.shader(pipeline);
$fb.render();
```
Utilities
---------
framebufferJS also (callously) injects a few helper methods into your global namespace.

#### `rand(n)`
Generates a random integer between `0` and `n`.

#### `rgb2hsv(rgb)`
Converts a `[r,g,b]` value to an `[h,s,v]` value.

#### `hsv2rgb(hsv)`
Converts an `[h,s,v]` value to an `[r,g,b]` value.

Extra tools
---------

In the recent versions some additional helpers are exported for convenience, like various frame-tickers, a performance stats-display and small autoscaling/centering API. These are semi-experimental so see the examples for usage info.

Output rendering
-------------
There are currently two display renderers supported. Both support arbitrary scaling of the canvas while keeping the pixel edges fully crisp.

The default renderer uses plain JavaScript to project the internal framebuffer to canvas. This can become slow at large surface area and may not reach the highest frame rates on all devices. 

For full-speed rendering and high resolutions a modern browser can use the WebGL renderer to run 60 FPS on full-screen HD resolutions. WebGL should also work on recent mobile devices (development tested on Samsung Galaxy S3 in FireFox- and Chrome mobile).

See the examples for more info. 

Development
-------------

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

6) Watch tasks to auto-build during development:

````bash
$ grunt watch
````

7) Run a local test server for the demos and tests:

````bash
$ grunt server
````

See the `Gruntfile.js` and `$ grunt --help` for additional commands.


Contributions
-------------
They are very welcome. More primitives (lines, polygons), stock shader effects (gradients, dithering), or running shaders on sprite blits, for example, would be great!

License
-------
MIT
