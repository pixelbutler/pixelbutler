/// <reference path="../../typings/tsd.d.ts" />

'use strict';

// TODO add functionality to pass frame-number and high-precision performance.now()
import ITicker = require('./../types/ITicker');

export interface FrameHandler {
	(frame: number, delta: number): void
}

// simple setInterval ticker
export function interval(callback: FrameHandler, fps: number): ITicker {
	var intervalID = 0;
	var frame = 0;
	var prev = performance.now();

	function step() {
		if (intervalID) {
			frame++;
			var now = performance.now();
			callback(frame, now - prev);
			prev = now;
		}
	}

	var that: ITicker = <ITicker>{};
	that.start = function () {
		if (intervalID) {
			clearInterval(intervalID);
		}
		intervalID = setInterval(step, 1000 / fps);
	};
	that.step = function () {
		step();
	};
	that.stop = function () {
		if (intervalID) {
			clearInterval(intervalID);
			intervalID = 0;
		}
	};
	that.isRunning = function () {
		return !!intervalID;
	};
	return that;
}

// simple requestAnimationFrame ticker
export function request(callback: FrameHandler): ITicker {
	var running = false;
	var frame = 0;
	var prev = performance.now();

	function step() {
		if (running) {
			frame++;
			var now = performance.now();
			callback(frame, now - prev);
			prev = now;
			requestAnimationFrame(step);
		}
	}

	var requestID: number;
	var that: ITicker = <ITicker>{};
	that.start = function () {
		if (!running) {
			running = true;
			requestID = requestAnimationFrame(step);
		}
	};
	that.step = function () {
		step();
	};
	that.stop = function () {
		if (running) {
			running = false;
			cancelAnimationFrame(requestID);
		}
	};
	that.isRunning = function () {
		return running;
	};
	return that;
}
