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
