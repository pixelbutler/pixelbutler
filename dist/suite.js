!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Framebuffer=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

// lets decorate framebufffer export
var expose = _dereq_('./core/fb');

// export usefull stuff
// TODO figure out what goes where
expose.RenderWebGL = _dereq_('./render/webgl');

module.exports = expose;

},{"./core/fb":2,"./render/webgl":12}],2:[function(_dereq_,module,exports){
'use strict';

var ImageArray = _dereq_('./image');
var letters = _dereq_('./letters');
var util = _dereq_('./util');
var pixel = _dereq_('./pixel');

var RenderPlain = _dereq_('./../render/plain');

//TODO figure out how Framebuffer and ImageArray and the renderers relate to each-other
// - maybe shovel some code around and put all pixel manipulation code in what is now ImageArray
function Framebuffer(opts) {
    // support usage without new
    if (!(this instanceof Framebuffer)) {
        return new Framebuffer(opts);
    }
    // import options
    this.width = opts.width || 32;
    this.height = opts.height || 32;

    // grab canvas stuff
    this.canvas = (typeof opts.canvas === 'string') ? document.getElementById(opts.canvas) : opts.canvas;
    if (!this.canvas) {
        throw new Error('cannot locate canvas with id "' + opts.canvas + '"');
    }

    // init internal data, use RGB (no alpha) so 3 channels
    this.image = new ImageArray(this.width, this.height, false);
    this.px = this.image.px;
    this.channels = 3;

    //alphaData(this.px, this.width, this.height, 255);
    util.discoData(this.px, this.width, this.height);

    // optional renderer
    if (typeof opts.renderer === 'function') {
        try {
            this.renderer = new (opts.renderer)(this.image, this.canvas);
        }
        catch (e) {
            console.log(e);
            console.log('render init error, switching to fallback');
        }
    }
    // default & fallback
    if (!this.renderer) {
        this.renderer = new RenderPlain(this.image, this.canvas);
    }
}

Framebuffer.prototype.fillrect = function (x, y, w, h, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);

    for (var i = x; i < x + w; i++) {
        for (var j = y; j < y + h; j++) {
            // TODO move this outside the loop
            if (i < 0 || j < 0 || i >= this.width || j >= this.height) {
                continue;
            }
            var p = (i + j * this.width) * this.channels;
            this.px[p] = col[0];
            this.px[p + 1] = col[1];
            this.px[p + 2] = col[2];
        }
    }
};

Framebuffer.prototype.clear = function (col) {
    var r = col[0];
    var g = col[1];
    var b = col[2];
    var lim = this.width * this.height * this.channels;
    for (var i = 0; i < lim; i += this.channels) {
        this.px[i] = r;
        this.px[i + 1] = g;
        this.px[i + 2] = b;
    }
};

Framebuffer.prototype.rect = function (x, y, w, h, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);
    for (var i = x; i < x + w; i++) {
        for (var j = y; j < y + h; j++) {
            if (i < 0 || j < 0 || i >= this.width || j >= this.height) {
                continue;
            }
            if (i === x || j === y || i === x + w - 1 || j === y + h - 1) {
                var p = (i + j * this.width) * this.channels;
                this.px[p] = col[0];
                this.px[p + 1] = col[1];
                this.px[p + 2] = col[2];
            }
        }
    }
};

Framebuffer.prototype.fillcircle = function (x, y, r, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    r = Math.floor(r);
    for (var i = -r; i <= r; i++) {
        for (var j = -r; j <= r; j++) {
            if (x + i < 0 || y + j < 0 || x + i >= this.width || y + j >= this.height) {
                continue;
            }
            if (i * i + j * j <= r * r) {
                var p = (x + i + (y + j) * this.width) * this.channels;
                this.px[p] = col[0];
                this.px[p + 1] = col[1];
                this.px[p + 2] = col[2];
            }
        }
    }
};

