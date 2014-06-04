!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lorez=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var RGBA = _dereq_('./RGBA');

var microFont = _dereq_('../font/Micro');

var util = _dereq_('./util');

var clamp = util.clamp;

var alpha = new RGBA(0, 0, 0, 0);
var black = new RGBA(0, 0, 0);
var magenta = new RGBA(255, 0, 255);

var Bitmap = (function () {
    function Bitmap(width, height, useAlpha, buffer) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        if (typeof buffer === "undefined") { buffer = null; }
        this.width = width;
        this.height = height;
        this.useAlpha = useAlpha;
        this.channels = (useAlpha ? 4 : 3);

        if (buffer) {
            var total = (this.width * this.height * this.channels);
            if (buffer.byteLength !== total) {
                throw new Error('bad raw data dimensions; expected ' + total + ', received ' + buffer.byteLength);
            }
            this.buffer = buffer;
            this.data = new Uint8ClampedArray(this.buffer);
        } else {
            this._resetData();
        }
    }
    Bitmap.prototype._resetData = function () {
        this.buffer = new ArrayBuffer(this.width * this.height * this.channels);

        this.data = new Uint8ClampedArray(this.buffer);
    };

    Bitmap.prototype.resizeTo = function (width, height) {
        if (width === this.width && height === this.height) {
            return;
        }
        this.width = width;
        this.height = height;
        this._resetData();
    };

    Bitmap.prototype.setPixel = function (x, y, col) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return;
        }
        var p = (x + y * this.width) * this.channels;
        this.data[p] = col.r;
        this.data[p + 1] = col.g;
        this.data[p + 2] = col.b;
    };

    Bitmap.prototype.getPixel = function (x, y, col) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null;
        }
        col = (col || new RGBA());

        var p = (x + y * this.width) * this.channels;
        col.r = this.data[p];
        col.g = this.data[p + 1];
        col.b = this.data[p + 2];
        return col;
    };

    Bitmap.prototype.fillRect = function (x, y, w, h, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        w = Math.floor(w);
        h = Math.floor(h);

        for (var iy = y; iy < y + h; iy++) {
            for (var ix = x; ix < x + w; ix++) {
                if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) {
                    continue;
                }
                var p = (ix + iy * this.width) * this.channels;
                this.data[p] = col.r;
                this.data[p + 1] = col.g;
                this.data[p + 2] = col.b;
            }
        }
    };

    Bitmap.prototype.drawLineH = function (x, y, size, col) {
        var right = clamp(Math.floor(x + size), 0, this.width);
        x = clamp(Math.floor(x), 0, this.width);
        y = clamp(Math.floor(y), 0, this.height);

        for (; x < right; x++) {
            var p = (x + y * this.width) * this.channels;
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.drawLineV = function (x, y, size, col) {
        var bottom = clamp(Math.floor(y + size), 0, this.height);
        x = clamp(Math.floor(x), 0, this.width);
        y = clamp(Math.floor(y), 0, this.height);

        for (; y < bottom; y++) {
            var p = (x + y * this.width) * this.channels;
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.drawRect = function (x, y, width, height, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);

        this.drawLineH(x, y, width, col);
        this.drawLineH(x, y + height - 1, width, col);
        this.drawLineV(x, y, height, col);
        this.drawLineV(x + width - 1, y, height, col);
    };

    Bitmap.prototype.fillCircle = function (x, y, r, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        r = Math.floor(r);

        for (var iy = -r; iy <= r; iy++) {
            for (var ix = -r; ix <= r; ix++) {
                if (x + ix < 0 || y + iy < 0 || x + ix >= this.width || y + iy >= this.height) {
                    continue;
                }
                if (ix * ix + iy * iy <= r * r) {
                    var p = (x + ix + (y + iy) * this.width) * this.channels;
                    this.data[p] = col.r;
                    this.data[p + 1] = col.g;
                    this.data[p + 2] = col.b;
                }
            }
        }
    };

    Bitmap.prototype.drawCircle = function (x, y, r, col) {
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
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.shader = function (f) {
        var iy;
        var ix;
        var p;
        var col;

        var rgb = new RGBA();

        for (iy = 0; iy < this.height; iy++) {
            for (ix = 0; ix < this.width; ix++) {
                p = (ix + iy * this.width) * this.channels;
                rgb.r = this.data[p];
                rgb.g = this.data[p + 1];
                rgb.b = this.data[p + 2];

                col = f(ix, iy, rgb);

                this.data[p] = col.r;
                this.data[p + 1] = col.g;
                this.data[p + 2] = col.b;
            }
        }
    };

    Bitmap.prototype.text = function (x, y, txt, col) {
        txt = String(txt);

        for (var i = 0; i < txt.length; i++) {
            x += this.drawChar(x, y, txt.charAt(i), col) + 1;
        }
    };

    Bitmap.prototype.drawChar = function (x, y, chr, col) {
        var char = microFont.chars[chr.toUpperCase()];
        if (!char) {
            return 0;
        }

        for (var iy = 0; iy < microFont.height; iy++) {
            for (var ix = 0; ix < char.width; ix++) {
                if (char.map[iy * char.width + ix]) {
                    this.setPixel(x + ix, y + iy, col);
                }
            }
        }
        return char.width;
    };

    Bitmap.prototype.blit = function (sprite, x, y) {
        x = (x ? Math.floor(x) : 0);
        y = (y ? Math.floor(y) : 0);

        var iy;
        var ix;
        var read;
        var write;

        if (x >= this.width || y >= this.height || x + sprite.width < 0 || y + sprite.height < 0) {
            return;
        }

        var left = x;
        var right = x + sprite.width;
        var top = y;
        var bottom = y + sprite.height;

        if (left < 0) {
            left = 0;
        }
        if (top < 0) {
            top = 0;
        }

        if (right >= this.width) {
            right = this.width;
        }
        if (bottom >= this.height) {
            bottom = this.height;
        }

        if (sprite.useAlpha) {
            for (iy = top; iy < bottom; iy++) {
                for (ix = left; ix < right; ix++) {
                    read = (ix - x + (iy - y) * sprite.width) * sprite.channels;
                    write = (ix + iy * this.width) * this.channels;

                    var alpha = sprite.data[read + 3] / 255;
                    var inv = 1 - alpha;
                    this.data[write] = Math.round(this.data[write] * inv + sprite.data[read] * alpha);
                    this.data[write + 1] = Math.round(this.data[write + 1] * inv + sprite.data[read + 1] * alpha);
                    this.data[write + 2] = Math.round(this.data[write + 2] * inv + sprite.data[read + 2] * alpha);
                }
            }
        } else {
            for (iy = top; iy < bottom; iy++) {
                for (ix = left; ix < right; ix++) {
                    read = (ix - x + (iy - y) * sprite.width) * sprite.channels;
                    write = (ix + iy * this.width) * this.channels;

                    this.data[write] = sprite.data[read];
                    this.data[write + 1] = sprite.data[read + 1];
                    this.data[write + 2] = sprite.data[read + 2];
                }
            }
        }
    };

    Bitmap.prototype.clear = function (color) {
        color = color || black;

        var lim;
        var i;

        if (this.useAlpha) {
            lim = this.width * this.height * 4;
            for (i = 0; i < lim; i += 4) {
                this.data[i] = color.r;
                this.data[i + 1] = color.g;
                this.data[i + 2] = color.b;
                this.data[i + 3] = color.a;
            }
        } else {
            lim = this.width * this.height * 3;
            for (i = 0; i < lim; i += 3) {
                this.data[i] = color.r;
                this.data[i + 1] = color.g;
                this.data[i + 2] = color.b;
            }
        }
    };

    Bitmap.prototype.clearAlpha = function (alpha) {
        if (typeof alpha === "undefined") { alpha = 0; }
        if (!this.useAlpha) {
            return;
        }
        var lim = this.width * this.height * 4;
        for (var i = 3; i < lim; i += 4) {
            this.data[i] = alpha;
        }
    };

    Bitmap.clipFromData = function (inputData, inputWidth, inputHeight, inputChannels, x, y, width, height, useAlpha) {
        var channels = useAlpha ? 4 : 3;
        var data = new Uint8Array(height * width * channels);

        var iy;
        var ix;
        var read;
        var write;

        if (useAlpha) {
            for (iy = 0; iy < height; iy++) {
                for (ix = 0; ix < width; ix++) {
                    read = (ix + x + (iy + y) * inputWidth) * inputChannels;
                    write = (ix + iy * width) * channels;

                    data[write] = inputData[read];
                    data[write + 1] = inputData[read + 1];
                    data[write + 2] = inputData[read + 2];
                    data[write + 3] = inputData[read + 3];
                }
            }
        } else {
            for (iy = 0; iy < height; iy++) {
                for (ix = 0; ix < width; ix++) {
                    read = (ix + x + (iy + y) * inputWidth) * inputChannels;
                    write = (ix + iy * width) * channels;

                    data[write] = inputData[read];
                    data[write + 1] = inputData[read + 1];
                    data[write + 2] = inputData[read + 2];
                }
            }
        }

        return new Bitmap(width, height, useAlpha, data);
    };
    return Bitmap;
})();

module.exports = Bitmap;
//# sourceMappingURL=Bitmap.js.map

},{"../font/Micro":15,"./RGBA":6,"./util":13}],2:[function(_dereq_,module,exports){
'use strict';
var Char = (function () {
    function Char(char, map) {
        this.char = char;
        this.width = map[0].length;
        this.map = [];

        for (var i = 0; i < map.length; i++) {
            var line = map[i];
            for (var c = 0; c < line.length; c++) {
                this.map.push((line.charAt(c) === '1'));
            }
        }
    }
    return Char;
})();

module.exports = Char;
//# sourceMappingURL=Char.js.map

},{}],3:[function(_dereq_,module,exports){
'use strict';
var FPS = (function () {
    function FPS(smoothFPS, smoothDelta) {
        if (typeof smoothFPS === "undefined") { smoothFPS = 30; }
        if (typeof smoothDelta === "undefined") { smoothDelta = 2; }
        this.tickHistory = [0];
        this.deltaHistory = [0];
        this.tickI = 0;
        this.deltaI = 0;
        this.smoothFPS = smoothFPS;
        this.smoothDelta = smoothDelta;
        this.previous = performance.now();
    }
    FPS.prototype.begin = function () {
        var now = performance.now();
        var delta = now - this.previous;
        this.tickHistory[this.tickI % this.smoothFPS] = delta;
        this.tickI++;
        this.previous = now;
    };

    FPS.prototype.end = function () {
        var now = performance.now();
        var delta = now - this.previous;
        this.deltaHistory[this.deltaI % this.smoothDelta] = delta;
        this.deltaI++;
    };

    Object.defineProperty(FPS.prototype, "fps", {
        get: function () {
            var tot = 0;
            for (var i = 0; i < this.tickHistory.length; i++) {
                tot += this.tickHistory[i];
            }
            return Math.ceil(1000 / (tot / this.tickHistory.length));
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FPS.prototype, "redraw", {
        get: function () {
            var tot = 0;
            for (var i = 0; i < this.deltaHistory.length; i++) {
                tot += this.deltaHistory[i];
            }
            return Math.ceil(tot / this.deltaHistory.length);
        },
        enumerable: true,
        configurable: true
    });
    return FPS;
})();

module.exports = FPS;
//# sourceMappingURL=FPS.js.map

},{}],4:[function(_dereq_,module,exports){
'use strict';
var Char = _dereq_('./Char');

var Font = (function () {
    function Font(name, height, data) {
        var _this = this;
        this.name = name;
        this.height = height;
        this.chars = Object.create(null);

        Object.keys(data).forEach(function (char) {
            _this.chars[char] = new Char(char, data[char]);
        });
    }
    return Font;
})();

module.exports = Font;
//# sourceMappingURL=Font.js.map

},{"./Char":2}],5:[function(_dereq_,module,exports){
'use strict';
var HSV = (function () {
    function HSV(h, s, v) {
        if (typeof h === "undefined") { h = 0; }
        if (typeof s === "undefined") { s = 0; }
        if (typeof v === "undefined") { v = 0; }
        this.h = h;
        this.s = s;
        this.v = v;
    }
    return HSV;
})();

module.exports = HSV;
//# sourceMappingURL=HSV.js.map

},{}],6:[function(_dereq_,module,exports){
'use strict';
var RGBA = (function () {
    function RGBA(r, g, b, a) {
        if (typeof r === "undefined") { r = 0; }
        if (typeof g === "undefined") { g = 0; }
        if (typeof b === "undefined") { b = 0; }
        if (typeof a === "undefined") { a = 255; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    return RGBA;
})();

module.exports = RGBA;
//# sourceMappingURL=RGBA.js.map

},{}],7:[function(_dereq_,module,exports){
'use strict';
var SpriteSheet = (function () {
    function SpriteSheet(width, height) {
        this.sprites = [];
        this.width = width;
        this.height = height;
    }
    SpriteSheet.prototype.getSprite = function (x, y) {
        return this.getSpriteAt(y * this.width + x);
    };

    SpriteSheet.prototype.getSpriteAt = function (index) {
        if (this.sprites.length === 0) {
            throw new Error('sheet has zero images');
        }
        return this.sprites[index % this.sprites.length];
    };

    SpriteSheet.prototype.addSprite = function (bitmap) {
        this.sprites.push(bitmap);
    };
    return SpriteSheet;
})();

module.exports = SpriteSheet;
//# sourceMappingURL=SpriteSheet.js.map

},{}],8:[function(_dereq_,module,exports){
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Bitmap = _dereq_('./Bitmap');

var CanvasRenderer = _dereq_('./../render/CanvasRenderer');
var WebGLRenderer = _dereq_('./../render/WebGLRenderer');

var autosize = _dereq_('./autosize');

var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage(opts) {
        _super.call(this, (opts.width || 32), (opts.height || 32), false);

        this.canvas = (typeof opts.canvas === 'string' ? document.getElementById(opts.canvas) : opts.canvas);
        if (!this.canvas) {
            throw new Error('cannot locate canvas with id "' + opts.canvas + '"');
        }

        this.clear();

        if (opts.renderer !== 'canvas') {
            try  {
                this.renderer = new WebGLRenderer(this, this.canvas);
            } catch (e) {
                console.log(e);
                console.log('render init error, switching to fallback');
            }
        }

        if (!this.renderer) {
            this.renderer = new CanvasRenderer(this, this.canvas);
        }

        this.autoSize = new autosize.AutoSize(this, {
            center: opts.center,
            scale: opts.scale
        });
    }
    Stage.prototype.resizeTo = function (width, height) {
        if (width === this.width && height === this.height) {
            return;
        }
        _super.prototype.resizeTo.call(this, width, height);
        this.autoSize.update();
    };

    Stage.prototype.render = function () {
        this.renderer.update();
    };

    Stage.prototype.destruct = function () {
        this.autoSize.stop();
        this.autoSize = null;
        this.renderer.destruct();
        this.renderer = null;
        this.canvas = null;
    };
    return Stage;
})(Bitmap);

module.exports = Stage;
//# sourceMappingURL=Stage.js.map

},{"./../render/CanvasRenderer":25,"./../render/WebGLRenderer":26,"./Bitmap":1,"./autosize":9}],9:[function(_dereq_,module,exports){
'use strict';
var browser = _dereq_('./browser');

function assertMode(scaleMode) {
    if ((typeof scaleMode === 'number' && scaleMode > 0) || scaleMode === 'max' || scaleMode === 'fit' || scaleMode === 'none') {
        return;
    }
    var int = parseInt(scaleMode, 10);
    if (!isNaN(int) && int > 0) {
        return;
    }
    throw new Error('bad scaleMode: ' + scaleMode);
}

var AutoSize = (function () {
    function AutoSize(stage, opts) {
        var _this = this;
        this.stage = stage;

        opts = opts || {};
        this.centerView = !!opts.center;
        this.scaleMode = opts.scale || 'none';
        assertMode(this.scaleMode);

        stage.canvas.style.position = 'absolute';

        this.update = function (event) {
            var viewPort = browser.getViewport();
            if (_this.scaleMode === 'fit') {
                _this.scaleFit(viewPort);
            } else if (_this.scaleMode === 'max') {
                _this.scaleAspect(viewPort);
            } else {
                _this.stage.renderer.resize();
            }

            if (_this.centerView || _this.scaleMode === 'max') {
                _this.moveScreenCenter(viewPort);
            } else {
                _this.moveScreenTo(0, 0);
            }
        };

        this.setMode(this.scaleMode, this.centerView);
    }
    AutoSize.prototype.scale = function (mode) {
        this.setMode(mode, this.centerView);
    };

    AutoSize.prototype.center = function (center) {
        if (typeof center === "undefined") { center = true; }
        this.setMode(this.scaleMode, center);
    };

    AutoSize.prototype.resize = function () {
        this.update();
    };

    AutoSize.prototype.stop = function () {
        this.unlisten();
    };

    AutoSize.prototype.scaleTo = function (width, height) {
        this.scaleMode = 'none';
        this.stage.canvas.width = width;
        this.stage.canvas.height = height;
        this.stage.renderer.resize();
    };

    AutoSize.prototype.scaleFit = function (viewPort) {
        this.stage.canvas.width = viewPort.width;
        this.stage.canvas.height = viewPort.height;
        this.stage.renderer.resize();
    };

    AutoSize.prototype.scaleAspect = function (viewPort) {
        var ratio = Math.min(viewPort.width / this.stage.width, viewPort.height / this.stage.height);
        this.stage.canvas.width = Math.floor(this.stage.width * ratio);
        this.stage.canvas.height = Math.floor(this.stage.height * ratio);
        this.stage.renderer.resize();
    };

    AutoSize.prototype.moveScreenTo = function (x, y) {
        this.stage.canvas.style.left = x + 'px';
        this.stage.canvas.style.top = y + 'px';
    };

    AutoSize.prototype.moveScreenCenter = function (viewPort) {
        this.moveScreenTo(Math.floor((viewPort.width - this.stage.canvas.width) / 2), Math.floor((viewPort.height - this.stage.canvas.height) / 2));
    };

    AutoSize.prototype.listen = function () {
        this.unlisten();
        if (this.centerView || this.scaleMode === 'fit') {
            window.addEventListener('resize', this.update);
        }
    };

    AutoSize.prototype.unlisten = function () {
        window.removeEventListener('resize', this.update);
    };

    AutoSize.prototype.setMode = function (mode, center) {
        assertMode(mode);

        this.scaleMode = mode;

        var multi = parseInt(this.scaleMode, 10);
        if (!isNaN(multi)) {
            this.scaleMode = multi;
            this.scaleTo(Math.floor(this.stage.width * multi), Math.floor(this.stage.height * multi));
            this.unlisten();
        }
        if (this.scaleMode === 'fit') {
            this.moveScreenTo(0, 0);
        }
        if (center || this.scaleMode === 'fit' || this.scaleMode === 'max') {
            this.listen();
        }
        this.update();
    };
    return AutoSize;
})();
exports.AutoSize = AutoSize;
//# sourceMappingURL=autosize.js.map

},{"./browser":10}],10:[function(_dereq_,module,exports){
'use strict';
function getViewport() {
    var e = window;
    var a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] };
}
exports.getViewport = getViewport;
//# sourceMappingURL=browser.js.map

},{}],11:[function(_dereq_,module,exports){
'use strict';
var RGBA = _dereq_('./RGBA');
var HSV = _dereq_('./HSV');

function hsv2rgb(hsv) {
    var r, g, b;
    var i;
    var f, p, q, t;
    var h = hsv.h;
    var s = hsv.s;
    var v = hsv.v;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s /= 100;
    v /= 100;

    if (s === 0) {
        r = g = b = v;
        return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    h /= 60;
    i = Math.floor(h);
    f = h - i;
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

        default:
            r = v;
            g = p;
            b = q;
    }

    return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}
exports.hsv2rgb = hsv2rgb;

function rgb2hsv(rgb) {
    var rr, gg, bb, r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, h, s, v = Math.max(r, g, b), diff = v - Math.min(r, g, b), diffc = function (c) {
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
    return new HSV(Math.round(h * 360), Math.round(s * 100), Math.round(v * 100));
}
exports.rgb2hsv = rgb2hsv;
//# sourceMappingURL=color.js.map

},{"./HSV":5,"./RGBA":6}],12:[function(_dereq_,module,exports){
'use strict';
function interval(callback, fps) {
    var intervalID = 0;
    var frame = 0;
    var prev = performance.now();

    function step() {
        if (intervalID) {
            frame++;
            var now = performance.now();
            callback(frame, now - prev);
            prev = now;
        }
    }

    var that = {};
    that.start = function () {
        if (intervalID) {
            clearInterval(intervalID);
        }
        intervalID = setInterval(step, 1000 / fps);
    };
    that.step = function () {
        step();
    };
    that.stop = function () {
        if (intervalID) {
            clearInterval(intervalID);
            intervalID = 0;
        }
    };
    that.isRunning = function () {
        return !!intervalID;
    };
    return that;
}
exports.interval = interval;

function request(callback) {
    var running = false;
    var frame = 0;
    var prev = performance.now();

    function step() {
        if (running) {
            frame++;
            var now = performance.now();
            callback(frame, now - prev);
            prev = now;
            requestAnimationFrame(step);
        }
    }

    var requestID;
    var that = {};
    that.start = function () {
        if (!running) {
            running = true;
            requestID = requestAnimationFrame(step);
        }
    };
    that.step = function () {
        step();
    };
    that.stop = function () {
        if (running) {
            running = false;
            cancelAnimationFrame(requestID);
        }
    };
    that.isRunning = function () {
        return running;
    };
    return that;
}
exports.request = request;
//# sourceMappingURL=ticker.js.map

},{}],13:[function(_dereq_,module,exports){
'use strict';
function rand(max) {
    return Math.floor(Math.random() * max);
}
exports.rand = rand;

function clamp(value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
exports.clamp = clamp;
//# sourceMappingURL=util.js.map

},{}],14:[function(_dereq_,module,exports){
var PerlinNoise = (function () {
    function PerlinNoise() {
        this.permutation = [
            151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
            251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
            49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ];
        this.p = new Array(512);

        for (var i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = this.permutation[i];
        }
    }
    PerlinNoise.prototype.noise = function (x, y, z) {
        var X = Math.floor(x) & 255;
        var Y = Math.floor(y) & 255;
        var Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        var u = this.fade(x);
        var v = this.fade(y);
        var w = this.fade(z);

        var A = this.p[X] + Y;
        var AA = this.p[A] + Z;
        var AB = this.p[A + 1] + Z;

        var B = this.p[X + 1] + Y;
        var BA = this.p[B] + Z;
        var BB = this.p[B + 1] + Z;

        return this.scale(this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)), this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)))));
    };

    PerlinNoise.prototype.fade = function (t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    PerlinNoise.prototype.lerp = function (t, a, b) {
        return a + t * (b - a);
    };

    PerlinNoise.prototype.grad = function (hash, x, y, z) {
        var h = hash & 15;
        var u = h < 8 ? x : y;
        var v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    };

    PerlinNoise.prototype.scale = function (n) {
        return (1 + n) / 2;
    };
    return PerlinNoise;
})();

