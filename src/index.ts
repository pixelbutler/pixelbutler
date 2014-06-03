/// <reference path="../typings/tsd.d.ts" />

'use strict';

export import Stage = require('./core/Stage');

export import Bitmap = require('./core/Bitmap');

import RGBA = require('./core/RGBA');

import _util = require('./core/util');
export import rand = _util.rand;

import _color = require('./core/color');
export import rgb2hsv = _color.rgb2hsv;
export import hsv2rgb = _color.hsv2rgb;

export import ticker = require('./core/ticker');

export function rgb(r: number, g: number, b: number): RGBA {
	return new RGBA(r, g, b);
}

// fake stuff for compiler bug
[
	_util,
	_color,
	ticker,
	Bitmap,
	Stage
];