Framebuffer.prototype.circle = function (x, y, r, col) {
    x = Math.floor(x);
    y = Math.floor(y);
    r = Math.floor(r);
    for (var i = 0; i < 360; i++) {
        var cx = Math.round(Math.cos(i * (Math.PI / 180)) * r) + x;
        var cy = Math.round(Math.sin(i * (Math.PI / 180)) * r) + y;

        if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) {
            continue;
        }
        var p = (cx + cy * this.width) * this.channels;
        this.px[p] = col[0];
        this.px[p + 1] = col[1];
        this.px[p + 2] = col[2];
    }
};

Framebuffer.prototype.pixel = function (x, y, col) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return;
    }
    var p = (x + y * this.width) * this.channels;
    this.px[p] = col[0];
    this.px[p + 1] = col[1];
    this.px[p + 2] = col[2];
};

Framebuffer.prototype.shader = function (f) {
    var rgb = [0, 0, 0];
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            var p = (i + j * this.width) * this.channels;
            rgb[0] = this.px[p];
            rgb[1] = this.px[p + 1];
            rgb[2] = this.px[p + 2];
            var col = f(i, j, rgb);
            this.px[p] = col[0];
            this.px[p + 1] = col[1];
            this.px[p + 2] = col[2];
        }
    }
};

Framebuffer.prototype.drawLetter = function (x, y, chr, rgb) {
    var l = letters[chr.toUpperCase()];
    if (!l) {
        return 0;
    }
    for (var i = 0; i < l[0].length; i++) {
        for (var j = 0; j < l.length; j++) {
            if (l[j].charAt(i) === '1') {
                this.pixel(x + i, y + j, rgb);
            }
        }
    }
    return l[0].length;
};

Framebuffer.prototype.text = function (x, y, txt, rgb) {
    for (var i = 0; i < txt.length; i++) {
        x += this.drawLetter(x, y, txt.charAt(i), rgb) + 1;
    }
};

Framebuffer.prototype.makesprite = function (width, height, useAlpha) {
    return new ImageArray(width, height, useAlpha);
};

Framebuffer.prototype.blit = function (sprite, x, y, w, h, sx, sy) {
    x = Math.floor(x);
    y = Math.floor(y);
    w = !w ? sprite.width : Math.floor(w);
    h = !h ? sprite.height : Math.floor(h);
    sx = !sx ? 0 : Math.floor(sx);
    sy = !sy ? 0 : Math.floor(sy);
    for (var i = sx; i < sx + w; i++) {
        for (var j = sy; j < sy + h; j++) {
            if (i < 0 || j < 0 || i >= sprite.width || j >= sprite.height) {
                continue;
            }
            //TODO support alpha in sprite
            var read = (i + j * sprite.width) * sprite.channels;
            var write = (x + i - sx + (y + j - sy) * this.width) * this.channels;

            this.px[write] = sprite.px[read];
            this.px[write + 1] = sprite.px[read + 1];
            this.px[write + 2] = sprite.px[read + 2];
        }
    }
};

Framebuffer.prototype.resize = function (render) {
    this.renderer.resize();
};

Framebuffer.prototype.render = function () {
    this.renderer.update();
};

Framebuffer.prototype.close = function () {
    this.renderer.close();
    this.renderer = null;
    this.px = null;
    this.canvas = null;
    this.image = null;
};

// export pixel helpers (instance vs static.. why not both? :)
//TODO this is a bit legacy.. maybe move to bundle files?
Framebuffer.rand = Framebuffer.prototype.rand = pixel.rand;
Framebuffer.hsv2rgb = Framebuffer.prototype.hsv2rgb = pixel.hsv2rgb;
Framebuffer.rgb2hsv = Framebuffer.prototype.rgb2hsv = pixel.rgb2hsv;