module.exports = PerlinNoise;
//# sourceMappingURL=PerlinNoise.js.map

},{}],15:[function(_dereq_,module,exports){
'use strict';
var Font = _dereq_('../core/Font');

var font = new Font('micro', 4, {
    '0': [
        '111',
        '101',
        '101',
        '111'
    ],
    '1': [
        '01',
        '11',
        '01',
        '01'
    ],
    '2': [
        '110',
        '001',
        '010',
        '111'
    ],
    '3': [
        '111',
        '011',
        '001',
        '111'
    ],
    '4': [
        '100',
        '101',
        '111',
        '010'
    ],
    '5': [
        '111',
        '100',
        '111',
        '011'
    ],
    '6': [
        '100',
        '111',
        '101',
        '111'
    ],
    '7': [
        '111',
        '001',
        '010',
        '010'
    ],
    '8': [
        '111',
        '101',
        '111',
        '111'
    ],
    '9': [
        '111',
        '101',
        '111',
        '001'
    ],
    'A': [
        '111',
        '101',
        '111',
        '101'
    ],
    'B': [
        '100',
        '111',
        '101',
        '111'
    ],
    'C': [
        '111',
        '100',
        '100',
        '111'
    ],
    'D': [
        '110',
        '101',
        '101',
        '110'
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
        '1001',
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
        '111',
        '101',
        '111',
        '001'
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
        '010',
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
    '?': [
        '111',
        '001',
        '000',
        '010'
    ],
    '.': [
        '0',
        '0',
        '0',
        '1'
    ],
    ',': [
        '0',
        '0',
        '1',
        '1'
    ],
    '+': [
        '000',
        '010',
        '111',
        '010'
    ],
    '-': [
        '00',
        '00',
        '11',
        '00'
    ],
    '=': [
        '000',
        '111',
        '000',
        '111'
    ],
    '*': [
        '000',
        '101',
        '010',
        '101'
    ],
    '_': [
        '000',
        '000',
        '000',
        '111'
    ],
    '[': [
        '11',
        '10',
        '10',
        '11'
    ],
    ']': [
        '11',
        '01',
        '01',
        '11'
    ],
    '(': [
        '01',
        '10',
        '10',
        '01'
    ],
    ')': [
        '10',
        '01',
        '01',
        '10'
    ],
    '<': [
        '00',
        '01',
        '10',
        '01'
    ],
    '>': [
        '00',
        '10',
        '01',
        '10'
    ],
    '\'': [
        '1',
        '1',
        '0',
        '0'
    ],
    '"': [
        '101',
        '101',
        '000',
        '000'
    ],
    '`': [
        '10',
        '01',
        '00',
        '00'
    ],
    '~': [
        '000',
        '110',
        '011',
        '000'
    ],
    '/': [
        '001',
        '010',
        '010',
        '100'
    ],
    '\\': [
        '100',
        '010',
        '010',
        '001'
    ]
});

module.exports = font;
//# sourceMappingURL=Micro.js.map

},{"../core/Font":4}],16:[function(_dereq_,module,exports){
'use strict';
var Stage = _dereq_('./core/Stage');
exports.Stage = Stage;

var Bitmap = _dereq_('./core/Bitmap');
exports.Bitmap = Bitmap;
var FPS = _dereq_('./core/FPS');
exports.FPS = FPS;

var RGBA = _dereq_('./core/RGBA');
var HSV = _dereq_('./core/HSV');

var PerlinNoise = _dereq_('./extra/PerlinNoise');
exports.PerlinNoise = PerlinNoise;

var loader = _dereq_('./loaders/loader');
exports.loader = loader;

var _util = _dereq_('./core/util');
var rand = _util.rand;
exports.rand = rand;

var _color = _dereq_('./core/color');
var rgb2hsv = _color.rgb2hsv;
exports.rgb2hsv = rgb2hsv;
var hsv2rgb = _color.hsv2rgb;
exports.hsv2rgb = hsv2rgb;

var ticker = _dereq_('./core/ticker');
exports.ticker = ticker;

function rgb(r, g, b) {
    return new RGBA(r, g, b);
}
exports.rgb = rgb;

var hsvTmp = new HSV();
function hsv(h, s, v) {
    hsvTmp.h = h;
    hsvTmp.s = s;
    hsvTmp.v = v;
    return exports.hsv2rgb(hsvTmp);
}
exports.hsv = hsv;

[
    exports.loader,
    exports.PerlinNoise,
    _util,
    _color,
    exports.ticker,
    RGBA,
    HSV,
    exports.Bitmap,
    exports.FPS,
    exports.Stage
];
//# sourceMappingURL=index.js.map

},{"./core/Bitmap":1,"./core/FPS":3,"./core/HSV":5,"./core/RGBA":6,"./core/Stage":8,"./core/color":11,"./core/ticker":12,"./core/util":13,"./extra/PerlinNoise":14,"./loaders/loader":24}],17:[function(_dereq_,module,exports){
'use strict';
var Bitmap = _dereq_('../core/Bitmap');

var ImageDataLoader = _dereq_('./ImageDataLoader');

var BitmapLoader = (function () {
    function BitmapLoader(url, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.useAlpha = useAlpha;
    }
    BitmapLoader.prototype.load = function (callback) {
        var _this = this;
        new ImageDataLoader(this.url).load(function (err, image) {
            if (err) {
                callback(err, null);
                return;
            }

            if (_this.useAlpha) {
                callback(null, new Bitmap(image.width, image.height, true, image.data.buffer));
            } else {
                var bitmap = new Bitmap(image.width, image.height, false);
                var data = image.data;
                var width = image.width;

                for (var iy = 0; iy < image.height; iy++) {
                    for (var ix = 0; ix < width; ix++) {
                        var read = (iy * width + ix) * 4;
                        var write = (iy * width + ix) * 3;

                        bitmap.data[write] = data[read];
                        bitmap.data[write + 1] = data[read + 1];
                        bitmap.data[write + 2] = data[read + 2];
                    }
                }
                callback(null, bitmap);
            }
        });
    };
    return BitmapLoader;
})();

module.exports = BitmapLoader;
//# sourceMappingURL=BitmapLoader.js.map

},{"../core/Bitmap":1,"./ImageDataLoader":18}],18:[function(_dereq_,module,exports){
'use strict';
var ImageDataLoader = (function () {
    function ImageDataLoader(url) {
        this.url = url;
    }
    ImageDataLoader.prototype.load = function (callback) {
        var _this = this;
        var image = document.createElement('img');
        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            callback(null, ctx.getImageData(0, 0, image.width, image.height));

            image.onload = null;
            image.onerror = null;
        };
        image.onerror = function () {
            callback(new Error('cannot load ' + _this.url), null);

            image.onload = null;
            image.onerror = null;
        };

        image.src = this.url;
    };
    return ImageDataLoader;
})();

module.exports = ImageDataLoader;
//# sourceMappingURL=ImageDataLoader.js.map

},{}],19:[function(_dereq_,module,exports){
'use strict';
var TextLoader = _dereq_('./TextLoader');

var JSONLoader = (function () {
    function JSONLoader(url) {
        this.url = url;
    }
    JSONLoader.prototype.load = function (callback) {
        new TextLoader(this.url).load(function (err, text) {
            if (err) {
                callback(err, null);
                return;
            }
            try  {
                var obj = JSON.parse(text);
            } catch (e) {
                callback(e, null);
            }
            callback(null, obj);
        });
    };
    return JSONLoader;
})();

module.exports = JSONLoader;
//# sourceMappingURL=JSONLoader.js.map

},{"./TextLoader":23}],20:[function(_dereq_,module,exports){
'use strict';
var MultiLoader = (function () {
    function MultiLoader(loaders) {
        var _this = this;
        this.queued = [];
        if (loaders) {
            loaders.forEach(function (loader) {
                _this.queued.push(loader);
            });
        }
    }
    MultiLoader.prototype.load = function (callback) {
        var _this = this;
        var errored = false;
        var results = new Array(this.queued.length);

        this.queued.forEach(function (loader, index) {
            loader.load(function (err, res) {
                if (errored) {
                    return;
                }
                if (err) {
                    console.log(loader.url);
                    console.error(err);
                    callback(err, null);
                    errored = true;
                    return;
                }
                results[index] = res;
                _this.queued[index] = null;

                if (_this.queued.every(function (loader) {
                    return !loader;
                })) {
                    callback(err, results);
                    _this.queued = null;
                }
            });
        });
    };
    return MultiLoader;
})();

module.exports = MultiLoader;
//# sourceMappingURL=MultiLoader.js.map

},{}],21:[function(_dereq_,module,exports){
'use strict';
var JSONLoader = _dereq_('./JSONLoader');
var SpriteSheetLoader = _dereq_('./SpriteSheetLoader');

var urlExp = /^(.*?)(\/?)([^\/]+?)$/;

function getURL(main, append) {
    urlExp.lastIndex = 0;
    var match = urlExp.exec(main);
    return match[1] + match[2] + append;
}

var SpriteSheetJSONLoader = (function () {
    function SpriteSheetJSONLoader(url, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.useAlpha = useAlpha;
    }
    SpriteSheetJSONLoader.prototype.load = function (callback) {
        var _this = this;
        new JSONLoader(this.url).load(function (err, json) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log(json);
            new SpriteSheetLoader(getURL(_this.url, json.image), json, _this.useAlpha).load(callback);
        });
    };
    return SpriteSheetJSONLoader;
})();

module.exports = SpriteSheetJSONLoader;
//# sourceMappingURL=SpriteSheetJSONLoader.js.map

},{"./JSONLoader":19,"./SpriteSheetLoader":22}],22:[function(_dereq_,module,exports){
'use strict';
var Bitmap = _dereq_('../core/Bitmap');
var SpriteSheet = _dereq_('../core/SpriteSheet');

var ImageDataLoader = _dereq_('./ImageDataLoader');

var SpriteSheetLoader = (function () {
    function SpriteSheetLoader(url, opts, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.opts = opts;
        this.useAlpha = useAlpha;
    }
    SpriteSheetLoader.prototype.load = function (callback) {
        var _this = this;
        new ImageDataLoader(this.url).load(function (err, image) {
            if (err) {
                callback(err, null);
                return;
            }

            var outerMargin = (_this.opts.outerMargin || 0);
            var innerMargin = (_this.opts.innerMargin || 0);

            var sheet = new SpriteSheet(_this.opts.spritesX, _this.opts.spritesY);

            for (var iy = 0; iy < _this.opts.spritesY; iy++) {
                for (var ix = 0; ix < _this.opts.spritesX; ix++) {
                    var x = outerMargin + ix * (_this.opts.sizeX + innerMargin);
                    var y = outerMargin + iy * (_this.opts.sizeY + innerMargin);
                    sheet.addSprite(Bitmap.clipFromData(image.data, image.width, image.height, 4, x, y, _this.opts.sizeX, _this.opts.sizeY, _this.useAlpha));
                }
            }
            callback(null, sheet);
        });
    };
    return SpriteSheetLoader;
})();

module.exports = SpriteSheetLoader;
//# sourceMappingURL=SpriteSheetLoader.js.map

},{"../core/Bitmap":1,"../core/SpriteSheet":7,"./ImageDataLoader":18}],23:[function(_dereq_,module,exports){
'use strict';
function getXHR() {
    if (XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    try  {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
    } catch (e) {
    }
    try  {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
    } catch (e) {
    }
    try  {
        return new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {
    }
    throw new Error('This browser does not support XMLHttpRequest.');
}

var TextLoader = (function () {
    function TextLoader(url) {
        this.url = url;
    }
    TextLoader.prototype.load = function (callback) {
        try  {
            var xhr = getXHR();
        } catch (e) {
            callback(e, null);
            return;
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback(null, xhr.responseText);
            }
        };

        xhr.open('GET', this.url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(null);
    };
    return TextLoader;
})();

module.exports = TextLoader;
//# sourceMappingURL=TextLoader.js.map

},{}],24:[function(_dereq_,module,exports){
var ImageDataLoader = _dereq_('./ImageDataLoader');
exports.ImageDataLoader = ImageDataLoader;
var BitmapLoader = _dereq_('./BitmapLoader');
exports.BitmapLoader = BitmapLoader;
var TextLoader = _dereq_('./TextLoader');
exports.TextLoader = TextLoader;
var JSONLoader = _dereq_('./JSONLoader');
exports.JSONLoader = JSONLoader;
var SpriteSheetLoader = _dereq_('./SpriteSheetLoader');
exports.SpriteSheetLoader = SpriteSheetLoader;
var SpriteSheetJSONLoader = _dereq_('./SpriteSheetJSONLoader');
exports.SpriteSheetJSONLoader = SpriteSheetJSONLoader;
var MultiLoader = _dereq_('./MultiLoader');
exports.MultiLoader = MultiLoader;

[
    exports.MultiLoader,
    exports.ImageDataLoader,
    exports.BitmapLoader,
    exports.TextLoader,
    exports.JSONLoader,
    exports.SpriteSheetLoader,
    exports.SpriteSheetJSONLoader
];
//# sourceMappingURL=loader.js.map

},{"./BitmapLoader":17,"./ImageDataLoader":18,"./JSONLoader":19,"./MultiLoader":20,"./SpriteSheetJSONLoader":21,"./SpriteSheetLoader":22,"./TextLoader":23}],25:[function(_dereq_,module,exports){
'use strict';
function clearAlpha(data) {
    var lim = data.length;
    for (var i = 3; i < lim; i++) {
        data[i] = 255;
    }
}

var CanvasRender = (function () {
    function CanvasRender(bitmap, canvas) {
        this.canvas = canvas;

        this.px = bitmap.data;
        this.width = bitmap.width;
        this.height = bitmap.height;
        this.channels = bitmap.useAlpha ? 4 : 3;

        this.ctx = this.canvas.getContext('2d');

        this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

        clearAlpha(this.output.data);

        this.ctx.putImageData(this.output, 0, 0);
    }
    CanvasRender.prototype.resize = function () {
        if (this.output.width !== this.canvas.width || this.output.height !== this.canvas.height) {
            this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

            clearAlpha(this.output.data);
        }
    };

    CanvasRender.prototype.update = function () {
        var data = this.output.data;
        var width = this.output.width;
        var height = this.output.height;

        var fx = this.width / width;
        var fy = this.height / height;

        for (var iy = 0; iy < height; iy++) {
            for (var ix = 0; ix < width; ix++) {
                var x = Math.floor(ix * fx);
                var y = Math.floor(iy * fy);
                var read = (x + y * this.width) * this.channels;
                var write = (ix + iy * width) * 4;

                data[write] = this.px[read];
                data[write + 1] = this.px[read + 1];
                data[write + 2] = this.px[read + 2];
            }
        }
        this.ctx.putImageData(this.output, 0, 0);
    };

    CanvasRender.prototype.destruct = function () {
        this.px = null;
        this.ctx = null;
        this.canvas = null;
        this.output = null;
    };
    return CanvasRender;
})();

module.exports = CanvasRender;
//# sourceMappingURL=CanvasRenderer.js.map

},{}],26:[function(_dereq_,module,exports){
'use strict';
var vertexShaderSource = [
    'attribute vec2 a_position;',
    'attribute vec2 a_texCoord;',
    'varying vec2 v_texCoord;',
    'void main() {',
    '    gl_Position = vec4(a_position, 0, 1);',
    '    v_texCoord = a_texCoord;',
    '}'
].join('\n');

var fragmentShaderSource = [
    'precision mediump float;',
    'uniform sampler2D u_image;',
    'varying vec2 v_texCoord;',
    'void main() {',
    '    gl_FragColor = texture2D(u_image, v_texCoord);',
    '}'
].join('\n');

function loadShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        throw new Error('error compiling shader "' + shader + '":' + gl.getShaderInfoLog(shader));
    }
    return shader;
}

var WebGLRender = (function () {
    function WebGLRender(bitmap, canvas) {
        this.canvas = canvas;
        this.width = bitmap.width;
        this.height = bitmap.height;

        this.px = new Uint8Array(bitmap.buffer);

        if (!window.WebGLRenderingContext) {
            throw new Error('browser does not support WegGL');
        }

        var glOpts = { alpha: false };

        var gl = this.gl = this.canvas.getContext('webgl', glOpts) || this.canvas.getContext('experimental-webgl', glOpts);
        if (!gl) {
            throw new Error('could not create WebGL context');
        }

        var program = gl.createProgram();

        gl.attachShader(program, loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
        gl.attachShader(program, loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(program);

        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            throw new Error(('error in program linking:' + gl.getProgramInfoLog(program)));
        }
        gl.useProgram(program);

        this.positionLocation = gl.getAttribLocation(program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]), gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);

        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            1.0, 0.0
        ]), gl.STATIC_DRAW);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.colorMask(true, true, true, false);

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    WebGLRender.prototype.resize = function () {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    };

    WebGLRender.prototype.update = function () {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.px);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };

    WebGLRender.prototype.destruct = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl = null;
        this.px = null;
        this.canvas = null;
    };
    return WebGLRender;
})();

