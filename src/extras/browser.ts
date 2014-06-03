/// <reference path="../../typings/tsd.d.ts" />

'use strict';

export interface Block {
	width: number;
	height: number;
}

// helper ripped from https://stackoverflow.com/questions/15451321/how-can-i-make-html5-javascript-canvas-fill-window-screen
export function getViewport(): Block {
	var e: any = window;
	var a = 'inner';
	if (!('innerWidth' in window )) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return {width: e[a + 'Width'], height: e[a + 'Height']};
}