module.exports = Framebuffer;

},{"./../render/plain":11,"./image":3,"./letters":4,"./pixel":5,"./util":6}],3:[function(_dereq_,module,exports){
'use strict';

// container to hold pixels and some info
//TODO this might be the sprite? maybe add some methods?
function ImageArray(width, height, useAlpha) {
    if (!(this instanceof ImageArray)) {
        return new ImageArray(width, height, useAlpha);
    }
    this.width = width;
    this.height = height;
    this.useAlpha = !!useAlpha;
    this.channels = (useAlpha ? 4 : 3);

    // keep reference to raw buffer for aliasing as Uint8Array
    this.buffer = new ArrayBuffer(width * height * this.channels);

    // work on a clamped array for safety
    this.px = new Uint8ClampedArray(this.buffer);
}

ImageArray.prototype.pixel = function (x, y, col) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return;
    }
    var p = (x + y * this.width) * this.channels;
    this.px[p] = col[0];
    this.px[p + 1] = col[1];
    this.px[p + 2] = col[2];
};

module.exports = ImageArray;

},{}],4:[function(_dereq_,module,exports){
'use strict';

/**
 * Based off of a Gist of a 4x4 font by Martin Holzhauer:
 * https://gist.github.com/woodworker/7696835
 *
 * Features fairly significant modifications to fit characters into smaller horizontal space.
 */
var letters = {
    'A': [
        '1111',
        '1001',
        '1111',
        '1001'
    ],
    'B': [
        '100',
        '111',
        '101',
        '111'
    ],
    'C': [
        '1111',
        '1000',
        '1000',
        '1111'
    ],
    'D': [
        '1110',
        '1001',
        '1001',
        '1110'
    ],
    'E': [
        '111',
        '110',
        '100',
        '111'
    ],
    'F': [
        '111',
        '100',
        '110',
        '100'
    ],
    'G': [
        '111',
        '100',
        '101',
        '111'
    ],
    'H': [
        '101',
        '101',
        '111',
        '101'
    ],
    'I': [
        '1',
        '1',
        '1',
        '1'
    ],
    'J': [
        '001',
        '001',
        '101',
        '111'
    ],
    'K': [
        '101',
        '110',
        '101',
        '101'
    ],
    'L': [
        '10',
        '10',
        '10',
        '11'
    ],
    'M': [
        '11011',
        '11011',
        '10101',
        '10001'
    ],
    'N': [
        '1101',
        '1101',
        '1011',
        '1001'
    ],
    'O': [
        '111',
        '101',
        '101',
        '111'
    ],
    'P': [
        '111',
        '101',
        '111',
        '100'
    ],
    'Q': [
        '1110',
        '1010',
        '1110',
        '0001'
    ],
    'R': [
        '111',
        '101',
        '100',
        '100'
    ],
    'S': [
        '111',
        '100',
        '111',
        '011'
    ],
    'T': [
        '111',
        '010',
        '010',
        '010'
    ],
    'U': [
        '101',
        '101',
        '101',
        '111'
    ],
    'V': [
        '101',
        '101',
        '101',
        '010'
    ],
    'W': [
        '10001',
        '10001',
        '10101',
        '01110'
    ],
    'X': [
        '101',
        '010',
        '101',
        '101'
    ],
    'Y': [
        '101',
        '101',
        '010',
        '010'
    ],
    'Z': [
        '111',
        '011',
        '100',
        '111'
    ],
    ' ': [
        '0',
        '0',
        '0',
        '0'
    ],
    '!': [
        '1',
        '1',
        '0',
        '1'
    ],
    '.': [
        '0',
        '0',
        '0',
        '1'
    ]
};

module.exports = letters;

},{}],5:[function(_dereq_,module,exports){
'use strict';

function rand(max) {
    return Math.floor(Math.random() * max);
}

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 *
 * This, in turn, was taken from the snippet at
 * http://snipplr.com/view/14590/hsv-to-rgb/
 */
function hsv2rgb(hsv) {
    var r, g, b;
    var i;
    var f, p, q, t;
    var h = hsv[0];
    var s = hsv[1];
    var v = hsv[2];

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if (s === 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * RGB to HSV color conversion
 *
 * Gratefully lifted from Mic's code on StackOverflow:
 * http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript#8023734
 */
function rgb2hsv(rgb) {
    var rr, gg, bb,
        r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function (c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff === 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(v * 100)
    ];
}

module.exports = {
    rand: rand,
    hsv2rgb: hsv2rgb,
    rgb2hsv: rgb2hsv
};

},{}],6:[function(_dereq_,module,exports){
'use strict';

var rand = _dereq_('./pixel').rand;

function discoData(px, width, height, useAlpha) {
    var lim, i;
    if (useAlpha) {
        lim = width * height * 4;
        for (i = 0; i < lim; i += 4) {
            px[i] = rand(256);
            px[i + 1] = rand(256);
            px[i + 2] = rand(256);
            px[i + 3] = 255;
        }
    } else {
        lim = width * height * 3;
        for (i = 0; i < lim; i += 3) {
            px[i] = rand(256);
            px[i + 1] = rand(256);
            px[i + 2] = rand(256);
        }
    }
}

function clearData(px, width, height, useAlpha) {
    var lim, i;
    if (useAlpha) {
        lim = width * height * 4;
        for (i = 0; i < lim; i += 4) {
            px[i] = 0;
            px[i + 1] = 0;
            px[i + 2] = 0;
            px[i + 3] = 255;
        }
    } else {
        lim = width * height * 3;
        for (i = 0; i < lim; i += 3) {
            px[i] = 0;
            px[i + 1] = 0;
            px[i + 2] = 0;
        }
    }
}

function alphaData(px, width, height, alpha) {
    var lim = width * height * 4;
    for (var i = 0; i < lim; i += 4) {
        px[i + 3] = alpha;
    }
}

module.exports = {
    discoData: discoData,
    clearData: clearData,
    alphaData: alphaData
};

},{"./pixel":5}],7:[function(_dereq_,module,exports){
'use strict';

var browser = _dereq_('./browser');

function assertMode(scaleMode) {
    if ((typeof scaleMode === 'number' && scaleMode > 0) || scaleMode === 'max' || scaleMode === 'fit') {
        return;
    }
    var int = parseInt(scaleMode);
    if (!isNaN(int) && int > 0) {
        return;
    }
    throw new Error('bad scaleMode: ' + scaleMode);
}

function createAutoSize($fb, opts) {
    opts = opts || {};

    var centerObject = true; //opts.center;
    var scaleMode = opts.scale || 'max';
    assertMode(scaleMode);

    $fb.canvas.style.position = 'absolute';

    function resizeTo(width, height) {
        $fb.canvas.width = width;
        $fb.canvas.height = height;
        $fb.resize();
    }

    function resizeFit(viewPort) {
        $fb.canvas.width = viewPort.width;
        $fb.canvas.height = viewPort.height;
        $fb.resize();
    }

    function resizeAspect(viewPort) {
        var ratio = Math.min(viewPort.width / $fb.width, viewPort.height / $fb.height);
        $fb.canvas.width = Math.floor($fb.width * ratio);
        $fb.canvas.height = Math.floor($fb.height * ratio);
        $fb.resize();
    }

    function moveScreenTo(x, y) {
        $fb.canvas.style.left = x + 'px';
        $fb.canvas.style.top = y + 'px';
    }

    function moveScreenCenter(viewPort) {
        moveScreenTo(Math.floor((viewPort.width - $fb.canvas.width) / 2), Math.floor((viewPort.height - $fb.canvas.height) / 2));
    }

    function listen() {
        unlisten();
        if (centerObject || scaleMode === 'fit') {
            window.addEventListener('resize', update);
        }
    }

    function unlisten() {
        window.removeEventListener('resize', update);
    }

    function setMode(mode, align) {
        assertMode(mode);

        scaleMode = mode;
        centerObject = !!align;

        var multi = parseInt(scaleMode);
        if (!isNaN(multi)) {
            scaleMode = multi;
            resizeTo(Math.floor($fb.width * multi), Math.floor($fb.height * multi));
            unlisten();
        }
        if (scaleMode === 'fit') {
            moveScreenTo(0, 0);
        }
        if (centerObject || scaleMode === 'fit' || scaleMode === 'max') {
            listen();
        }
        update();
    }

    function update() {
        var viewPort = browser.getViewport();
        if (scaleMode === 'fit') {
            resizeFit(viewPort);
        }
        else if (scaleMode === 'max') {
            resizeAspect(viewPort);
        }
        if (centerObject || scaleMode === 'max') {
            moveScreenCenter(viewPort);
        }
        else {
            moveScreenTo(0, 0);
        }
    }

    setMode(scaleMode, centerObject);

    // factory result
    var that = {};
    that.scale = function (mode) {
        setMode(mode, centerObject);
    };
    that.align = function (align) {
        setMode(scaleMode, align);
    };
    that.resize = function () {
        update();
    };
    that.stop = function () {
        unlisten();
    };

    return that;
}

module.exports = {
    create: createAutoSize
};

},{"./browser":8}],8:[function(_dereq_,module,exports){
'use strict';

// helper ripped from https://stackoverflow.com/questions/15451321/how-can-i-make-html5-javascript-canvas-fill-window-screen
function getViewport() {
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {width: e[a + 'Width'], height: e[a + 'Height']};
}

module.exports = {
    getViewport: getViewport
};


},{}],9:[function(_dereq_,module,exports){
'use strict';

var Stats = _dereq_('../../vendor/Stats');

var statsA;
var statsB;

// add stats measurement and return wrapped function
function wrapCallback(callback) {
    if (!statsA) {
        statsA = new Stats();
        document.body.appendChild(statsA.domElement);
    }
    statsA.setMode(0); // 0: fps, 1: ms
    statsA.domElement.style.position = 'absolute';
    statsA.domElement.style.right = '3px';
    statsA.domElement.style.top = '1px';

    if (!statsB) {
        statsB = new Stats();
        document.body.appendChild(statsB.domElement);
    }
    statsB.setMode(1); // 0: fps, 1: ms
    statsB.domElement.style.position = 'absolute';
    statsB.domElement.style.right = '3px';
    statsB.domElement.style.top = '51px';

    if (!callback) {
        // dummy
        callback = function () {};
    }

    var wrap = function () {
        statsA.begin();
        statsB.begin();
        callback();
        statsA.end();
        statsB.end();
    };
    wrap.begin = function () {
        statsA.begin();
        statsB.begin();
    };
    wrap.end = function () {
        statsA.end();
        statsB.end();
    };
    wrap.stop = function () {
        statsA.end();
        statsB.end();
        statsA.domElement.parent.removeChild(statsA.domElement);
        statsB.domElement.parent.removeChild(statsB.domElement);
    };

    return wrap;
}

// exported value
module.exports = {
    wrap: wrapCallback
};

},{"../../vendor/Stats":14}],10:[function(_dereq_,module,exports){
'use strict';

// TODO add functionality to pass frame-number and high-precision performance.now()

// simple setInterval ticker
function frameInterval(callback, fps) {
    var intervalId = 0;

    function step() {
        callback();
    }

    var that = {};
    that.start = function() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(step, 1000 / fps);
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = 0;
        }
    };
    that.isRunning = function() {
        return !!intervalId;
    };
    return that;
}


// simple requestAnimationFrame ticker
function frameRequest(callback) {
    var running = false;

    function step() {
        callback();
        if (running) {
            requestAnimationFrame(step);
        }
    }

    var that = {};
    that.start = function() {
        if (!running) {
            running = true;
            requestAnimationFrame(step);
        }
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (running) {
            running = false;
            cancelAnimationFrame(step);
        }
    };
    that.isRunning = function() {
        return running;
    };
    return that;
}

// fancy ticker tries to find exacter frame-rate (sort-of-works for lower fps)
//TODO improve logic and try to correct for drift and GC frames
function frameStable(callback, fps) {
    var intervalId = 0;
    var check = 1;
    var next = performance.now();

    function step() {
        var start = performance.now();
        if (start > next) {
            callback();
            var dur = (start - performance.now());
            next = start + (1000 / fps) - dur ;
        }
    }

    var that = {};
    that.start = function() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(step, check);
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = 0;
        }
    };
    that.isRunning = function() {
        return !!intervalId;
    };
    return that;
}

