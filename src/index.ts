/// <reference path="../typings/tsd.d.ts" />

'use strict';

export import Framebuffer = require('./core/Framebuffer');

import _pixel = require('./core/pixel');
export import rgb2hsv = _pixel.rgb2hsv;
export import hsv2rgb = _pixel.hsv2rgb;
export import rand = _pixel.rand;

import _autosize = require('./extras/autosize');
export import autosize = _autosize.create;

export import ticker = require('./extras/ticker');

// fake stuff for compiler bug
[
	_pixel,
	_autosize,
	ticker,
	Framebuffer
];
