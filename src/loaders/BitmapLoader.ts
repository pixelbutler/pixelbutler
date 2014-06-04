/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

import ILoader = require('./ILoader');
import ImageDataLoader = require('./ImageDataLoader');

class BitmapLoader implements ILoader {
	public url: string;
	public useAlpha: boolean;

	// TODO assert line width
	constructor(url: string, useAlpha: boolean = false) {
		this.url = url;
		this.useAlpha = useAlpha;
	}

	load(callback: (err: Error, bitmap: Bitmap) => void): void {
		new ImageDataLoader(this.url).load((err, image) => {
			if (err) {
				callback(err, null);
				return;
			}

			if (this.useAlpha) {
				callback(null, new Bitmap(image.width, image.height, true, image.data.buffer));
			}
			else {
				// resample, ditch alpha
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
	}
}

export = BitmapLoader;