module.exports = {
    interval: frameInterval,
    request: frameRequest,
    stable: frameStable
};

},{}],11:[function(_dereq_,module,exports){
'use strict';

var util = _dereq_('../core//util');

// basic renderer with nearest-neighbour
function RenderPlain(image, canvas) {
    this.canvas = canvas;

    this.px = image.px;
    this.width = image.width;
    this.height = image.height;
    this.channels = image.useAlpha ? 4 : 3;

    this.ctx = this.canvas.getContext('2d');
    // get canvas-sized image data
    this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

    // make sure pixels are visible
    util.alphaData(this.output.data, this.output.width, this.output.height, 255);
    this.ctx.putImageData(this.output, 0, 0);
}

RenderPlain.prototype.resize = function (render) {
    if (this.output.width !== this.canvas.width || this.output.height !== this.canvas.height) {
        this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        if (!render) {
            // set the alpha channel to visible
            util.alphaData(this.output.data, this.output.width, this.output.height, 255);
        }
    }
    if (render) {
        this.update();
    }
};

RenderPlain.prototype.update = function () {
    var data = this.output.data;
    var width = this.output.width;
    var height = this.output.height;

    var fx = this.width / width;
    var fy = this.height / height;

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var x = Math.floor(i * fx);
            var y = Math.floor(j * fy);
            var read = (x + y * this.width) * this.channels;
            var write = (i + j * width) * 4;

            data[write] = this.px[read];
            data[write + 1] = this.px[read + 1];
            data[write + 2] = this.px[read + 2];
        }
    }
    this.ctx.putImageData(this.output, 0, 0);
};

