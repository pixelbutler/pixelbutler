/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');
import SpriteSheet = require('../core/SpriteSheet');
import ImageDataLoader = require('./ImageDataLoader');
import ISpriteSheetOpts = require('../types/ISpriteSheetOpts');

class SpriteSheetLoader {
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
		new ImageDataLoader(this.url).load((err, image) => {
			if (err) {
				callback(err, null);
				return;
			}

			var sheet = new SpriteSheet();

			callback(null, sheet);
		});
	}
}

export = SpriteSheetLoader;
