/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');
import SpriteSheet = require('../core/SpriteSheet');

import ILoader = require('./ILoader');
import ImageDataLoader = require('./ImageDataLoader');
import ISpriteSheetOpts = require('../types/ISpriteSheetOpts');

class SpriteSheetLoader implements ILoader {
	public url: string;
	public useAlpha: boolean;
	public opts: ISpriteSheetOpts;

	// TODO assert line width
	constructor(url: string, opts: ISpriteSheetOpts, useAlpha: boolean = false) {
		this.url = url;
		this.opts = opts;
		this.useAlpha = useAlpha;
	}

	load(callback: (err: Error, bitmap: SpriteSheet) => void): void {
		new ImageDataLoader(this.url).load((err: Error, image: ImageData) => {
			if (err) {
				callback(err, null);
				return;
			}

			// TODO limit total sprites when sheet not fully filled

			/* tslint:disable: max-line-length */

			var outerMargin = (this.opts.outerMargin || 0);
			var innerMargin = (this.opts.innerMargin || 0);

			var sheet = new SpriteSheet(this.opts.spritesX, this.opts.spritesY);

			for (var iy = 0; iy < this.opts.spritesY; iy++) {
				for (var ix = 0; ix < this.opts.spritesX; ix++) {
					var x = outerMargin + ix * (this.opts.sizeX + innerMargin);
					var y = outerMargin + iy * (this.opts.sizeY + innerMargin);
					sheet.addSprite(Bitmap.clipFromData(image.data, image.width, image.height, 4, x, y, this.opts.sizeX, this.opts.sizeY, this.useAlpha));
				}
			}
			callback(null, sheet);
		});
	}
}

export = SpriteSheetLoader;
