/// <reference path="../_ref.d.ts" />

// trick local definition
import PixelButler = require('pixelbutler');
import LZS = require('lz-string');

export var pb: typeof PixelButler = require('../../../build/index');

export var config = {
	baseUrl: window.location.protocol
		+ window.location.host
		+ (window.location.port ? ':' + window.location.port : '')
};

export interface ICanvasOpts {
	skip?: boolean;
	ignore?: boolean;
	label: string;
	width: number;
	height: number;
}

export interface ICanvas {
	opts: ICanvasOpts;
	outer: HTMLDivElement;
	canvas: HTMLCanvasElement;
}

export function runit(opts: ICanvasOpts, call: (info: ICanvas, done: () => void) => void): void  {
	var assertion = (done) => {
		var info = createTestCanvas(opts);
		call(info, done);
	};
	if (opts.skip) {
		it.only(opts.label, assertion);
	}
	else if (opts.skip) {
		it.skip(opts.label, assertion);
	}
	else {
		it(opts.label, assertion);
	}
}

var imageElem: HTMLElement;

export function createTestCanvas(opts: ICanvasOpts): ICanvas {
	if (!imageElem) {
		imageElem = document.getElementById('images');
	}

	var outer = document.createElement('div');
	outer.className = 'test-canvas';

	var labelP = document.createElement('div');
	labelP.className = 'test-label';

	var labelText = document.createTextNode(opts.label);
	labelP.appendChild(labelText);

	outer.appendChild(labelP);

	var canvas = document.createElement('canvas');
	canvas.width = opts.width;
	canvas.height = opts.height;

	outer.appendChild(canvas);
	imageElem.appendChild(outer);

	var ret = {
		opts: opts,
		outer: outer,
		canvas: canvas
	};
	return ret;
}

function utf8_to_b64( str ) {
	return window.btoa(encodeURIComponent(escape(str)));
}

function b64_to_utf8( str ) {
	return unescape(decodeURIComponent(window.atob(str)));
}
export function encodeBitmapData(bitmap: PixelButler.Bitmap): string {
	var res = {
		width: bitmap.width,
		height: bitmap.height,
		useAlpha: bitmap.useAlpha,
		channels: bitmap.channels,
		data: bitmap.data
	};
	return utf8_to_b64(LZS.compress(JSON.stringify(res)));
}

export function decodeBitmapData(str: string): PixelButler.IBitmapData {
	return JSON.parse(LZS.decompress(b64_to_utf8(str)));
}
