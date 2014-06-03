/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import pixel = require('./pixel');

import rand = pixel.rand;

export function discoData(px, width, height, useAlpha?) {
	var lim, i;
	if (useAlpha) {
		lim = width * height * 4;
		for (i = 0; i < lim; i += 4) {
			px[i] = rand(256);
			px[i + 1] = rand(256);
			px[i + 2] = rand(256);
			px[i + 3] = 255;
		}
	} else {
		lim = width * height * 3;
		for (i = 0; i < lim; i += 3) {
			px[i] = rand(256);
			px[i + 1] = rand(256);
			px[i + 2] = rand(256);
		}
	}
}

export function clearData(px, width, height, useAlpha?) {
	var lim, i;
	if (useAlpha) {
		lim = width * height * 4;
		for (i = 0; i < lim; i += 4) {
			px[i] = 0;
			px[i + 1] = 0;
			px[i + 2] = 0;
			px[i + 3] = 255;
		}
	} else {
		lim = width * height * 3;
		for (i = 0; i < lim; i += 3) {
			px[i] = 0;
			px[i + 1] = 0;
			px[i + 2] = 0;
		}
	}
}

export function alphaData(px, width, height, alpha) {
	var lim = width * height * 4;
	for (var i = 0; i < lim; i += 4) {
		px[i + 3] = alpha;
	}
}
