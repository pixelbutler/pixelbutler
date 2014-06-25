/// <reference path="../../typings/tsd.d.ts" />

import INumberArray  = require('./INumberArray');

interface IBitmapData {
	width: number;
	height: number;
	useAlpha: boolean;
	channels: number;
	data: INumberArray;
}

export = IBitmapData;
