// UMD header from https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            return (root.Framebuffer = factory());
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals
        root.Framebuffer = factory();
    }
}(this, function () {
    'use strict';

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
        alphaData(this.output.data, this.output.width, this.output.height, 255);
        this.ctx.putImageData(this.output, 0, 0);
    }

    RenderPlain.prototype.resize = function (render) {
        if (this.output.width !== this.canvas.width || this.output.height !== this.canvas.height) {
            this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);
            if (!render) {
                // set the alpha channel to visible
                alphaData(this.output.data, this.output.width, this.output.height, 255);
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
        this.canvasId = opts.canvasId;

        // grab canvas stuff
        var canvas = document.getElementById(opts.canvasId);
        if (!canvas) {
            throw new Error('cannot locate canvas with id "' + opts.canvasId + '"');
        }

        // init internal data, use RGB (no alpha) so 3 channels
        this.image = new ImageArray(this.width, this.height, false);
        this.px = this.image.px;
        this.channels = 3;

        //alphaData(this.px, this.width, this.height, 255);
        discoData(this.px, this.width, this.height);

        // optional renderer
        if (typeof opts.renderer === 'function') {
            try {
                this.renderer = new (opts.renderer)(this.image, canvas);
            }
            catch (e) {
                console.log(e);
                console.log('WebGL init error, switching to fallback');
            }
        }
        // default & fallback
        if (!this.renderer) {
            this.renderer = new RenderPlain(this.image, canvas);
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
                var p = (j * this.height + i) * this.channels;
                this.px[p] = col[0];
                this.px[p + 1] = col[1];
                this.px[p + 2] = col[2];
            }
        }
    };

    Framebuffer.prototype.clear = function (col) {
        this.fillrect(0, 0, this.width, this.height, col);
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
                rgb[1] = this.px[p+1];
                rgb[2] = this.px[p+2];
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

    /**
     *  --- - --- - --- - --- - --- - --- - --- - --- - --- - ---
     *
     * Static helpers (assigned later for speeed)
     *
     *  --- - --- - --- - --- - --- - --- - --- - --- - --- - ---
     **/

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

    // export helpers (instance vs static.. why not both? :)
    Framebuffer.rand = Framebuffer.prototype.rand = rand;
    Framebuffer.hsv2rgb = Framebuffer.prototype.hsv2rgb = hsv2rgb;
    Framebuffer.rgb2hsv = Framebuffer.prototype.rgb2hsv = rgb2hsv;

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

    // exported value
    return Framebuffer;
}));
