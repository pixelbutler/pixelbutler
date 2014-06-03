/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import browser = require('./browser');

function assertMode(scaleMode: any): void {
	if ((typeof scaleMode === 'number' && scaleMode > 0) || scaleMode === 'max' || scaleMode === 'fit') {
		return;
	}
	var int = parseInt(scaleMode);
	if (!isNaN(int) && int > 0) {
		return;
	}
	throw new Error('bad scaleMode: ' + scaleMode);
}

export interface IAutoSize {
	scale(mode);
	align(align);
	resize();
	stop();
}

export function create($fb, opts): IAutoSize {
	opts = opts || {};

	var centerObject = true; //opts.center;
	var scaleMode = opts.scale || 'max';
	assertMode(scaleMode);

	$fb.canvas.style.position = 'absolute';

	function resizeTo(width, height) {
		$fb.canvas.width = width;
		$fb.canvas.height = height;
		$fb.resize();
	}

	function resizeFit(viewPort) {
		$fb.canvas.width = viewPort.width;
		$fb.canvas.height = viewPort.height;
		$fb.resize();
	}

	function resizeAspect(viewPort) {
		var ratio = Math.min(viewPort.width / $fb.width, viewPort.height / $fb.height);
		$fb.canvas.width = Math.floor($fb.width * ratio);
		$fb.canvas.height = Math.floor($fb.height * ratio);
		$fb.resize();
	}

	function moveScreenTo(x, y) {
		$fb.canvas.style.left = x + 'px';
		$fb.canvas.style.top = y + 'px';
	}

	function moveScreenCenter(viewPort) {
		moveScreenTo(Math.floor((viewPort.width - $fb.canvas.width) / 2), Math.floor((viewPort.height - $fb.canvas.height) / 2));
	}

	function listen() {
		unlisten();
		if (centerObject || scaleMode === 'fit') {
			window.addEventListener('resize', update);
		}
	}

	function unlisten() {
		window.removeEventListener('resize', update);
	}

	function setMode(mode, align) {
		assertMode(mode);

		scaleMode = mode;
		centerObject = !!align;

		var multi = parseInt(scaleMode);
		if (!isNaN(multi)) {
			scaleMode = multi;
			resizeTo(Math.floor($fb.width * multi), Math.floor($fb.height * multi));
			unlisten();
		}
		if (scaleMode === 'fit') {
			moveScreenTo(0, 0);
		}
		if (centerObject || scaleMode === 'fit' || scaleMode === 'max') {
			listen();
		}
		update();
	}

	function update() {
		var viewPort = browser.getViewport();
		if (scaleMode === 'fit') {
			resizeFit(viewPort);
		}
		else if (scaleMode === 'max') {
			resizeAspect(viewPort);
		}
		if (centerObject || scaleMode === 'max') {
			moveScreenCenter(viewPort);
		}
		else {
			moveScreenTo(0, 0);
		}
	}

	setMode(scaleMode, centerObject);

	// factory result
	var that: IAutoSize = <IAutoSize>{};
	that.scale = function (mode) {
		setMode(mode, centerObject);
	};
	that.align = function (align) {
		setMode(scaleMode, align);
	};
	that.resize = function () {
		update();
	};
	that.stop = function () {
		unlisten();
	};

	return that;
}
