/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import IRGBA = require('../types/IRGBA');

class RGBA implements IRGBA {
	public r: number;
	public g: number;
	public b: number;
	public a: number;

	constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

export = RGBA;
