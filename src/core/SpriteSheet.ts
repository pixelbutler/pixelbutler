/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Bitmap = require('../core/Bitmap');

// TODO support arbitrary offsets and clipping

class SpriteSheet {

	private sprites: Bitmap[] = [];

	constructor() {

	}

	getSprite(index: number): Bitmap {
		if (this.sprites.length === 0) {
			throw new Error('sheet has zero images');
		}
		return this.sprites[index % this.sprites.length];
	}

	addSprite(bitmap: Bitmap): void {
		this.sprites.push(bitmap);
	}
}

export = SpriteSheet;