RenderPlain.prototype.close = function () {
    this.px = null;
    this.ctx = null;
    this.canvas = null;
    this.output = null;
};

module.exports = RenderPlain;

},{"../core//util":6}],12:[function(_dereq_,module,exports){
'use strict';

var vertexShaderSource = [
    // refer the vertices and texture coordinates
    'attribute vec2 a_position;',
    'attribute vec2 a_texCoord;',

    // passed to fragment shader
    'varying vec2 v_texCoord;',

    'void main() {',
        // simple transform
    '    gl_Position = vec4(a_position, 0, 1);',
        // interpolated value
    '    v_texCoord = a_texCoord;',
    '}'
].join('\n');

var fragmentShaderSource = [
    // config something (cargo-cult from tutorial)
    'precision mediump float;',

    // texture sampler (number 0)
    'uniform sampler2D u_image;',

    // interpolated value from vertex shader
    'varying vec2 v_texCoord;',

    'void main() {',
        // sample texture on the interpolated value; nearest-neighbour etc was configured earlier
    '    gl_FragColor = texture2D(u_image, v_texCoord);',
    '}'
].join('\n');

function loadShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    // check if it worked (cargo-cult from tutorial)
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        throw new Error('error compiling shader "' + shader + '":' + gl.getShaderInfoLog(shader));
    }
    return shader;
}

