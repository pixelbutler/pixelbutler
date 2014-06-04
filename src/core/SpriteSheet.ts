/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

// TODO support arbitrary offsets and clipping

class SpriteSheet {

	public images: Bitmap[] = [];

	constructor() {

	}

	getSprite(index: number): Bitmap {
		if (this.images.length === 0) {
			throw new Error('sheet has zero images');
		}
		return this.images[index % this.images.length];
	}

	addSprite(bitmap: Bitmap): void {
		this.images.push(bitmap);
	}
}

export = SpriteSheet;
