/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');
import ILoader = require('./ILoader');

class ImageDataLoader implements ILoader {
	public url: string;

	constructor(url: string) {
		this.url = url;
	}

	load(callback: (err: Error, data: ImageData) => void): void {
		var image = document.createElement('img');
		image.onload = () => {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;

			var ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);

			callback(null, ctx.getImageData(0, 0, image.width, image.height));

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

export = ImageDataLoader;
