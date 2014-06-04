/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import IRGB = require('../types/IRGB');
import IRGBA = require('../types/IRGBA');
import IHSV = require('../types/IHSV');
import RGBA = require('./RGBA');
import HSV = require('./HSV');

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 *
 * This, in turn, was taken from the snippet at
 * http://snipplr.com/view/14590/hsv-to-rgb/
 */
export function hsv2rgb(hsv: IHSV): IRGBA {
	var r, g, b;
	var i;
	var f, p, q, t;
	var h = hsv.h;
	var s = hsv.s;
	var v = hsv.v;

	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));

	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;

	if (s === 0) {
		// Achromatic (grey)
		r = g = b = v;
		return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
	}

	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch (i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;

		case 1:
			r = q;
			g = v;
			b = p;
			break;

		case 2:
			r = p;
			g = v;
			b = t;
			break;

		case 3:
			r = p;
			g = q;
			b = v;
			break;

		case 4:
			r = t;
			g = p;
			b = v;
			break;

		default: // case 5:
			r = v;
			g = p;
			b = q;
	}

	return new RGBA(
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	);
}

/**
 * RGB to HSV color conversion
 *
 * Gratefully lifted from Mic's code on StackOverflow:
 * http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript#8023734
 */
export function rgb2hsv(rgb: IRGB): IHSV {
	var rr, gg, bb,
		r = rgb.r / 255,
		g = rgb.g / 255,
		b = rgb.b / 255,
		h, s,
		v = Math.max(r, g, b),
		diff = v - Math.min(r, g, b),
		diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

	if (diff === 0) {
		h = s = 0;
	}
	else {
		s = diff / v;
		rr = diffc(r);
		gg = diffc(g);
		bb = diffc(b);

		if (r === v) {
			h = bb - gg;
		} else if (g === v) {
			h = (1 / 3) + rr - bb;
		} else if (b === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}
	return new HSV(
		Math.round(h * 360),
		Math.round(s * 100),
		Math.round(v * 100)
	);
}