function RenderWebGL(image, canvas) {
    this.canvas = canvas;
    this.image = image;
    this.width = image.width;
    this.height = image.height;

    // use a Uint8Array view for WebGL compatibility
    this.px = new Uint8Array(image.buffer);

    // cheap check
    if (!window.WebGLRenderingContext) {
        throw new Error('browser does not support WegGL');
    }

    // let's not bother with alpha on main canvas
    var glOpts = {alpha: false};

    // lazy alias to local var to keep code clear, also do fancy context lookup
    var gl = this.gl = this.canvas.getContext('webgl', glOpts) || this.canvas.getContext('experimental-webgl', glOpts);
    if (!gl) {
        throw new Error('could not create WebGL context');
    }

    // setup a GLSL program
    var program = gl.createProgram();

    // add shaders
    gl.attachShader(program, loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
    gl.attachShader(program, loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);

    // check the link status (cargo-cult from tutorial)
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        throw new Error(('error in program linking:' + gl.getProgramInfoLog(program)));
    }
    gl.useProgram(program);

    // shader variables that refer to the vertices and texture coordinates
    this.positionLocation = gl.getAttribLocation(program, 'a_position');
    this.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    // setup vertices
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    // upload vertices for 2 triangles in 2D: 3 x 2 x 2 elements
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        1.0,  1.0
    ]), gl.STATIC_DRAW);

    // setup texture coordinates
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);

    gl.enableVertexAttribArray(this.texCoordLocation);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // upload texture coordinates matching the vertices
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ]), gl.STATIC_DRAW);

    // create a texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // set the parameters so we can render any size image
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // clear the back buffer (with alpha)
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // turn off rendering to alpha
    gl.colorMask(true, true, true, false);

    // apply size
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}