module.exports = WebGLRender;
//# sourceMappingURL=WebGLRenderer.js.map

},{}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJEOlxcX0VkaXRpbmdcXGdpdGh1YlxcMzJrXFxmcmFtZWJ1ZmZlckpTXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL0JpdG1hcC5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL0NoYXIuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvY29yZS9GUFMuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvY29yZS9Gb250LmpzIiwiRDovX0VkaXRpbmcvZ2l0aHViLzMyay9mcmFtZWJ1ZmZlckpTL2J1aWxkL2NvcmUvSFNWLmpzIiwiRDovX0VkaXRpbmcvZ2l0aHViLzMyay9mcmFtZWJ1ZmZlckpTL2J1aWxkL2NvcmUvUkdCQS5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL1Nwcml0ZVNoZWV0LmpzIiwiRDovX0VkaXRpbmcvZ2l0aHViLzMyay9mcmFtZWJ1ZmZlckpTL2J1aWxkL2NvcmUvU3RhZ2UuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvY29yZS9hdXRvc2l6ZS5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL2Jyb3dzZXIuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvY29yZS9jb2xvci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL3RpY2tlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9jb3JlL3V0aWwuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvZXh0cmEvUGVybGluTm9pc2UuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvZm9udC9NaWNyby5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9pbmRleC5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL0JpdG1hcExvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL0ltYWdlRGF0YUxvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL0pTT05Mb2FkZXIuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvbG9hZGVycy9NdWx0aUxvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL1Nwcml0ZVNoZWV0SlNPTkxvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL1Nwcml0ZVNoZWV0TG9hZGVyLmpzIiwiRDovX0VkaXRpbmcvZ2l0aHViLzMyay9mcmFtZWJ1ZmZlckpTL2J1aWxkL2xvYWRlcnMvVGV4dExvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9sb2FkZXJzL2xvYWRlci5qcyIsIkQ6L19FZGl0aW5nL2dpdGh1Yi8zMmsvZnJhbWVidWZmZXJKUy9idWlsZC9yZW5kZXIvQ2FudmFzUmVuZGVyZXIuanMiLCJEOi9fRWRpdGluZy9naXRodWIvMzJrL2ZyYW1lYnVmZmVySlMvYnVpbGQvcmVuZGVyL1dlYkdMUmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxudmFyIFJHQkEgPSByZXF1aXJlKCcuL1JHQkEnKTtcclxuXHJcbnZhciBtaWNyb0ZvbnQgPSByZXF1aXJlKCcuLi9mb250L01pY3JvJyk7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG5cclxudmFyIGNsYW1wID0gdXRpbC5jbGFtcDtcclxuXHJcbnZhciBhbHBoYSA9IG5ldyBSR0JBKDAsIDAsIDAsIDApO1xyXG52YXIgYmxhY2sgPSBuZXcgUkdCQSgwLCAwLCAwKTtcclxudmFyIG1hZ2VudGEgPSBuZXcgUkdCQSgyNTUsIDAsIDI1NSk7XHJcblxyXG52YXIgQml0bWFwID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJpdG1hcCh3aWR0aCwgaGVpZ2h0LCB1c2VBbHBoYSwgYnVmZmVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VBbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyB1c2VBbHBoYSA9IGZhbHNlOyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBidWZmZXIgPT09IFwidW5kZWZpbmVkXCIpIHsgYnVmZmVyID0gbnVsbDsgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnVzZUFscGhhID0gdXNlQWxwaGE7XHJcbiAgICAgICAgdGhpcy5jaGFubmVscyA9ICh1c2VBbHBoYSA/IDQgOiAzKTtcclxuXHJcbiAgICAgICAgaWYgKGJ1ZmZlcikge1xyXG4gICAgICAgICAgICB2YXIgdG90YWwgPSAodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogdGhpcy5jaGFubmVscyk7XHJcbiAgICAgICAgICAgIGlmIChidWZmZXIuYnl0ZUxlbmd0aCAhPT0gdG90YWwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHJhdyBkYXRhIGRpbWVuc2lvbnM7IGV4cGVjdGVkICcgKyB0b3RhbCArICcsIHJlY2VpdmVkICcgKyBidWZmZXIuYnl0ZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLmJ1ZmZlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzZXREYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5fcmVzZXREYXRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIHRoaXMuY2hhbm5lbHMpO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy5idWZmZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBCaXRtYXAucHJvdG90eXBlLnJlc2l6ZVRvID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICBpZiAod2lkdGggPT09IHRoaXMud2lkdGggJiYgaGVpZ2h0ID09PSB0aGlzLmhlaWdodCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLl9yZXNldERhdGEoKTtcclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5zZXRQaXhlbCA9IGZ1bmN0aW9uICh4LCB5LCBjb2wpIHtcclxuICAgICAgICB4ID0gTWF0aC5mbG9vcih4KTtcclxuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcclxuXHJcbiAgICAgICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5ID49IHRoaXMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHAgPSAoeCArIHkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgdGhpcy5kYXRhW3BdID0gY29sLnI7XHJcbiAgICAgICAgdGhpcy5kYXRhW3AgKyAxXSA9IGNvbC5nO1xyXG4gICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5nZXRQaXhlbCA9IGZ1bmN0aW9uICh4LCB5LCBjb2wpIHtcclxuICAgICAgICB4ID0gTWF0aC5mbG9vcih4KTtcclxuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcclxuXHJcbiAgICAgICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5ID49IHRoaXMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb2wgPSAoY29sIHx8IG5ldyBSR0JBKCkpO1xyXG5cclxuICAgICAgICB2YXIgcCA9ICh4ICsgeSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcclxuICAgICAgICBjb2wuciA9IHRoaXMuZGF0YVtwXTtcclxuICAgICAgICBjb2wuZyA9IHRoaXMuZGF0YVtwICsgMV07XHJcbiAgICAgICAgY29sLmIgPSB0aGlzLmRhdGFbcCArIDJdO1xyXG4gICAgICAgIHJldHVybiBjb2w7XHJcbiAgICB9O1xyXG5cclxuICAgIEJpdG1hcC5wcm90b3R5cGUuZmlsbFJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoeCk7XHJcbiAgICAgICAgeSA9IE1hdGguZmxvb3IoeSk7XHJcbiAgICAgICAgdyA9IE1hdGguZmxvb3Iodyk7XHJcbiAgICAgICAgaCA9IE1hdGguZmxvb3IoaCk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGl5ID0geTsgaXkgPCB5ICsgaDsgaXkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpeCA9IHg7IGl4IDwgeCArIHc7IGl4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChpeCA8IDAgfHwgaXkgPCAwIHx8IGl4ID49IHRoaXMud2lkdGggfHwgaXkgPj0gdGhpcy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBwID0gKGl4ICsgaXkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMV0gPSBjb2wuZztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5kcmF3TGluZUggPSBmdW5jdGlvbiAoeCwgeSwgc2l6ZSwgY29sKSB7XHJcbiAgICAgICAgdmFyIHJpZ2h0ID0gY2xhbXAoTWF0aC5mbG9vcih4ICsgc2l6ZSksIDAsIHRoaXMud2lkdGgpO1xyXG4gICAgICAgIHggPSBjbGFtcChNYXRoLmZsb29yKHgpLCAwLCB0aGlzLndpZHRoKTtcclxuICAgICAgICB5ID0gY2xhbXAoTWF0aC5mbG9vcih5KSwgMCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBmb3IgKDsgeCA8IHJpZ2h0OyB4KyspIHtcclxuICAgICAgICAgICAgdmFyIHAgPSAoeCArIHkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwXSA9IGNvbC5yO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbcCArIDFdID0gY29sLmc7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEJpdG1hcC5wcm90b3R5cGUuZHJhd0xpbmVWID0gZnVuY3Rpb24gKHgsIHksIHNpemUsIGNvbCkge1xyXG4gICAgICAgIHZhciBib3R0b20gPSBjbGFtcChNYXRoLmZsb29yKHkgKyBzaXplKSwgMCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHggPSBjbGFtcChNYXRoLmZsb29yKHgpLCAwLCB0aGlzLndpZHRoKTtcclxuICAgICAgICB5ID0gY2xhbXAoTWF0aC5mbG9vcih5KSwgMCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBmb3IgKDsgeSA8IGJvdHRvbTsgeSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwID0gKHggKyB5ICogdGhpcy53aWR0aCkgKiB0aGlzLmNoYW5uZWxzO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcclxuICAgICAgICAgICAgdGhpcy5kYXRhW3AgKyAxXSA9IGNvbC5nO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbcCArIDJdID0gY29sLmI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBCaXRtYXAucHJvdG90eXBlLmRyYXdSZWN0ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvbCkge1xyXG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xyXG4gICAgICAgIHkgPSBNYXRoLmZsb29yKHkpO1xyXG4gICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aWR0aCk7XHJcbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQpO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdMaW5lSCh4LCB5LCB3aWR0aCwgY29sKTtcclxuICAgICAgICB0aGlzLmRyYXdMaW5lSCh4LCB5ICsgaGVpZ2h0IC0gMSwgd2lkdGgsIGNvbCk7XHJcbiAgICAgICAgdGhpcy5kcmF3TGluZVYoeCwgeSwgaGVpZ2h0LCBjb2wpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpbmVWKHggKyB3aWR0aCAtIDEsIHksIGhlaWdodCwgY29sKTtcclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5maWxsQ2lyY2xlID0gZnVuY3Rpb24gKHgsIHksIHIsIGNvbCkge1xyXG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xyXG4gICAgICAgIHkgPSBNYXRoLmZsb29yKHkpO1xyXG4gICAgICAgIHIgPSBNYXRoLmZsb29yKHIpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpeSA9IC1yOyBpeSA8PSByOyBpeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGl4ID0gLXI7IGl4IDw9IHI7IGl4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh4ICsgaXggPCAwIHx8IHkgKyBpeSA8IDAgfHwgeCArIGl4ID49IHRoaXMud2lkdGggfHwgeSArIGl5ID49IHRoaXMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXggKiBpeCArIGl5ICogaXkgPD0gciAqIHIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcCA9ICh4ICsgaXggKyAoeSArIGl5KSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcCArIDFdID0gY29sLmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhW3AgKyAyXSA9IGNvbC5iO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBCaXRtYXAucHJvdG90eXBlLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSwgciwgY29sKSB7XHJcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoeCk7XHJcbiAgICAgICAgeSA9IE1hdGguZmxvb3IoeSk7XHJcbiAgICAgICAgciA9IE1hdGguZmxvb3Iocik7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzYwOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGN4ID0gTWF0aC5yb3VuZChNYXRoLmNvcyhpICogKE1hdGguUEkgLyAxODApKSAqIHIpICsgeDtcclxuICAgICAgICAgICAgdmFyIGN5ID0gTWF0aC5yb3VuZChNYXRoLnNpbihpICogKE1hdGguUEkgLyAxODApKSAqIHIpICsgeTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjeCA8IDAgfHwgY3kgPCAwIHx8IGN4ID49IHRoaXMud2lkdGggfHwgY3kgPj0gdGhpcy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBwID0gKGN4ICsgY3kgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwXSA9IGNvbC5yO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbcCArIDFdID0gY29sLmc7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEJpdG1hcC5wcm90b3R5cGUuc2hhZGVyID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB2YXIgaXk7XHJcbiAgICAgICAgdmFyIGl4O1xyXG4gICAgICAgIHZhciBwO1xyXG4gICAgICAgIHZhciBjb2w7XHJcblxyXG4gICAgICAgIHZhciByZ2IgPSBuZXcgUkdCQSgpO1xyXG5cclxuICAgICAgICBmb3IgKGl5ID0gMDsgaXkgPCB0aGlzLmhlaWdodDsgaXkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGl4ID0gMDsgaXggPCB0aGlzLndpZHRoOyBpeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBwID0gKGl4ICsgaXkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICByZ2IuciA9IHRoaXMuZGF0YVtwXTtcclxuICAgICAgICAgICAgICAgIHJnYi5nID0gdGhpcy5kYXRhW3AgKyAxXTtcclxuICAgICAgICAgICAgICAgIHJnYi5iID0gdGhpcy5kYXRhW3AgKyAyXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb2wgPSBmKGl4LCBpeSwgcmdiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMV0gPSBjb2wuZztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24gKHgsIHksIHR4dCwgY29sKSB7XHJcbiAgICAgICAgdHh0ID0gU3RyaW5nKHR4dCk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHh0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHggKz0gdGhpcy5kcmF3Q2hhcih4LCB5LCB0eHQuY2hhckF0KGkpLCBjb2wpICsgMTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEJpdG1hcC5wcm90b3R5cGUuZHJhd0NoYXIgPSBmdW5jdGlvbiAoeCwgeSwgY2hyLCBjb2wpIHtcclxuICAgICAgICB2YXIgY2hhciA9IG1pY3JvRm9udC5jaGFyc1tjaHIudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFjaGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh2YXIgaXkgPSAwOyBpeSA8IG1pY3JvRm9udC5oZWlnaHQ7IGl5KyspIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaXggPSAwOyBpeCA8IGNoYXIud2lkdGg7IGl4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGFyLm1hcFtpeSAqIGNoYXIud2lkdGggKyBpeF0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBpeGVsKHggKyBpeCwgeSArIGl5LCBjb2wpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGFyLndpZHRoO1xyXG4gICAgfTtcclxuXHJcbiAgICBCaXRtYXAucHJvdG90eXBlLmJsaXQgPSBmdW5jdGlvbiAoc3ByaXRlLCB4LCB5KSB7XHJcbiAgICAgICAgeCA9ICh4ID8gTWF0aC5mbG9vcih4KSA6IDApO1xyXG4gICAgICAgIHkgPSAoeSA/IE1hdGguZmxvb3IoeSkgOiAwKTtcclxuXHJcbiAgICAgICAgdmFyIGl5O1xyXG4gICAgICAgIHZhciBpeDtcclxuICAgICAgICB2YXIgcmVhZDtcclxuICAgICAgICB2YXIgd3JpdGU7XHJcblxyXG4gICAgICAgIGlmICh4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCB8fCB4ICsgc3ByaXRlLndpZHRoIDwgMCB8fCB5ICsgc3ByaXRlLmhlaWdodCA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGxlZnQgPSB4O1xyXG4gICAgICAgIHZhciByaWdodCA9IHggKyBzcHJpdGUud2lkdGg7XHJcbiAgICAgICAgdmFyIHRvcCA9IHk7XHJcbiAgICAgICAgdmFyIGJvdHRvbSA9IHkgKyBzcHJpdGUuaGVpZ2h0O1xyXG5cclxuICAgICAgICBpZiAobGVmdCA8IDApIHtcclxuICAgICAgICAgICAgbGVmdCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0b3AgPCAwKSB7XHJcbiAgICAgICAgICAgIHRvcCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmlnaHQgPj0gdGhpcy53aWR0aCkge1xyXG4gICAgICAgICAgICByaWdodCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChib3R0b20gPj0gdGhpcy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgYm90dG9tID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3ByaXRlLnVzZUFscGhhKSB7XHJcbiAgICAgICAgICAgIGZvciAoaXkgPSB0b3A7IGl5IDwgYm90dG9tOyBpeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGl4ID0gbGVmdDsgaXggPCByaWdodDsgaXgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSAoaXggLSB4ICsgKGl5IC0geSkgKiBzcHJpdGUud2lkdGgpICogc3ByaXRlLmNoYW5uZWxzO1xyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRlID0gKGl4ICsgaXkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhbHBoYSA9IHNwcml0ZS5kYXRhW3JlYWQgKyAzXSAvIDI1NTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW52ID0gMSAtIGFscGhhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVt3cml0ZV0gPSBNYXRoLnJvdW5kKHRoaXMuZGF0YVt3cml0ZV0gKiBpbnYgKyBzcHJpdGUuZGF0YVtyZWFkXSAqIGFscGhhKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbd3JpdGUgKyAxXSA9IE1hdGgucm91bmQodGhpcy5kYXRhW3dyaXRlICsgMV0gKiBpbnYgKyBzcHJpdGUuZGF0YVtyZWFkICsgMV0gKiBhbHBoYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhW3dyaXRlICsgMl0gPSBNYXRoLnJvdW5kKHRoaXMuZGF0YVt3cml0ZSArIDJdICogaW52ICsgc3ByaXRlLmRhdGFbcmVhZCArIDJdICogYWxwaGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpeSA9IHRvcDsgaXkgPCBib3R0b207IGl5KyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaXggPSBsZWZ0OyBpeCA8IHJpZ2h0OyBpeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZCA9IChpeCAtIHggKyAoaXkgLSB5KSAqIHNwcml0ZS53aWR0aCkgKiBzcHJpdGUuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUgPSAoaXggKyBpeSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhW3dyaXRlXSA9IHNwcml0ZS5kYXRhW3JlYWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVt3cml0ZSArIDFdID0gc3ByaXRlLmRhdGFbcmVhZCArIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVt3cml0ZSArIDJdID0gc3ByaXRlLmRhdGFbcmVhZCArIDJdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBCaXRtYXAucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKGNvbG9yKSB7XHJcbiAgICAgICAgY29sb3IgPSBjb2xvciB8fCBibGFjaztcclxuXHJcbiAgICAgICAgdmFyIGxpbTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudXNlQWxwaGEpIHtcclxuICAgICAgICAgICAgbGltID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogNDtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpbTsgaSArPSA0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSBjb2xvci5yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2kgKyAxXSA9IGNvbG9yLmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSArIDJdID0gY29sb3IuYjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpICsgM10gPSBjb2xvci5hO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGltID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogMztcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpbTsgaSArPSAzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSBjb2xvci5yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2kgKyAxXSA9IGNvbG9yLmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSArIDJdID0gY29sb3IuYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLnByb3RvdHlwZS5jbGVhckFscGhhID0gZnVuY3Rpb24gKGFscGhhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyBhbHBoYSA9IDA7IH1cclxuICAgICAgICBpZiAoIXRoaXMudXNlQWxwaGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbGltID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogNDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMzsgaSA8IGxpbTsgaSArPSA0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IGFscGhhO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQml0bWFwLmNsaXBGcm9tRGF0YSA9IGZ1bmN0aW9uIChpbnB1dERhdGEsIGlucHV0V2lkdGgsIGlucHV0SGVpZ2h0LCBpbnB1dENoYW5uZWxzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB1c2VBbHBoYSkge1xyXG4gICAgICAgIHZhciBjaGFubmVscyA9IHVzZUFscGhhID8gNCA6IDM7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheShoZWlnaHQgKiB3aWR0aCAqIGNoYW5uZWxzKTtcclxuXHJcbiAgICAgICAgdmFyIGl5O1xyXG4gICAgICAgIHZhciBpeDtcclxuICAgICAgICB2YXIgcmVhZDtcclxuICAgICAgICB2YXIgd3JpdGU7XHJcblxyXG4gICAgICAgIGlmICh1c2VBbHBoYSkge1xyXG4gICAgICAgICAgICBmb3IgKGl5ID0gMDsgaXkgPCBoZWlnaHQ7IGl5KyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaXggPSAwOyBpeCA8IHdpZHRoOyBpeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZCA9IChpeCArIHggKyAoaXkgKyB5KSAqIGlucHV0V2lkdGgpICogaW5wdXRDaGFubmVscztcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZSA9IChpeCArIGl5ICogd2lkdGgpICogY2hhbm5lbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbd3JpdGVdID0gaW5wdXREYXRhW3JlYWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbd3JpdGUgKyAxXSA9IGlucHV0RGF0YVtyZWFkICsgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVt3cml0ZSArIDJdID0gaW5wdXREYXRhW3JlYWQgKyAyXTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgM10gPSBpbnB1dERhdGFbcmVhZCArIDNdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpeSA9IDA7IGl5IDwgaGVpZ2h0OyBpeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGl4ID0gMDsgaXggPCB3aWR0aDsgaXgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSAoaXggKyB4ICsgKGl5ICsgeSkgKiBpbnB1dFdpZHRoKSAqIGlucHV0Q2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUgPSAoaXggKyBpeSAqIHdpZHRoKSAqIGNoYW5uZWxzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlXSA9IGlucHV0RGF0YVtyZWFkXTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMV0gPSBpbnB1dERhdGFbcmVhZCArIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbd3JpdGUgKyAyXSA9IGlucHV0RGF0YVtyZWFkICsgMl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQml0bWFwKHdpZHRoLCBoZWlnaHQsIHVzZUFscGhhLCBkYXRhKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQml0bWFwO1xyXG59KSgpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCaXRtYXA7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJpdG1hcC5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgQ2hhciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDaGFyKGNoYXIsIG1hcCkge1xyXG4gICAgICAgIHRoaXMuY2hhciA9IGNoYXI7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IG1hcFswXS5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGxpbmUgPSBtYXBbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgbGluZS5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAucHVzaCgobGluZS5jaGFyQXQoYykgPT09ICcxJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIENoYXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNoYXIuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIEZQUyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBGUFMoc21vb3RoRlBTLCBzbW9vdGhEZWx0YSkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc21vb3RoRlBTID09PSBcInVuZGVmaW5lZFwiKSB7IHNtb290aEZQUyA9IDMwOyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzbW9vdGhEZWx0YSA9PT0gXCJ1bmRlZmluZWRcIikgeyBzbW9vdGhEZWx0YSA9IDI7IH1cclxuICAgICAgICB0aGlzLnRpY2tIaXN0b3J5ID0gWzBdO1xyXG4gICAgICAgIHRoaXMuZGVsdGFIaXN0b3J5ID0gWzBdO1xyXG4gICAgICAgIHRoaXMudGlja0kgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVsdGFJID0gMDtcclxuICAgICAgICB0aGlzLnNtb290aEZQUyA9IHNtb290aEZQUztcclxuICAgICAgICB0aGlzLnNtb290aERlbHRhID0gc21vb3RoRGVsdGE7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgfVxyXG4gICAgRlBTLnByb3RvdHlwZS5iZWdpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgdmFyIGRlbHRhID0gbm93IC0gdGhpcy5wcmV2aW91cztcclxuICAgICAgICB0aGlzLnRpY2tIaXN0b3J5W3RoaXMudGlja0kgJSB0aGlzLnNtb290aEZQU10gPSBkZWx0YTtcclxuICAgICAgICB0aGlzLnRpY2tJKys7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG5vdztcclxuICAgIH07XHJcblxyXG4gICAgRlBTLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IG5vdyAtIHRoaXMucHJldmlvdXM7XHJcbiAgICAgICAgdGhpcy5kZWx0YUhpc3RvcnlbdGhpcy5kZWx0YUkgJSB0aGlzLnNtb290aERlbHRhXSA9IGRlbHRhO1xyXG4gICAgICAgIHRoaXMuZGVsdGFJKys7XHJcbiAgICB9O1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGUFMucHJvdG90eXBlLCBcImZwc1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3QgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlja0hpc3RvcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRvdCArPSB0aGlzLnRpY2tIaXN0b3J5W2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoMTAwMCAvICh0b3QgLyB0aGlzLnRpY2tIaXN0b3J5Lmxlbmd0aCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGUFMucHJvdG90eXBlLCBcInJlZHJhd1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3QgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGVsdGFIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0b3QgKz0gdGhpcy5kZWx0YUhpc3RvcnlbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0b3QgLyB0aGlzLmRlbHRhSGlzdG9yeS5sZW5ndGgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIEZQUztcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRlBTO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1GUFMuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIENoYXIgPSByZXF1aXJlKCcuL0NoYXInKTtcclxuXHJcbnZhciBGb250ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEZvbnQobmFtZSwgaGVpZ2h0LCBkYXRhKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2hhcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChjaGFyKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmNoYXJzW2NoYXJdID0gbmV3IENoYXIoY2hhciwgZGF0YVtjaGFyXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gRm9udDtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRm9udDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Rm9udC5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgSFNWID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEhTVihoLCBzLCB2KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoID09PSBcInVuZGVmaW5lZFwiKSB7IGggPSAwOyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzID09PSBcInVuZGVmaW5lZFwiKSB7IHMgPSAwOyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSBcInVuZGVmaW5lZFwiKSB7IHYgPSAwOyB9XHJcbiAgICAgICAgdGhpcy5oID0gaDtcclxuICAgICAgICB0aGlzLnMgPSBzO1xyXG4gICAgICAgIHRoaXMudiA9IHY7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSFNWO1xyXG59KSgpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIU1Y7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUhTVi5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgUkdCQSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSR0JBKHIsIGcsIGIsIGEpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHIgPT09IFwidW5kZWZpbmVkXCIpIHsgciA9IDA7IH1cclxuICAgICAgICBpZiAodHlwZW9mIGcgPT09IFwidW5kZWZpbmVkXCIpIHsgZyA9IDA7IH1cclxuICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwidW5kZWZpbmVkXCIpIHsgYiA9IDA7IH1cclxuICAgICAgICBpZiAodHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIpIHsgYSA9IDI1NTsgfVxyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy5nID0gZztcclxuICAgICAgICB0aGlzLmIgPSBiO1xyXG4gICAgICAgIHRoaXMuYSA9IGE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUkdCQTtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUkdCQTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UkdCQS5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgU3ByaXRlU2hlZXQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU3ByaXRlU2hlZXQod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIH1cclxuICAgIFNwcml0ZVNoZWV0LnByb3RvdHlwZS5nZXRTcHJpdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNwcml0ZUF0KHkgKiB0aGlzLndpZHRoICsgeCk7XHJcbiAgICB9O1xyXG5cclxuICAgIFNwcml0ZVNoZWV0LnByb3RvdHlwZS5nZXRTcHJpdGVBdCA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNwcml0ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2hlZXQgaGFzIHplcm8gaW1hZ2VzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnNwcml0ZXNbaW5kZXggJSB0aGlzLnNwcml0ZXMubGVuZ3RoXTtcclxuICAgIH07XHJcblxyXG4gICAgU3ByaXRlU2hlZXQucHJvdG90eXBlLmFkZFNwcml0ZSA9IGZ1bmN0aW9uIChiaXRtYXApIHtcclxuICAgICAgICB0aGlzLnNwcml0ZXMucHVzaChiaXRtYXApO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBTcHJpdGVTaGVldDtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlU2hlZXQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNwcml0ZVNoZWV0LmpzLm1hcFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbnZhciBfX2V4dGVuZHMgPSB0aGlzLl9fZXh0ZW5kcyB8fCBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xyXG4gICAgZC5wcm90b3R5cGUgPSBuZXcgX18oKTtcclxufTtcclxudmFyIEJpdG1hcCA9IHJlcXVpcmUoJy4vQml0bWFwJyk7XHJcblxyXG52YXIgQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuLy4uL3JlbmRlci9DYW52YXNSZW5kZXJlcicpO1xyXG52YXIgV2ViR0xSZW5kZXJlciA9IHJlcXVpcmUoJy4vLi4vcmVuZGVyL1dlYkdMUmVuZGVyZXInKTtcclxuXHJcbnZhciBhdXRvc2l6ZSA9IHJlcXVpcmUoJy4vYXV0b3NpemUnKTtcclxuXHJcbnZhciBTdGFnZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoU3RhZ2UsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBTdGFnZShvcHRzKSB7XHJcbiAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgKG9wdHMud2lkdGggfHwgMzIpLCAob3B0cy5oZWlnaHQgfHwgMzIpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gKHR5cGVvZiBvcHRzLmNhbnZhcyA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRzLmNhbnZhcykgOiBvcHRzLmNhbnZhcyk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmNhbnZhcykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBsb2NhdGUgY2FudmFzIHdpdGggaWQgXCInICsgb3B0cy5jYW52YXMgKyAnXCInKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdHMucmVuZGVyZXIgIT09ICdjYW52YXMnKSB7XHJcbiAgICAgICAgICAgIHRyeSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBXZWJHTFJlbmRlcmVyKHRoaXMsIHRoaXMuY2FudmFzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVuZGVyIGluaXQgZXJyb3IsIHN3aXRjaGluZyB0byBmYWxsYmFjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMucmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBDYW52YXNSZW5kZXJlcih0aGlzLCB0aGlzLmNhbnZhcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmF1dG9TaXplID0gbmV3IGF1dG9zaXplLkF1dG9TaXplKHRoaXMsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBvcHRzLmNlbnRlcixcclxuICAgICAgICAgICAgc2NhbGU6IG9wdHMuc2NhbGVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFN0YWdlLnByb3RvdHlwZS5yZXNpemVUbyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgaWYgKHdpZHRoID09PSB0aGlzLndpZHRoICYmIGhlaWdodCA9PT0gdGhpcy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfc3VwZXIucHJvdG90eXBlLnJlc2l6ZVRvLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5hdXRvU2l6ZS51cGRhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgU3RhZ2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBTdGFnZS5wcm90b3R5cGUuZGVzdHJ1Y3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5hdXRvU2l6ZS5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5hdXRvU2l6ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5kZXN0cnVjdCgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gU3RhZ2U7XHJcbn0pKEJpdG1hcCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWdlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdGFnZS5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgYnJvd3NlciA9IHJlcXVpcmUoJy4vYnJvd3NlcicpO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0TW9kZShzY2FsZU1vZGUpIHtcclxuICAgIGlmICgodHlwZW9mIHNjYWxlTW9kZSA9PT0gJ251bWJlcicgJiYgc2NhbGVNb2RlID4gMCkgfHwgc2NhbGVNb2RlID09PSAnbWF4JyB8fCBzY2FsZU1vZGUgPT09ICdmaXQnIHx8IHNjYWxlTW9kZSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGludCA9IHBhcnNlSW50KHNjYWxlTW9kZSwgMTApO1xyXG4gICAgaWYgKCFpc05hTihpbnQpICYmIGludCA+IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBzY2FsZU1vZGU6ICcgKyBzY2FsZU1vZGUpO1xyXG59XHJcblxyXG52YXIgQXV0b1NpemUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQXV0b1NpemUoc3RhZ2UsIG9wdHMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBzdGFnZTtcclxuXHJcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XHJcbiAgICAgICAgdGhpcy5jZW50ZXJWaWV3ID0gISFvcHRzLmNlbnRlcjtcclxuICAgICAgICB0aGlzLnNjYWxlTW9kZSA9IG9wdHMuc2NhbGUgfHwgJ25vbmUnO1xyXG4gICAgICAgIGFzc2VydE1vZGUodGhpcy5zY2FsZU1vZGUpO1xyXG5cclxuICAgICAgICBzdGFnZS5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdmlld1BvcnQgPSBicm93c2VyLmdldFZpZXdwb3J0KCk7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5zY2FsZU1vZGUgPT09ICdmaXQnKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zY2FsZUZpdCh2aWV3UG9ydCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuc2NhbGVNb2RlID09PSAnbWF4Jykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2NhbGVBc3BlY3Qodmlld1BvcnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5jZW50ZXJWaWV3IHx8IF90aGlzLnNjYWxlTW9kZSA9PT0gJ21heCcpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLm1vdmVTY3JlZW5DZW50ZXIodmlld1BvcnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMubW92ZVNjcmVlblRvKDAsIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRNb2RlKHRoaXMuc2NhbGVNb2RlLCB0aGlzLmNlbnRlclZpZXcpO1xyXG4gICAgfVxyXG4gICAgQXV0b1NpemUucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgICAgICB0aGlzLnNldE1vZGUobW9kZSwgdGhpcy5jZW50ZXJWaWV3KTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b1NpemUucHJvdG90eXBlLmNlbnRlciA9IGZ1bmN0aW9uIChjZW50ZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNlbnRlciA9PT0gXCJ1bmRlZmluZWRcIikgeyBjZW50ZXIgPSB0cnVlOyB9XHJcbiAgICAgICAgdGhpcy5zZXRNb2RlKHRoaXMuc2NhbGVNb2RlLCBjZW50ZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudW5saXN0ZW4oKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b1NpemUucHJvdG90eXBlLnNjYWxlVG8gPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuc2NhbGVNb2RlID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5zY2FsZUZpdCA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLndpZHRoID0gdmlld1BvcnQud2lkdGg7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5jYW52YXMuaGVpZ2h0ID0gdmlld1BvcnQuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5zY2FsZUFzcGVjdCA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xyXG4gICAgICAgIHZhciByYXRpbyA9IE1hdGgubWluKHZpZXdQb3J0LndpZHRoIC8gdGhpcy5zdGFnZS53aWR0aCwgdmlld1BvcnQuaGVpZ2h0IC8gdGhpcy5zdGFnZS5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLndpZHRoID0gTWF0aC5mbG9vcih0aGlzLnN0YWdlLndpZHRoICogcmF0aW8pO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLmhlaWdodCA9IE1hdGguZmxvb3IodGhpcy5zdGFnZS5oZWlnaHQgKiByYXRpbyk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5yZW5kZXJlci5yZXNpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b1NpemUucHJvdG90eXBlLm1vdmVTY3JlZW5UbyA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5jYW52YXMuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xyXG4gICAgfTtcclxuXHJcbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUubW92ZVNjcmVlbkNlbnRlciA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xyXG4gICAgICAgIHRoaXMubW92ZVNjcmVlblRvKE1hdGguZmxvb3IoKHZpZXdQb3J0LndpZHRoIC0gdGhpcy5zdGFnZS5jYW52YXMud2lkdGgpIC8gMiksIE1hdGguZmxvb3IoKHZpZXdQb3J0LmhlaWdodCAtIHRoaXMuc3RhZ2UuY2FudmFzLmhlaWdodCkgLyAyKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy51bmxpc3RlbigpO1xyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlclZpZXcgfHwgdGhpcy5zY2FsZU1vZGUgPT09ICdmaXQnKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUudW5saXN0ZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b1NpemUucHJvdG90eXBlLnNldE1vZGUgPSBmdW5jdGlvbiAobW9kZSwgY2VudGVyKSB7XHJcbiAgICAgICAgYXNzZXJ0TW9kZShtb2RlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2FsZU1vZGUgPSBtb2RlO1xyXG5cclxuICAgICAgICB2YXIgbXVsdGkgPSBwYXJzZUludCh0aGlzLnNjYWxlTW9kZSwgMTApO1xyXG4gICAgICAgIGlmICghaXNOYU4obXVsdGkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGVNb2RlID0gbXVsdGk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGVUbyhNYXRoLmZsb29yKHRoaXMuc3RhZ2Uud2lkdGggKiBtdWx0aSksIE1hdGguZmxvb3IodGhpcy5zdGFnZS5oZWlnaHQgKiBtdWx0aSkpO1xyXG4gICAgICAgICAgICB0aGlzLnVubGlzdGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlTW9kZSA9PT0gJ2ZpdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlU2NyZWVuVG8oMCwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIgfHwgdGhpcy5zY2FsZU1vZGUgPT09ICdmaXQnIHx8IHRoaXMuc2NhbGVNb2RlID09PSAnbWF4Jykge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RlbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBBdXRvU2l6ZTtcclxufSkoKTtcclxuZXhwb3J0cy5BdXRvU2l6ZSA9IEF1dG9TaXplO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRvc2l6ZS5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5mdW5jdGlvbiBnZXRWaWV3cG9ydCgpIHtcclxuICAgIHZhciBlID0gd2luZG93O1xyXG4gICAgdmFyIGEgPSAnaW5uZXInO1xyXG4gICAgaWYgKCEoJ2lubmVyV2lkdGgnIGluIHdpbmRvdykpIHtcclxuICAgICAgICBhID0gJ2NsaWVudCc7XHJcbiAgICAgICAgZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgd2lkdGg6IGVbYSArICdXaWR0aCddLCBoZWlnaHQ6IGVbYSArICdIZWlnaHQnXSB9O1xyXG59XHJcbmV4cG9ydHMuZ2V0Vmlld3BvcnQgPSBnZXRWaWV3cG9ydDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnJvd3Nlci5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgUkdCQSA9IHJlcXVpcmUoJy4vUkdCQScpO1xyXG52YXIgSFNWID0gcmVxdWlyZSgnLi9IU1YnKTtcclxuXHJcbmZ1bmN0aW9uIGhzdjJyZ2IoaHN2KSB7XHJcbiAgICB2YXIgciwgZywgYjtcclxuICAgIHZhciBpO1xyXG4gICAgdmFyIGYsIHAsIHEsIHQ7XHJcbiAgICB2YXIgaCA9IGhzdi5oO1xyXG4gICAgdmFyIHMgPSBoc3YucztcclxuICAgIHZhciB2ID0gaHN2LnY7XHJcblxyXG4gICAgaCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDM2MCwgaCkpO1xyXG4gICAgcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgcykpO1xyXG4gICAgdiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgdikpO1xyXG5cclxuICAgIHMgLz0gMTAwO1xyXG4gICAgdiAvPSAxMDA7XHJcblxyXG4gICAgaWYgKHMgPT09IDApIHtcclxuICAgICAgICByID0gZyA9IGIgPSB2O1xyXG4gICAgICAgIHJldHVybiBuZXcgUkdCQShNYXRoLnJvdW5kKHIgKiAyNTUpLCBNYXRoLnJvdW5kKGcgKiAyNTUpLCBNYXRoLnJvdW5kKGIgKiAyNTUpKTtcclxuICAgIH1cclxuXHJcbiAgICBoIC89IDYwO1xyXG4gICAgaSA9IE1hdGguZmxvb3IoaCk7XHJcbiAgICBmID0gaCAtIGk7XHJcbiAgICBwID0gdiAqICgxIC0gcyk7XHJcbiAgICBxID0gdiAqICgxIC0gcyAqIGYpO1xyXG4gICAgdCA9IHYgKiAoMSAtIHMgKiAoMSAtIGYpKTtcclxuXHJcbiAgICBzd2l0Y2ggKGkpIHtcclxuICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgIHIgPSB2O1xyXG4gICAgICAgICAgICBnID0gdDtcclxuICAgICAgICAgICAgYiA9IHA7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgIHIgPSBxO1xyXG4gICAgICAgICAgICBnID0gdjtcclxuICAgICAgICAgICAgYiA9IHA7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHIgPSBwO1xyXG4gICAgICAgICAgICBnID0gdjtcclxuICAgICAgICAgICAgYiA9IHQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHIgPSBwO1xyXG4gICAgICAgICAgICBnID0gcTtcclxuICAgICAgICAgICAgYiA9IHY7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgIHIgPSB0O1xyXG4gICAgICAgICAgICBnID0gcDtcclxuICAgICAgICAgICAgYiA9IHY7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByID0gdjtcclxuICAgICAgICAgICAgZyA9IHA7XHJcbiAgICAgICAgICAgIGIgPSBxO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUkdCQShNYXRoLnJvdW5kKHIgKiAyNTUpLCBNYXRoLnJvdW5kKGcgKiAyNTUpLCBNYXRoLnJvdW5kKGIgKiAyNTUpKTtcclxufVxyXG5leHBvcnRzLmhzdjJyZ2IgPSBoc3YycmdiO1xyXG5cclxuZnVuY3Rpb24gcmdiMmhzdihyZ2IpIHtcclxuICAgIHZhciByciwgZ2csIGJiLCByID0gcmdiLnIgLyAyNTUsIGcgPSByZ2IuZyAvIDI1NSwgYiA9IHJnYi5iIC8gMjU1LCBoLCBzLCB2ID0gTWF0aC5tYXgociwgZywgYiksIGRpZmYgPSB2IC0gTWF0aC5taW4ociwgZywgYiksIGRpZmZjID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICByZXR1cm4gKHYgLSBjKSAvIDYgLyBkaWZmICsgMSAvIDI7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChkaWZmID09PSAwKSB7XHJcbiAgICAgICAgaCA9IHMgPSAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzID0gZGlmZiAvIHY7XHJcbiAgICAgICAgcnIgPSBkaWZmYyhyKTtcclxuICAgICAgICBnZyA9IGRpZmZjKGcpO1xyXG4gICAgICAgIGJiID0gZGlmZmMoYik7XHJcblxyXG4gICAgICAgIGlmIChyID09PSB2KSB7XHJcbiAgICAgICAgICAgIGggPSBiYiAtIGdnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZyA9PT0gdikge1xyXG4gICAgICAgICAgICBoID0gKDEgLyAzKSArIHJyIC0gYmI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChiID09PSB2KSB7XHJcbiAgICAgICAgICAgIGggPSAoMiAvIDMpICsgZ2cgLSBycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGggPCAwKSB7XHJcbiAgICAgICAgICAgIGggKz0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGggPiAxKSB7XHJcbiAgICAgICAgICAgIGggLT0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IEhTVihNYXRoLnJvdW5kKGggKiAzNjApLCBNYXRoLnJvdW5kKHMgKiAxMDApLCBNYXRoLnJvdW5kKHYgKiAxMDApKTtcclxufVxyXG5leHBvcnRzLnJnYjJoc3YgPSByZ2IyaHN2O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb2xvci5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5mdW5jdGlvbiBpbnRlcnZhbChjYWxsYmFjaywgZnBzKSB7XHJcbiAgICB2YXIgaW50ZXJ2YWxJRCA9IDA7XHJcbiAgICB2YXIgZnJhbWUgPSAwO1xyXG4gICAgdmFyIHByZXYgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdGVwKCkge1xyXG4gICAgICAgIGlmIChpbnRlcnZhbElEKSB7XHJcbiAgICAgICAgICAgIGZyYW1lKys7XHJcbiAgICAgICAgICAgIHZhciBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgY2FsbGJhY2soZnJhbWUsIG5vdyAtIHByZXYpO1xyXG4gICAgICAgICAgICBwcmV2ID0gbm93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHt9O1xyXG4gICAgdGhhdC5zdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoaW50ZXJ2YWxJRCkge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoc3RlcCwgMTAwMCAvIGZwcyk7XHJcbiAgICB9O1xyXG4gICAgdGhhdC5zdGVwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHN0ZXAoKTtcclxuICAgIH07XHJcbiAgICB0aGF0LnN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKGludGVydmFsSUQpIHtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElEKTtcclxuICAgICAgICAgICAgaW50ZXJ2YWxJRCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoYXQuaXNSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAhIWludGVydmFsSUQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRoYXQ7XHJcbn1cclxuZXhwb3J0cy5pbnRlcnZhbCA9IGludGVydmFsO1xyXG5cclxuZnVuY3Rpb24gcmVxdWVzdChjYWxsYmFjaykge1xyXG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcclxuICAgIHZhciBmcmFtZSA9IDA7XHJcbiAgICB2YXIgcHJldiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XHJcbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcclxuICAgICAgICAgICAgZnJhbWUrKztcclxuICAgICAgICAgICAgdmFyIG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmcmFtZSwgbm93IC0gcHJldik7XHJcbiAgICAgICAgICAgIHByZXYgPSBub3c7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlcXVlc3RJRDtcclxuICAgIHZhciB0aGF0ID0ge307XHJcbiAgICB0aGF0LnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghcnVubmluZykge1xyXG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmVxdWVzdElEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGF0LnN0ZXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3RlcCgpO1xyXG4gICAgfTtcclxuICAgIHRoYXQuc3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAocnVubmluZykge1xyXG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJlcXVlc3RJRCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoYXQuaXNSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBydW5uaW5nO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGF0O1xyXG59XHJcbmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpY2tlci5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5mdW5jdGlvbiByYW5kKG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1heCk7XHJcbn1cclxuZXhwb3J0cy5yYW5kID0gcmFuZDtcclxuXHJcbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xyXG4gICAgaWYgKHZhbHVlIDwgbWluKSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbjtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSA+IG1heCkge1xyXG4gICAgICAgIHJldHVybiBtYXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuZXhwb3J0cy5jbGFtcCA9IGNsYW1wO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlsLmpzLm1hcFxyXG4iLCJ2YXIgUGVybGluTm9pc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGVybGluTm9pc2UoKSB7XHJcbiAgICAgICAgdGhpcy5wZXJtdXRhdGlvbiA9IFtcclxuICAgICAgICAgICAgMTUxLCAxNjAsIDEzNywgOTEsIDkwLCAxNSxcclxuICAgICAgICAgICAgMTMxLCAxMywgMjAxLCA5NSwgOTYsIDUzLCAxOTQsIDIzMywgNywgMjI1LCAxNDAsIDM2LCAxMDMsIDMwLCA2OSwgMTQyLCA4LCA5OSwgMzcsIDI0MCwgMjEsIDEwLCAyMyxcclxuICAgICAgICAgICAgMTkwLCA2LCAxNDgsIDI0NywgMTIwLCAyMzQsIDc1LCAwLCAyNiwgMTk3LCA2MiwgOTQsIDI1MiwgMjE5LCAyMDMsIDExNywgMzUsIDExLCAzMiwgNTcsIDE3NywgMzMsXHJcbiAgICAgICAgICAgIDg4LCAyMzcsIDE0OSwgNTYsIDg3LCAxNzQsIDIwLCAxMjUsIDEzNiwgMTcxLCAxNjgsIDY4LCAxNzUsIDc0LCAxNjUsIDcxLCAxMzQsIDEzOSwgNDgsIDI3LCAxNjYsXHJcbiAgICAgICAgICAgIDc3LCAxNDYsIDE1OCwgMjMxLCA4MywgMTExLCAyMjksIDEyMiwgNjAsIDIxMSwgMTMzLCAyMzAsIDIyMCwgMTA1LCA5MiwgNDEsIDU1LCA0NiwgMjQ1LCA0MCwgMjQ0LFxyXG4gICAgICAgICAgICAxMDIsIDE0MywgNTQsIDY1LCAyNSwgNjMsIDE2MSwgMSwgMjE2LCA4MCwgNzMsIDIwOSwgNzYsIDEzMiwgMTg3LCAyMDgsIDg5LCAxOCwgMTY5LCAyMDAsIDE5NixcclxuICAgICAgICAgICAgMTM1LCAxMzAsIDExNiwgMTg4LCAxNTksIDg2LCAxNjQsIDEwMCwgMTA5LCAxOTgsIDE3MywgMTg2LCAzLCA2NCwgNTIsIDIxNywgMjI2LCAyNTAsIDEyNCwgMTIzLFxyXG4gICAgICAgICAgICA1LCAyMDIsIDM4LCAxNDcsIDExOCwgMTI2LCAyNTUsIDgyLCA4NSwgMjEyLCAyMDcsIDIwNiwgNTksIDIyNywgNDcsIDE2LCA1OCwgMTcsIDE4MiwgMTg5LCAyOCwgNDIsXHJcbiAgICAgICAgICAgIDIyMywgMTgzLCAxNzAsIDIxMywgMTE5LCAyNDgsIDE1MiwgMiwgNDQsIDE1NCwgMTYzLCA3MCwgMjIxLCAxNTMsIDEwMSwgMTU1LCAxNjcsIDQzLCAxNzIsIDksXHJcbiAgICAgICAgICAgIDEyOSwgMjIsIDM5LCAyNTMsIDE5LCA5OCwgMTA4LCAxMTAsIDc5LCAxMTMsIDIyNCwgMjMyLCAxNzgsIDE4NSwgMTEyLCAxMDQsIDIxOCwgMjQ2LCA5NywgMjI4LFxyXG4gICAgICAgICAgICAyNTEsIDM0LCAyNDIsIDE5MywgMjM4LCAyMTAsIDE0NCwgMTIsIDE5MSwgMTc5LCAxNjIsIDI0MSwgODEsIDUxLCAxNDUsIDIzNSwgMjQ5LCAxNCwgMjM5LCAxMDcsXHJcbiAgICAgICAgICAgIDQ5LCAxOTIsIDIxNCwgMzEsIDE4MSwgMTk5LCAxMDYsIDE1NywgMTg0LCA4NCwgMjA0LCAxNzYsIDExNSwgMTIxLCA1MCwgNDUsIDEyNywgNCwgMTUwLCAyNTQsXHJcbiAgICAgICAgICAgIDEzOCwgMjM2LCAyMDUsIDkzLCAyMjIsIDExNCwgNjcsIDI5LCAyNCwgNzIsIDI0MywgMTQxLCAxMjgsIDE5NSwgNzgsIDY2LCAyMTUsIDYxLCAxNTYsIDE4MFxyXG4gICAgICAgIF07XHJcbiAgICAgICAgdGhpcy5wID0gbmV3IEFycmF5KDUxMik7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wWzI1NiArIGldID0gdGhpcy5wW2ldID0gdGhpcy5wZXJtdXRhdGlvbltpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQZXJsaW5Ob2lzZS5wcm90b3R5cGUubm9pc2UgPSBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG4gICAgICAgIHZhciBYID0gTWF0aC5mbG9vcih4KSAmIDI1NTtcclxuICAgICAgICB2YXIgWSA9IE1hdGguZmxvb3IoeSkgJiAyNTU7XHJcbiAgICAgICAgdmFyIFogPSBNYXRoLmZsb29yKHopICYgMjU1O1xyXG5cclxuICAgICAgICB4IC09IE1hdGguZmxvb3IoeCk7XHJcbiAgICAgICAgeSAtPSBNYXRoLmZsb29yKHkpO1xyXG4gICAgICAgIHogLT0gTWF0aC5mbG9vcih6KTtcclxuXHJcbiAgICAgICAgdmFyIHUgPSB0aGlzLmZhZGUoeCk7XHJcbiAgICAgICAgdmFyIHYgPSB0aGlzLmZhZGUoeSk7XHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLmZhZGUoeik7XHJcblxyXG4gICAgICAgIHZhciBBID0gdGhpcy5wW1hdICsgWTtcclxuICAgICAgICB2YXIgQUEgPSB0aGlzLnBbQV0gKyBaO1xyXG4gICAgICAgIHZhciBBQiA9IHRoaXMucFtBICsgMV0gKyBaO1xyXG5cclxuICAgICAgICB2YXIgQiA9IHRoaXMucFtYICsgMV0gKyBZO1xyXG4gICAgICAgIHZhciBCQSA9IHRoaXMucFtCXSArIFo7XHJcbiAgICAgICAgdmFyIEJCID0gdGhpcy5wW0IgKyAxXSArIFo7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnNjYWxlKHRoaXMubGVycCh3LCB0aGlzLmxlcnAodiwgdGhpcy5sZXJwKHUsIHRoaXMuZ3JhZCh0aGlzLnBbQUFdLCB4LCB5LCB6KSwgdGhpcy5ncmFkKHRoaXMucFtCQV0sIHggLSAxLCB5LCB6KSksIHRoaXMubGVycCh1LCB0aGlzLmdyYWQodGhpcy5wW0FCXSwgeCwgeSAtIDEsIHopLCB0aGlzLmdyYWQodGhpcy5wW0JCXSwgeCAtIDEsIHkgLSAxLCB6KSkpLCB0aGlzLmxlcnAodiwgdGhpcy5sZXJwKHUsIHRoaXMuZ3JhZCh0aGlzLnBbQUEgKyAxXSwgeCwgeSwgeiAtIDEpLCB0aGlzLmdyYWQodGhpcy5wW0JBICsgMV0sIHggLSAxLCB5LCB6IC0gMSkpLCB0aGlzLmxlcnAodSwgdGhpcy5ncmFkKHRoaXMucFtBQiArIDFdLCB4LCB5IC0gMSwgeiAtIDEpLCB0aGlzLmdyYWQodGhpcy5wW0JCICsgMV0sIHggLSAxLCB5IC0gMSwgeiAtIDEpKSkpKTtcclxuICAgIH07XHJcblxyXG4gICAgUGVybGluTm9pc2UucHJvdG90eXBlLmZhZGUgPSBmdW5jdGlvbiAodCkge1xyXG4gICAgICAgIHJldHVybiB0ICogdCAqIHQgKiAodCAqICh0ICogNiAtIDE1KSArIDEwKTtcclxuICAgIH07XHJcblxyXG4gICAgUGVybGluTm9pc2UucHJvdG90eXBlLmxlcnAgPSBmdW5jdGlvbiAodCwgYSwgYikge1xyXG4gICAgICAgIHJldHVybiBhICsgdCAqIChiIC0gYSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFBlcmxpbk5vaXNlLnByb3RvdHlwZS5ncmFkID0gZnVuY3Rpb24gKGhhc2gsIHgsIHksIHopIHtcclxuICAgICAgICB2YXIgaCA9IGhhc2ggJiAxNTtcclxuICAgICAgICB2YXIgdSA9IGggPCA4ID8geCA6IHk7XHJcbiAgICAgICAgdmFyIHYgPSBoIDwgNCA/IHkgOiBoID09IDEyIHx8IGggPT0gMTQgPyB4IDogejtcclxuICAgICAgICByZXR1cm4gKChoICYgMSkgPT0gMCA/IHUgOiAtdSkgKyAoKGggJiAyKSA9PSAwID8gdiA6IC12KTtcclxuICAgIH07XHJcblxyXG4gICAgUGVybGluTm9pc2UucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gKDEgKyBuKSAvIDI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBlcmxpbk5vaXNlO1xyXG59KSgpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQZXJsaW5Ob2lzZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UGVybGluTm9pc2UuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIEZvbnQgPSByZXF1aXJlKCcuLi9jb3JlL0ZvbnQnKTtcclxuXHJcbnZhciBmb250ID0gbmV3IEZvbnQoJ21pY3JvJywgNCwge1xyXG4gICAgJzAnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnMSc6IFtcclxuICAgICAgICAnMDEnLFxyXG4gICAgICAgICcxMScsXHJcbiAgICAgICAgJzAxJyxcclxuICAgICAgICAnMDEnXHJcbiAgICBdLFxyXG4gICAgJzInOiBbXHJcbiAgICAgICAgJzExMCcsXHJcbiAgICAgICAgJzAwMScsXHJcbiAgICAgICAgJzAxMCcsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnMyc6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMDExJyxcclxuICAgICAgICAnMDAxJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICc0JzogW1xyXG4gICAgICAgICcxMDAnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcwMTAnXHJcbiAgICBdLFxyXG4gICAgJzUnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMCcsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzAxMSdcclxuICAgIF0sXHJcbiAgICAnNic6IFtcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICc3JzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcwMDEnLFxyXG4gICAgICAgICcwMTAnLFxyXG4gICAgICAgICcwMTAnXHJcbiAgICBdLFxyXG4gICAgJzgnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnOSc6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMDAxJ1xyXG4gICAgXSxcclxuICAgICdBJzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDEnXHJcbiAgICBdLFxyXG4gICAgJ0InOiBbXHJcbiAgICAgICAgJzEwMCcsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnQyc6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICdEJzogW1xyXG4gICAgICAgICcxMTAnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTAnXHJcbiAgICBdLFxyXG4gICAgJ0UnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzExMCcsXHJcbiAgICAgICAgJzEwMCcsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnRic6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTEwJyxcclxuICAgICAgICAnMTAwJ1xyXG4gICAgXSxcclxuICAgICdHJzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDAnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTEnXHJcbiAgICBdLFxyXG4gICAgJ0gnOiBbXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMSdcclxuICAgIF0sXHJcbiAgICAnSSc6IFtcclxuICAgICAgICAnMScsXHJcbiAgICAgICAgJzEnLFxyXG4gICAgICAgICcxJyxcclxuICAgICAgICAnMSdcclxuICAgIF0sXHJcbiAgICAnSic6IFtcclxuICAgICAgICAnMDAxJyxcclxuICAgICAgICAnMDAxJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICdLJzogW1xyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTAnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMDEnXHJcbiAgICBdLFxyXG4gICAgJ0wnOiBbXHJcbiAgICAgICAgJzEwJyxcclxuICAgICAgICAnMTAnLFxyXG4gICAgICAgICcxMCcsXHJcbiAgICAgICAgJzExJ1xyXG4gICAgXSxcclxuICAgICdNJzogW1xyXG4gICAgICAgICcxMTAxMScsXHJcbiAgICAgICAgJzExMDExJyxcclxuICAgICAgICAnMTAxMDEnLFxyXG4gICAgICAgICcxMDAwMSdcclxuICAgIF0sXHJcbiAgICAnTic6IFtcclxuICAgICAgICAnMTAwMScsXHJcbiAgICAgICAgJzExMDEnLFxyXG4gICAgICAgICcxMDExJyxcclxuICAgICAgICAnMTAwMSdcclxuICAgIF0sXHJcbiAgICAnTyc6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICdQJzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDAnXHJcbiAgICBdLFxyXG4gICAgJ1EnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzAwMSdcclxuICAgIF0sXHJcbiAgICAnUic6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTAwJ1xyXG4gICAgXSxcclxuICAgICdTJzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcxMDAnLFxyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcwMTEnXHJcbiAgICBdLFxyXG4gICAgJ1QnOiBbXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzAxMCcsXHJcbiAgICAgICAgJzAxMCcsXHJcbiAgICAgICAgJzAxMCdcclxuICAgIF0sXHJcbiAgICAnVSc6IFtcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICdWJzogW1xyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcwMTAnXHJcbiAgICBdLFxyXG4gICAgJ1cnOiBbXHJcbiAgICAgICAgJzEwMDAxJyxcclxuICAgICAgICAnMTAwMDEnLFxyXG4gICAgICAgICcxMDEwMScsXHJcbiAgICAgICAgJzAxMTEwJ1xyXG4gICAgXSxcclxuICAgICdYJzogW1xyXG4gICAgICAgICcxMDEnLFxyXG4gICAgICAgICcwMTAnLFxyXG4gICAgICAgICcwMTAnLFxyXG4gICAgICAgICcxMDEnXHJcbiAgICBdLFxyXG4gICAgJ1knOiBbXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzAxMCcsXHJcbiAgICAgICAgJzAxMCdcclxuICAgIF0sXHJcbiAgICAnWic6IFtcclxuICAgICAgICAnMTExJyxcclxuICAgICAgICAnMDExJyxcclxuICAgICAgICAnMTAwJyxcclxuICAgICAgICAnMTExJ1xyXG4gICAgXSxcclxuICAgICcgJzogW1xyXG4gICAgICAgICcwJyxcclxuICAgICAgICAnMCcsXHJcbiAgICAgICAgJzAnLFxyXG4gICAgICAgICcwJ1xyXG4gICAgXSxcclxuICAgICchJzogW1xyXG4gICAgICAgICcxJyxcclxuICAgICAgICAnMScsXHJcbiAgICAgICAgJzAnLFxyXG4gICAgICAgICcxJ1xyXG4gICAgXSxcclxuICAgICc/JzogW1xyXG4gICAgICAgICcxMTEnLFxyXG4gICAgICAgICcwMDEnLFxyXG4gICAgICAgICcwMDAnLFxyXG4gICAgICAgICcwMTAnXHJcbiAgICBdLFxyXG4gICAgJy4nOiBbXHJcbiAgICAgICAgJzAnLFxyXG4gICAgICAgICcwJyxcclxuICAgICAgICAnMCcsXHJcbiAgICAgICAgJzEnXHJcbiAgICBdLFxyXG4gICAgJywnOiBbXHJcbiAgICAgICAgJzAnLFxyXG4gICAgICAgICcwJyxcclxuICAgICAgICAnMScsXHJcbiAgICAgICAgJzEnXHJcbiAgICBdLFxyXG4gICAgJysnOiBbXHJcbiAgICAgICAgJzAwMCcsXHJcbiAgICAgICAgJzAxMCcsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzAxMCdcclxuICAgIF0sXHJcbiAgICAnLSc6IFtcclxuICAgICAgICAnMDAnLFxyXG4gICAgICAgICcwMCcsXHJcbiAgICAgICAgJzExJyxcclxuICAgICAgICAnMDAnXHJcbiAgICBdLFxyXG4gICAgJz0nOiBbXHJcbiAgICAgICAgJzAwMCcsXHJcbiAgICAgICAgJzExMScsXHJcbiAgICAgICAgJzAwMCcsXHJcbiAgICAgICAgJzExMSdcclxuICAgIF0sXHJcbiAgICAnKic6IFtcclxuICAgICAgICAnMDAwJyxcclxuICAgICAgICAnMTAxJyxcclxuICAgICAgICAnMDEwJyxcclxuICAgICAgICAnMTAxJ1xyXG4gICAgXSxcclxuICAgICdfJzogW1xyXG4gICAgICAgICcwMDAnLFxyXG4gICAgICAgICcwMDAnLFxyXG4gICAgICAgICcwMDAnLFxyXG4gICAgICAgICcxMTEnXHJcbiAgICBdLFxyXG4gICAgJ1snOiBbXHJcbiAgICAgICAgJzExJyxcclxuICAgICAgICAnMTAnLFxyXG4gICAgICAgICcxMCcsXHJcbiAgICAgICAgJzExJ1xyXG4gICAgXSxcclxuICAgICddJzogW1xyXG4gICAgICAgICcxMScsXHJcbiAgICAgICAgJzAxJyxcclxuICAgICAgICAnMDEnLFxyXG4gICAgICAgICcxMSdcclxuICAgIF0sXHJcbiAgICAnKCc6IFtcclxuICAgICAgICAnMDEnLFxyXG4gICAgICAgICcxMCcsXHJcbiAgICAgICAgJzEwJyxcclxuICAgICAgICAnMDEnXHJcbiAgICBdLFxyXG4gICAgJyknOiBbXHJcbiAgICAgICAgJzEwJyxcclxuICAgICAgICAnMDEnLFxyXG4gICAgICAgICcwMScsXHJcbiAgICAgICAgJzEwJ1xyXG4gICAgXSxcclxuICAgICc8JzogW1xyXG4gICAgICAgICcwMCcsXHJcbiAgICAgICAgJzAxJyxcclxuICAgICAgICAnMTAnLFxyXG4gICAgICAgICcwMSdcclxuICAgIF0sXHJcbiAgICAnPic6IFtcclxuICAgICAgICAnMDAnLFxyXG4gICAgICAgICcxMCcsXHJcbiAgICAgICAgJzAxJyxcclxuICAgICAgICAnMTAnXHJcbiAgICBdLFxyXG4gICAgJ1xcJyc6IFtcclxuICAgICAgICAnMScsXHJcbiAgICAgICAgJzEnLFxyXG4gICAgICAgICcwJyxcclxuICAgICAgICAnMCdcclxuICAgIF0sXHJcbiAgICAnXCInOiBbXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzEwMScsXHJcbiAgICAgICAgJzAwMCcsXHJcbiAgICAgICAgJzAwMCdcclxuICAgIF0sXHJcbiAgICAnYCc6IFtcclxuICAgICAgICAnMTAnLFxyXG4gICAgICAgICcwMScsXHJcbiAgICAgICAgJzAwJyxcclxuICAgICAgICAnMDAnXHJcbiAgICBdLFxyXG4gICAgJ34nOiBbXHJcbiAgICAgICAgJzAwMCcsXHJcbiAgICAgICAgJzExMCcsXHJcbiAgICAgICAgJzAxMScsXHJcbiAgICAgICAgJzAwMCdcclxuICAgIF0sXHJcbiAgICAnLyc6IFtcclxuICAgICAgICAnMDAxJyxcclxuICAgICAgICAnMDEwJyxcclxuICAgICAgICAnMDEwJyxcclxuICAgICAgICAnMTAwJ1xyXG4gICAgXSxcclxuICAgICdcXFxcJzogW1xyXG4gICAgICAgICcxMDAnLFxyXG4gICAgICAgICcwMTAnLFxyXG4gICAgICAgICcwMTAnLFxyXG4gICAgICAgICcwMDEnXHJcbiAgICBdXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmb250O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1NaWNyby5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgU3RhZ2UgPSByZXF1aXJlKCcuL2NvcmUvU3RhZ2UnKTtcclxuZXhwb3J0cy5TdGFnZSA9IFN0YWdlO1xyXG5cclxudmFyIEJpdG1hcCA9IHJlcXVpcmUoJy4vY29yZS9CaXRtYXAnKTtcclxuZXhwb3J0cy5CaXRtYXAgPSBCaXRtYXA7XHJcbnZhciBGUFMgPSByZXF1aXJlKCcuL2NvcmUvRlBTJyk7XHJcbmV4cG9ydHMuRlBTID0gRlBTO1xyXG5cclxudmFyIFJHQkEgPSByZXF1aXJlKCcuL2NvcmUvUkdCQScpO1xyXG52YXIgSFNWID0gcmVxdWlyZSgnLi9jb3JlL0hTVicpO1xyXG5cclxudmFyIFBlcmxpbk5vaXNlID0gcmVxdWlyZSgnLi9leHRyYS9QZXJsaW5Ob2lzZScpO1xyXG5leHBvcnRzLlBlcmxpbk5vaXNlID0gUGVybGluTm9pc2U7XHJcblxyXG52YXIgbG9hZGVyID0gcmVxdWlyZSgnLi9sb2FkZXJzL2xvYWRlcicpO1xyXG5leHBvcnRzLmxvYWRlciA9IGxvYWRlcjtcclxuXHJcbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vY29yZS91dGlsJyk7XHJcbnZhciByYW5kID0gX3V0aWwucmFuZDtcclxuZXhwb3J0cy5yYW5kID0gcmFuZDtcclxuXHJcbnZhciBfY29sb3IgPSByZXF1aXJlKCcuL2NvcmUvY29sb3InKTtcclxudmFyIHJnYjJoc3YgPSBfY29sb3IucmdiMmhzdjtcclxuZXhwb3J0cy5yZ2IyaHN2ID0gcmdiMmhzdjtcclxudmFyIGhzdjJyZ2IgPSBfY29sb3IuaHN2MnJnYjtcclxuZXhwb3J0cy5oc3YycmdiID0gaHN2MnJnYjtcclxuXHJcbnZhciB0aWNrZXIgPSByZXF1aXJlKCcuL2NvcmUvdGlja2VyJyk7XHJcbmV4cG9ydHMudGlja2VyID0gdGlja2VyO1xyXG5cclxuZnVuY3Rpb24gcmdiKHIsIGcsIGIpIHtcclxuICAgIHJldHVybiBuZXcgUkdCQShyLCBnLCBiKTtcclxufVxyXG5leHBvcnRzLnJnYiA9IHJnYjtcclxuXHJcbnZhciBoc3ZUbXAgPSBuZXcgSFNWKCk7XHJcbmZ1bmN0aW9uIGhzdihoLCBzLCB2KSB7XHJcbiAgICBoc3ZUbXAuaCA9IGg7XHJcbiAgICBoc3ZUbXAucyA9IHM7XHJcbiAgICBoc3ZUbXAudiA9IHY7XHJcbiAgICByZXR1cm4gZXhwb3J0cy5oc3YycmdiKGhzdlRtcCk7XHJcbn1cclxuZXhwb3J0cy5oc3YgPSBoc3Y7XHJcblxyXG5bXHJcbiAgICBleHBvcnRzLmxvYWRlcixcclxuICAgIGV4cG9ydHMuUGVybGluTm9pc2UsXHJcbiAgICBfdXRpbCxcclxuICAgIF9jb2xvcixcclxuICAgIGV4cG9ydHMudGlja2VyLFxyXG4gICAgUkdCQSxcclxuICAgIEhTVixcclxuICAgIGV4cG9ydHMuQml0bWFwLFxyXG4gICAgZXhwb3J0cy5GUFMsXHJcbiAgICBleHBvcnRzLlN0YWdlXHJcbl07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbnZhciBCaXRtYXAgPSByZXF1aXJlKCcuLi9jb3JlL0JpdG1hcCcpO1xyXG5cclxudmFyIEltYWdlRGF0YUxvYWRlciA9IHJlcXVpcmUoJy4vSW1hZ2VEYXRhTG9hZGVyJyk7XHJcblxyXG52YXIgQml0bWFwTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJpdG1hcExvYWRlcih1cmwsIHVzZUFscGhhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VBbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyB1c2VBbHBoYSA9IGZhbHNlOyB9XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgdGhpcy51c2VBbHBoYSA9IHVzZUFscGhhO1xyXG4gICAgfVxyXG4gICAgQml0bWFwTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBuZXcgSW1hZ2VEYXRhTG9hZGVyKHRoaXMudXJsKS5sb2FkKGZ1bmN0aW9uIChlcnIsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy51c2VBbHBoYSkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgbmV3IEJpdG1hcChpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCB0cnVlLCBpbWFnZS5kYXRhLmJ1ZmZlcikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpdG1hcCA9IG5ldyBCaXRtYXAoaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBpbWFnZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXkgPSAwOyBpeSA8IGltYWdlLmhlaWdodDsgaXkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl4ID0gMDsgaXggPCB3aWR0aDsgaXgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZCA9IChpeSAqIHdpZHRoICsgaXgpICogNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdyaXRlID0gKGl5ICogd2lkdGggKyBpeCkgKiAzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYml0bWFwLmRhdGFbd3JpdGVdID0gZGF0YVtyZWFkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYml0bWFwLmRhdGFbd3JpdGUgKyAxXSA9IGRhdGFbcmVhZCArIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaXRtYXAuZGF0YVt3cml0ZSArIDJdID0gZGF0YVtyZWFkICsgMl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgYml0bWFwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBCaXRtYXBMb2FkZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJpdG1hcExvYWRlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Qml0bWFwTG9hZGVyLmpzLm1hcFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbnZhciBJbWFnZURhdGFMb2FkZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gSW1hZ2VEYXRhTG9hZGVyKHVybCkge1xyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG4gICAgSW1hZ2VEYXRhTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgY3R4LmdldEltYWdlRGF0YSgwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KSk7XHJcblxyXG4gICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignY2Fubm90IGxvYWQgJyArIF90aGlzLnVybCksIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gbnVsbDtcclxuICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy51cmw7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEltYWdlRGF0YUxvYWRlcjtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VEYXRhTG9hZGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1JbWFnZURhdGFMb2FkZXIuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIFRleHRMb2FkZXIgPSByZXF1aXJlKCcuL1RleHRMb2FkZXInKTtcclxuXHJcbnZhciBKU09OTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEpTT05Mb2FkZXIodXJsKSB7XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICB9XHJcbiAgICBKU09OTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgbmV3IFRleHRMb2FkZXIodGhpcy51cmwpLmxvYWQoZnVuY3Rpb24gKGVyciwgdGV4dCkge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSAge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IEpTT04ucGFyc2UodGV4dCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIG9iaik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEpTT05Mb2FkZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEpTT05Mb2FkZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUpTT05Mb2FkZXIuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIE11bHRpTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE11bHRpTG9hZGVyKGxvYWRlcnMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMucXVldWVkID0gW107XHJcbiAgICAgICAgaWYgKGxvYWRlcnMpIHtcclxuICAgICAgICAgICAgbG9hZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChsb2FkZXIpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnF1ZXVlZC5wdXNoKGxvYWRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIE11bHRpTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KHRoaXMucXVldWVkLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIHRoaXMucXVldWVkLmZvckVhY2goZnVuY3Rpb24gKGxvYWRlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgbG9hZGVyLmxvYWQoZnVuY3Rpb24gKGVyciwgcmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhsb2FkZXIudXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHJlcztcclxuICAgICAgICAgICAgICAgIF90aGlzLnF1ZXVlZFtpbmRleF0gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5xdWV1ZWQuZXZlcnkoZnVuY3Rpb24gKGxvYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhbG9hZGVyO1xyXG4gICAgICAgICAgICAgICAgfSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnF1ZXVlZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBNdWx0aUxvYWRlcjtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTXVsdGlMb2FkZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU11bHRpTG9hZGVyLmpzLm1hcFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbnZhciBKU09OTG9hZGVyID0gcmVxdWlyZSgnLi9KU09OTG9hZGVyJyk7XHJcbnZhciBTcHJpdGVTaGVldExvYWRlciA9IHJlcXVpcmUoJy4vU3ByaXRlU2hlZXRMb2FkZXInKTtcclxuXHJcbnZhciB1cmxFeHAgPSAvXiguKj8pKFxcLz8pKFteXFwvXSs/KSQvO1xyXG5cclxuZnVuY3Rpb24gZ2V0VVJMKG1haW4sIGFwcGVuZCkge1xyXG4gICAgdXJsRXhwLmxhc3RJbmRleCA9IDA7XHJcbiAgICB2YXIgbWF0Y2ggPSB1cmxFeHAuZXhlYyhtYWluKTtcclxuICAgIHJldHVybiBtYXRjaFsxXSArIG1hdGNoWzJdICsgYXBwZW5kO1xyXG59XHJcblxyXG52YXIgU3ByaXRlU2hlZXRKU09OTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFNwcml0ZVNoZWV0SlNPTkxvYWRlcih1cmwsIHVzZUFscGhhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VBbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyB1c2VBbHBoYSA9IGZhbHNlOyB9XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgdGhpcy51c2VBbHBoYSA9IHVzZUFscGhhO1xyXG4gICAgfVxyXG4gICAgU3ByaXRlU2hlZXRKU09OTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBuZXcgSlNPTkxvYWRlcih0aGlzLnVybCkubG9hZChmdW5jdGlvbiAoZXJyLCBqc29uKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coanNvbik7XHJcbiAgICAgICAgICAgIG5ldyBTcHJpdGVTaGVldExvYWRlcihnZXRVUkwoX3RoaXMudXJsLCBqc29uLmltYWdlKSwganNvbiwgX3RoaXMudXNlQWxwaGEpLmxvYWQoY2FsbGJhY2spO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBTcHJpdGVTaGVldEpTT05Mb2FkZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVNoZWV0SlNPTkxvYWRlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3ByaXRlU2hlZXRKU09OTG9hZGVyLmpzLm1hcFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbnZhciBCaXRtYXAgPSByZXF1aXJlKCcuLi9jb3JlL0JpdG1hcCcpO1xyXG52YXIgU3ByaXRlU2hlZXQgPSByZXF1aXJlKCcuLi9jb3JlL1Nwcml0ZVNoZWV0Jyk7XHJcblxyXG52YXIgSW1hZ2VEYXRhTG9hZGVyID0gcmVxdWlyZSgnLi9JbWFnZURhdGFMb2FkZXInKTtcclxuXHJcbnZhciBTcHJpdGVTaGVldExvYWRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTcHJpdGVTaGVldExvYWRlcih1cmwsIG9wdHMsIHVzZUFscGhhKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VBbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyB1c2VBbHBoYSA9IGZhbHNlOyB9XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcclxuICAgICAgICB0aGlzLnVzZUFscGhhID0gdXNlQWxwaGE7XHJcbiAgICB9XHJcbiAgICBTcHJpdGVTaGVldExvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgbmV3IEltYWdlRGF0YUxvYWRlcih0aGlzLnVybCkubG9hZChmdW5jdGlvbiAoZXJyLCBpbWFnZSkge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgb3V0ZXJNYXJnaW4gPSAoX3RoaXMub3B0cy5vdXRlck1hcmdpbiB8fCAwKTtcclxuICAgICAgICAgICAgdmFyIGlubmVyTWFyZ2luID0gKF90aGlzLm9wdHMuaW5uZXJNYXJnaW4gfHwgMCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2hlZXQgPSBuZXcgU3ByaXRlU2hlZXQoX3RoaXMub3B0cy5zcHJpdGVzWCwgX3RoaXMub3B0cy5zcHJpdGVzWSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpeSA9IDA7IGl5IDwgX3RoaXMub3B0cy5zcHJpdGVzWTsgaXkrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXggPSAwOyBpeCA8IF90aGlzLm9wdHMuc3ByaXRlc1g7IGl4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IG91dGVyTWFyZ2luICsgaXggKiAoX3RoaXMub3B0cy5zaXplWCArIGlubmVyTWFyZ2luKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG91dGVyTWFyZ2luICsgaXkgKiAoX3RoaXMub3B0cy5zaXplWSArIGlubmVyTWFyZ2luKTtcclxuICAgICAgICAgICAgICAgICAgICBzaGVldC5hZGRTcHJpdGUoQml0bWFwLmNsaXBGcm9tRGF0YShpbWFnZS5kYXRhLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCA0LCB4LCB5LCBfdGhpcy5vcHRzLnNpemVYLCBfdGhpcy5vcHRzLnNpemVZLCBfdGhpcy51c2VBbHBoYSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHNoZWV0KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gU3ByaXRlU2hlZXRMb2FkZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVNoZWV0TG9hZGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TcHJpdGVTaGVldExvYWRlci5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5mdW5jdGlvbiBnZXRYSFIoKSB7XHJcbiAgICBpZiAoWE1MSHR0cFJlcXVlc3QpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB9XHJcbiAgICB0cnkgIHtcclxuICAgICAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgfVxyXG4gICAgdHJ5ICB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgIH1cclxuICAgIHRyeSAge1xyXG4gICAgICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgIH1cclxuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QuJyk7XHJcbn1cclxuXHJcbnZhciBUZXh0TG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRleHRMb2FkZXIodXJsKSB7XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICB9XHJcbiAgICBUZXh0TG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdHJ5ICB7XHJcbiAgICAgICAgICAgIHZhciB4aHIgPSBnZXRYSFIoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB4aHIub3BlbignR0VUJywgdGhpcy51cmwsIHRydWUpO1xyXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0Jyk7XHJcbiAgICAgICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFRleHRMb2FkZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRMb2FkZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVRleHRMb2FkZXIuanMubWFwXHJcbiIsInZhciBJbWFnZURhdGFMb2FkZXIgPSByZXF1aXJlKCcuL0ltYWdlRGF0YUxvYWRlcicpO1xyXG5leHBvcnRzLkltYWdlRGF0YUxvYWRlciA9IEltYWdlRGF0YUxvYWRlcjtcclxudmFyIEJpdG1hcExvYWRlciA9IHJlcXVpcmUoJy4vQml0bWFwTG9hZGVyJyk7XHJcbmV4cG9ydHMuQml0bWFwTG9hZGVyID0gQml0bWFwTG9hZGVyO1xyXG52YXIgVGV4dExvYWRlciA9IHJlcXVpcmUoJy4vVGV4dExvYWRlcicpO1xyXG5leHBvcnRzLlRleHRMb2FkZXIgPSBUZXh0TG9hZGVyO1xyXG52YXIgSlNPTkxvYWRlciA9IHJlcXVpcmUoJy4vSlNPTkxvYWRlcicpO1xyXG5leHBvcnRzLkpTT05Mb2FkZXIgPSBKU09OTG9hZGVyO1xyXG52YXIgU3ByaXRlU2hlZXRMb2FkZXIgPSByZXF1aXJlKCcuL1Nwcml0ZVNoZWV0TG9hZGVyJyk7XHJcbmV4cG9ydHMuU3ByaXRlU2hlZXRMb2FkZXIgPSBTcHJpdGVTaGVldExvYWRlcjtcclxudmFyIFNwcml0ZVNoZWV0SlNPTkxvYWRlciA9IHJlcXVpcmUoJy4vU3ByaXRlU2hlZXRKU09OTG9hZGVyJyk7XHJcbmV4cG9ydHMuU3ByaXRlU2hlZXRKU09OTG9hZGVyID0gU3ByaXRlU2hlZXRKU09OTG9hZGVyO1xyXG52YXIgTXVsdGlMb2FkZXIgPSByZXF1aXJlKCcuL011bHRpTG9hZGVyJyk7XHJcbmV4cG9ydHMuTXVsdGlMb2FkZXIgPSBNdWx0aUxvYWRlcjtcclxuXHJcbltcclxuICAgIGV4cG9ydHMuTXVsdGlMb2FkZXIsXHJcbiAgICBleHBvcnRzLkltYWdlRGF0YUxvYWRlcixcclxuICAgIGV4cG9ydHMuQml0bWFwTG9hZGVyLFxyXG4gICAgZXhwb3J0cy5UZXh0TG9hZGVyLFxyXG4gICAgZXhwb3J0cy5KU09OTG9hZGVyLFxyXG4gICAgZXhwb3J0cy5TcHJpdGVTaGVldExvYWRlcixcclxuICAgIGV4cG9ydHMuU3ByaXRlU2hlZXRKU09OTG9hZGVyXHJcbl07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvYWRlci5qcy5tYXBcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5mdW5jdGlvbiBjbGVhckFscGhhKGRhdGEpIHtcclxuICAgIHZhciBsaW0gPSBkYXRhLmxlbmd0aDtcclxuICAgIGZvciAodmFyIGkgPSAzOyBpIDwgbGltOyBpKyspIHtcclxuICAgICAgICBkYXRhW2ldID0gMjU1O1xyXG4gICAgfVxyXG59XHJcblxyXG52YXIgQ2FudmFzUmVuZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENhbnZhc1JlbmRlcihiaXRtYXAsIGNhbnZhcykge1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cclxuICAgICAgICB0aGlzLnB4ID0gYml0bWFwLmRhdGE7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGJpdG1hcC53aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGJpdG1hcC5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jaGFubmVscyA9IGJpdG1hcC51c2VBbHBoYSA/IDQgOiAzO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5jdHguY3JlYXRlSW1hZ2VEYXRhKHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBjbGVhckFscGhhKHRoaXMub3V0cHV0LmRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5wdXRJbWFnZURhdGEodGhpcy5vdXRwdXQsIDAsIDApO1xyXG4gICAgfVxyXG4gICAgQ2FudmFzUmVuZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3V0cHV0LndpZHRoICE9PSB0aGlzLmNhbnZhcy53aWR0aCB8fCB0aGlzLm91dHB1dC5oZWlnaHQgIT09IHRoaXMuY2FudmFzLmhlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dHB1dCA9IHRoaXMuY3R4LmNyZWF0ZUltYWdlRGF0YSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGNsZWFyQWxwaGEodGhpcy5vdXRwdXQuZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBDYW52YXNSZW5kZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXMub3V0cHV0LmRhdGE7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5vdXRwdXQud2lkdGg7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMub3V0cHV0LmhlaWdodDtcclxuXHJcbiAgICAgICAgdmFyIGZ4ID0gdGhpcy53aWR0aCAvIHdpZHRoO1xyXG4gICAgICAgIHZhciBmeSA9IHRoaXMuaGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpeSA9IDA7IGl5IDwgaGVpZ2h0OyBpeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGl4ID0gMDsgaXggPCB3aWR0aDsgaXgrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKGl4ICogZngpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKGl5ICogZnkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWQgPSAoeCArIHkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgd3JpdGUgPSAoaXggKyBpeSAqIHdpZHRoKSAqIDQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YVt3cml0ZV0gPSB0aGlzLnB4W3JlYWRdO1xyXG4gICAgICAgICAgICAgICAgZGF0YVt3cml0ZSArIDFdID0gdGhpcy5weFtyZWFkICsgMV07XHJcbiAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMl0gPSB0aGlzLnB4W3JlYWQgKyAyXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN0eC5wdXRJbWFnZURhdGEodGhpcy5vdXRwdXQsIDAsIDApO1xyXG4gICAgfTtcclxuXHJcbiAgICBDYW52YXNSZW5kZXIucHJvdG90eXBlLmRlc3RydWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucHggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBudWxsO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDYW52YXNSZW5kZXI7XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1JlbmRlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2FudmFzUmVuZGVyZXIuanMubWFwXHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIHZlcnRleFNoYWRlclNvdXJjZSA9IFtcclxuICAgICdhdHRyaWJ1dGUgdmVjMiBhX3Bvc2l0aW9uOycsXHJcbiAgICAnYXR0cmlidXRlIHZlYzIgYV90ZXhDb29yZDsnLFxyXG4gICAgJ3ZhcnlpbmcgdmVjMiB2X3RleENvb3JkOycsXHJcbiAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAnICAgIGdsX1Bvc2l0aW9uID0gdmVjNChhX3Bvc2l0aW9uLCAwLCAxKTsnLFxyXG4gICAgJyAgICB2X3RleENvb3JkID0gYV90ZXhDb29yZDsnLFxyXG4gICAgJ30nXHJcbl0uam9pbignXFxuJyk7XHJcblxyXG52YXIgZnJhZ21lbnRTaGFkZXJTb3VyY2UgPSBbXHJcbiAgICAncHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7JyxcclxuICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlOycsXHJcbiAgICAndmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7JyxcclxuICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICcgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfaW1hZ2UsIHZfdGV4Q29vcmQpOycsXHJcbiAgICAnfSdcclxuXS5qb2luKCdcXG4nKTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTaGFkZXIoZ2wsIHNoYWRlclNvdXJjZSwgc2hhZGVyVHlwZSkge1xyXG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihzaGFkZXJUeXBlKTtcclxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNoYWRlclNvdXJjZSk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XHJcblxyXG4gICAgdmFyIGNvbXBpbGVkID0gZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpO1xyXG4gICAgaWYgKCFjb21waWxlZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZXJyb3IgY29tcGlsaW5nIHNoYWRlciBcIicgKyBzaGFkZXIgKyAnXCI6JyArIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2hhZGVyO1xyXG59XHJcblxyXG52YXIgV2ViR0xSZW5kZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gV2ViR0xSZW5kZXIoYml0bWFwLCBjYW52YXMpIHtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICB0aGlzLndpZHRoID0gYml0bWFwLndpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gYml0bWFwLmhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5weCA9IG5ldyBVaW50OEFycmF5KGJpdG1hcC5idWZmZXIpO1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgV2VnR0wnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBnbE9wdHMgPSB7IGFscGhhOiBmYWxzZSB9O1xyXG5cclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBnbE9wdHMpIHx8IHRoaXMuY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGdsT3B0cyk7XHJcbiAgICAgICAgaWYgKCFnbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCBjcmVhdGUgV2ViR0wgY29udGV4dCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblxyXG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBsb2FkU2hhZGVyKGdsLCB2ZXJ0ZXhTaGFkZXJTb3VyY2UsIGdsLlZFUlRFWF9TSEFERVIpKTtcclxuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgbG9hZFNoYWRlcihnbCwgZnJhZ21lbnRTaGFkZXJTb3VyY2UsIGdsLkZSQUdNRU5UX1NIQURFUikpO1xyXG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG5cclxuICAgICAgICB2YXIgbGlua2VkID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUyk7XHJcbiAgICAgICAgaWYgKCFsaW5rZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCgnZXJyb3IgaW4gcHJvZ3JhbSBsaW5raW5nOicgKyBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYV9wb3NpdGlvbicpO1xyXG4gICAgICAgIHRoaXMudGV4Q29vcmRMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdhX3RleENvb3JkJyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb25CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5wb3NpdGlvbkJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMucG9zaXRpb25Mb2NhdGlvbik7XHJcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnBvc2l0aW9uTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblxyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgLTEuMCwgLTEuMCxcclxuICAgICAgICAgICAgMS4wLCAtMS4wLFxyXG4gICAgICAgICAgICAtMS4wLCAxLjAsXHJcbiAgICAgICAgICAgIC0xLjAsIDEuMCxcclxuICAgICAgICAgICAgMS4wLCAtMS4wLFxyXG4gICAgICAgICAgICAxLjAsIDEuMFxyXG4gICAgICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMudGV4Q29vcmRCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy50ZXhDb29yZEJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMudGV4Q29vcmRMb2NhdGlvbik7XHJcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnRleENvb3JkTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblxyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgMC4wLCAxLjAsXHJcbiAgICAgICAgICAgIDEuMCwgMS4wLFxyXG4gICAgICAgICAgICAwLjAsIDAuMCxcclxuICAgICAgICAgICAgMC4wLCAwLjAsXHJcbiAgICAgICAgICAgIDEuMCwgMS4wLFxyXG4gICAgICAgICAgICAxLjAsIDAuMFxyXG4gICAgICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xyXG5cclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQpO1xyXG5cclxuICAgICAgICBnbC5jb2xvck1hc2sodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIH1cclxuICAgIFdlYkdMUmVuZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmdsLmNsZWFyKHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XHJcbiAgICB9O1xyXG5cclxuICAgIFdlYkdMUmVuZGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0IsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmdsLlJHQiwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCB0aGlzLnB4KTtcclxuXHJcbiAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZ2wuVFJJQU5HTEVTLCAwLCA2KTtcclxuICAgIH07XHJcblxyXG4gICAgV2ViR0xSZW5kZXIucHJvdG90eXBlLmRlc3RydWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZ2wuY2xlYXIodGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuXHJcbiAgICAgICAgdGhpcy5nbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5weCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBXZWJHTFJlbmRlcjtcclxufSkoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2ViR0xSZW5kZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdlYkdMUmVuZGVyZXIuanMubWFwXHJcbiJdfQ==
(16)
});
