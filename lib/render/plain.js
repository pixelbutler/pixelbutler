'use strict';

var util = require('../core//util');

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