RenderWebGL.prototype.resize = function (render) {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    if (render) {
        this.render();
    } else {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
};

RenderWebGL.prototype.update = function () {
    // upload the pixels to the texture.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.px);
    // render state
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

RenderWebGL.prototype.close = function () {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    //TODO what else? how unload WebGL?
    this.gl = null;
    this.px = null;
    this.ctx = null;
    this.canvas = null;
    this.output = null;
};

module.exports = RenderWebGL;

},{}],13:[function(_dereq_,module,exports){
'use strict';

// decorate the basic export
var expose = _dereq_('./basic');

expose.autosize = _dereq_('./extras/autosize');
expose.ticker = _dereq_('./extras/ticker');
expose.stats = _dereq_('./extras/stats');

module.exports = expose;

},{"./basic":1,"./extras/autosize":7,"./extras/stats":9,"./extras/ticker":10}],14:[function(_dereq_,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 */
// added module.exports for browserify

var Stats = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement('div');
	container.id = 'stats';
	container.addEventListener('mousedown', function (event) {
		event.preventDefault();
		setMode(++mode % 2)
	}, false);
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var fpsDiv = document.createElement('div');
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild(fpsDiv);

	var fpsText = document.createElement('div');
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild(fpsText);

	var fpsGraph = document.createElement('div');
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
	fpsDiv.appendChild(fpsGraph);

	while (fpsGraph.children.length < 74) {

		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild(bar);

	}

	var msDiv = document.createElement('div');
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
	container.appendChild(msDiv);

	var msText = document.createElement('div');
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML = 'MS';
	msDiv.appendChild(msText);

	var msGraph = document.createElement('div');
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
	msDiv.appendChild(msGraph);

	while (msGraph.children.length < 74) {

		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild(bar);

	}

	var setMode = function (value) {

		mode = value;

		switch (mode) {

			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}

	}

	var updateGraph = function (dom, value) {

		var child = dom.appendChild(dom.firstChild);
		child.style.height = value + 'px';

	}

	return {

		REVISION: 11,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min(msMin, ms);
			msMax = Math.max(msMax, ms);

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph(msGraph, Math.min(30, 30 - ( ms / 200 ) * 30));

			frames++;

			if (time > prevTime + 1000) {

				fps = Math.round(( frames * 1000 ) / ( time - prevTime ));
				fpsMin = Math.min(fpsMin, fps);
				fpsMax = Math.max(fpsMax, fps);

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph(fpsGraph, Math.min(30, 30 - ( fps / 100 ) * 30));

				prevTime = time;
				frames = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	}

};

module.exports = Stats;

},{}]},{},[13])

(13)
});

//# sourceMappingURL=suite.js.map