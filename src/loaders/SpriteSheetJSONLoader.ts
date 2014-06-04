/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');
import SpriteSheet = require('../core/SpriteSheet');
import ILoader = require('./ILoader');
import JSONLoader = require('./JSONLoader');
import SpriteSheetLoader = require('./SpriteSheetLoader');
import ISpriteSheetOpts = require('../types/ISpriteSheetOpts');

var urlExp = /^(.*?)(\/?)([^\/]+?)$/;

function getURL(main: string, append: string): string {
	urlExp.lastIndex = 0;
	var match = urlExp.exec(main);
	return match[1] + match[2] + append;
}


class SpriteSheetJSONLoader implements ILoader {
	public url: string;
	public useAlpha: boolean;
	public opts: ISpriteSheetOpts;

	constructor(url: string, useAlpha: boolean = false) {
		this.url = url;
		this.useAlpha = useAlpha;
	}

	load(callback: (err: Error, sheet: SpriteSheet) => void): void {
		new JSONLoader(this.url).load((err, json: ISpriteSheetOpts) => {
			if (err) {
				callback(err, null);
				return;
			}
			console.log(json);
			new SpriteSheetLoader(getURL(this.url, json.image), json, this.useAlpha).load(callback);
		});
	}
}

export = SpriteSheetJSONLoader;
