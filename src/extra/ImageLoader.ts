/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

class ImageLoader {
	public url: string;
	public useAlpha: boolean;

	// TODO assert line width
	constructor(url: string, useAlpha: boolean = false) {
		this.url = url;
		this.useAlpha = useAlpha;
	}

	load(callback: (err: Error, bitmap: Bitmap) => void): void {
		var image = document.createElement('img');
		image.onload = () => {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;

			var ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);

			if (this.useAlpha) {
				callback(null, new Bitmap(image.width, image.height, true, ctx.getImageData(0, 0, image.width, image.height).data.buffer));
			}
			else {
				// resample, ditch alpha
				var bitmap = new Bitmap(image.width, image.height, false);
				var data = ctx.getImageData(0, 0, image.width, image.height).data;
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

			image.onload = null;
			image.onerror = null;
		};
		image.onerror = () => {
			callback(new Error('cannot load ' + this.url), null);

			image.onload = null;
			image.onerror = null;
		};
		// load it
		image.src = this.url;
	}
}

export = ImageLoader;
