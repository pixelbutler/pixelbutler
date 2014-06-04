/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');
import SpriteSheet = require('../core/SpriteSheet');
import JSONLoader = require('./JSONLoader');
import SpriteSheetLoader = require('./SpriteSheetLoader');
import ISpriteSheetOpts = require('../types/ISpriteSheetOpts');

var urlExp = /^(.*?)(\/?)([^\/]+?)$/;

function getURL(main: string, append: string): string {
	urlExp.lastIndex = 0;
	var match = urlExp.exec(main);
	return match[1] + match[2] + append;
}


class SpriteSheetJSONLoader {
	public url: string;
	public useAlpha: boolean;
	public opts: ISpriteSheetOpts;

	// TODO assert line width
	constructor(url: string, opts: ISpriteSheetOpts, useAlpha: boolean = false) {
		this.url = url;
		this.opts = opts;
		this.useAlpha = useAlpha;
	}

	load(callback: (err: Error, sheet: SpriteSheet) => void): void {
		new JSONLoader(this.url).load((err, json) => {
			if (err) {
				callback(err, null);
				return;
			}
			console.log(json);
			new SpriteSheetLoader(getURL(this.url, json.image), json).load(callback);
		});
	}
}

export = SpriteSheetJSONLoader;
