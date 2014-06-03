/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

import IRenderer = require('../render/IRenderer');

function clearAlpha(data: Uint8Array) {
	var lim = data.length;
	for (var i = 3; i < lim; i++) {
		data[i] = 255;
	}
}

// basic renderer with nearest-neighbour
class CanvasRender implements IRenderer {

	private canvas: HTMLCanvasElement;
	private width: number;
	private height: number;
	private channels: number;
	private px: Uint8ClampedArray;
	private ctx: CanvasRenderingContext2D;
	private output: ImageData;

	constructor(bitmap: Bitmap, canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.px = bitmap.data;
		this.width = bitmap.width;
		this.height = bitmap.height;
		this.channels = bitmap.useAlpha ? 4 : 3;

		this.ctx = this.canvas.getContext('2d');

		// get canvas-sized image data
		this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

		// set the alpha channel to visible
		clearAlpha(this.output.data);

		this.ctx.putImageData(this.output, 0, 0);
	}

	resize(): void {
		if (this.output.width !== this.canvas.width || this.output.height !== this.canvas.height) {
			this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);
			// set the alpha channel to visible
			clearAlpha(this.output.data);
		}
	}

	update(): void {
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
	}

	destruct(): void {
		this.px = null;
		this.ctx = null;
		this.canvas = null;
		this.output = null;
	}
}

export = CanvasRender;
