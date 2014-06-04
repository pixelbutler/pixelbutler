/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

class ImageLoader {
	public url: string;

	// TODO assert line width
	constructor(url: string) {
		this.url = url;
	}

	load(callback: (err: Error, bitmap: Bitmap) => void): void {
		var image = document.createElement('img');
		image.onload = () => {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);

			var bitmap = new Bitmap(image.width, image.height, true, ctx.getImageData(0, 0, image.width, image.height).data.buffer);
			callback(null, bitmap);
		};
		image.onerror = () => {
			callback(new Error('cannot load ' + this.url), null);
		};
		image.src = this.url;
	}
}

export = ImageLoader;
