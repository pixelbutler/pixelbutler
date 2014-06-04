!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lorez=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var RGBA = _dereq_('./RGBA');

var microFont = _dereq_('../font/micro');

var util = _dereq_('./util');
var rand = util.rand;
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
        var rgb = new RGBA();

        var iy;
        var ix;
        var p;
        var col;

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

    Bitmap.prototype.blit = function (sprite, x, y, w, h, sx, sy) {
        x = (x ? Math.floor(x) : 0);
        y = (y ? Math.floor(y) : 0);
        w = (w ? Math.floor(w) : sprite.width);
        h = (h ? Math.floor(h) : sprite.height);
        sx = (sx ? Math.floor(sx) : 0);
        sy = (sy ? Math.floor(sy) : 0);

        var iy;
        var ix;
        var read;
        var write;

        if (sprite.useAlpha) {
            for (iy = sy; iy < sy + h; iy++) {
                for (ix = sx; ix < sx + w; ix++) {
                    if (ix < 0 || iy < 0 || ix >= sprite.width || iy >= sprite.height) {
                        continue;
                    }
                    read = (ix + iy * sprite.width) * sprite.channels;
                    write = (x + ix - sx + (y + iy - sy) * this.width) * this.channels;

                    var alpha = sprite.data[read + 3] / 255;
                    var inv = 1 - alpha;
                    this.data[write] = Math.round(this.data[write] * inv + sprite.data[read] * alpha);
                    this.data[write + 1] = Math.round(this.data[write + 1] * inv + sprite.data[read + 1] * alpha);
                    this.data[write + 2] = Math.round(this.data[write + 2] * inv + sprite.data[read + 2] * alpha);
                }
            }
        } else {
            for (iy = sy; iy < sy + h; iy++) {
                for (ix = sx; ix < sx + w; ix++) {
                    if (ix < 0 || iy < 0 || ix >= sprite.width || iy >= sprite.height) {
                        continue;
                    }
                    read = (ix + iy * sprite.width) * sprite.channels;
                    write = (x + ix - sx + (y + iy - sy) * this.width) * this.channels;

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

    Bitmap.prototype.clearDisco = function () {
        var lim;
        var i;

        if (this.useAlpha) {
            lim = this.width * this.height * 4;
            for (i = 0; i < lim; i += 4) {
                this.data[i] = rand(256);
                this.data[i + 1] = rand(256);
                this.data[i + 2] = rand(256);
                this.data[i + 3] = 255;
            }
        } else {
            lim = this.width * this.height * 3;
            for (i = 0; i < lim; i += 3) {
                this.data[i] = rand(256);
                this.data[i + 1] = rand(256);
                this.data[i + 2] = rand(256);
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
    return Bitmap;
})();

module.exports = Bitmap;
//# sourceMappingURL=Bitmap.js.map

},{"../font/micro":16,"./RGBA":6,"./util":12}],2:[function(_dereq_,module,exports){
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

},{"./../render/CanvasRenderer":18,"./../render/WebGLRenderer":19,"./Bitmap":1,"./autosize":8}],8:[function(_dereq_,module,exports){
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

},{"./browser":9}],9:[function(_dereq_,module,exports){
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

},{}],10:[function(_dereq_,module,exports){
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

},{"./HSV":5,"./RGBA":6}],11:[function(_dereq_,module,exports){
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

},{}],12:[function(_dereq_,module,exports){
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

},{}],13:[function(_dereq_,module,exports){
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

},{"../core/Bitmap":1,"./ImageDataLoader":14}],14:[function(_dereq_,module,exports){
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

},{}],15:[function(_dereq_,module,exports){
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

},{}],16:[function(_dereq_,module,exports){
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
//# sourceMappingURL=micro.js.map

},{"../core/Font":4}],17:[function(_dereq_,module,exports){
'use strict';
var Stage = _dereq_('./core/Stage');
exports.Stage = Stage;

var Bitmap = _dereq_('./core/Bitmap');
exports.Bitmap = Bitmap;
var FPS = _dereq_('./core/FPS');
exports.FPS = FPS;

var RGBA = _dereq_('./core/RGBA');
var HSV = _dereq_('./core/HSV');

var BitmapLoader = _dereq_('./extra/BitmapLoader');
exports.BitmapLoader = BitmapLoader;
var PerlinNoise = _dereq_('./extra/PerlinNoise');
exports.PerlinNoise = PerlinNoise;

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
    exports.BitmapLoader,
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

},{"./core/Bitmap":1,"./core/FPS":3,"./core/HSV":5,"./core/RGBA":6,"./core/Stage":7,"./core/color":10,"./core/ticker":11,"./core/util":12,"./extra/BitmapLoader":13,"./extra/PerlinNoise":15}],18:[function(_dereq_,module,exports){
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

},{}],19:[function(_dereq_,module,exports){
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

},{}]},{},[17])

(17)
});

//# sourceMappingURL=lorez.js.map