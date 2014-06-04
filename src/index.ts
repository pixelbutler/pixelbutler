/// <reference path="../typings/tsd.d.ts" />

'use strict';

export import Stage = require('./core/Stage');

export import Bitmap = require('./core/Bitmap');
export import FPS = require('./core/FPS');

import RGBA = require('./core/RGBA');
import HSV = require('./core/HSV');

export import PerlinNoise = require('./extra/PerlinNoise');

import _util = require('./core/util');
export import rand = _util.rand;

import _color = require('./core/color');
export import rgb2hsv = _color.rgb2hsv;
export import hsv2rgb = _color.hsv2rgb;

export import ticker = require('./core/ticker');

export function rgb(r: number, g: number, b: number): RGBA {
	return new RGBA(r, g, b);
}
// TODO clean hsv alias thingy?
var hsvTmp = new HSV();
export function hsv(h: number, s: number, v: number): RGBA {
	hsvTmp.h = h;
	hsvTmp.s = s;
	hsvTmp.v = v;
	return hsv2rgb(hsvTmp);
}

// fake stuff for compiler bug (borked unused-imports-optimiser faulty removes exports)
[
	PerlinNoise,
	_util,
	_color,
	ticker,
	RGBA,
	HSV,
	Bitmap,
	FPS,
	Stage
];
