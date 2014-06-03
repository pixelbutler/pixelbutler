/// <reference path="../../typings/tsd.d.ts" />

'use strict';

// TODO add functionality to pass frame-number and high-precision performance.now()

export interface ITicker {
	start(): void;
	step(): void;
	stop(): void;
	isRunning(): void;
}

// simple setInterval ticker
export function interval(callback, fps): ITicker {
	var intervalId = 0;

	function step() {
		callback();
	}

	var that: ITicker = <ITicker>{};
	that.start = function () {
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(step, 1000 / fps);
	};
	that.step = function () {
		step();
	};
	that.stop = function () {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = 0;
		}
	};
	that.isRunning = function () {
		return !!intervalId;
	};
	return that;
}

// simple requestAnimationFrame ticker
export function request(callback): ITicker {
	var running = false;

	function step() {
		callback();
		if (running) {
			requestAnimationFrame(step);
		}
	}

	var num: number;
	var that: ITicker = <ITicker>{};
	that.start = function () {
		if (!running) {
			running = true;
			num = requestAnimationFrame(step);
		}
	};
	that.step = function () {
		step();
	};
	that.stop = function () {
		if (running) {
			running = false;
			cancelAnimationFrame(num);
		}
	};
	that.isRunning = function () {
		return running;
	};
	return that;
}

// fancy ticker tries to find exacter frame-rate (sort-of-works for lower fps)
//TODO improve logic and try to correct for drift and GC frames
export function stable(callback, fps): ITicker {
	var intervalId = 0;
	var check = 1;
	var next = performance.now();

	function step() {
		var start = performance.now();
		if (start > next) {
			callback();
			var dur = (start - performance.now());
			next = start + (1000 / fps) - dur;
		}
	}

	var that: ITicker = <ITicker>{};
	that.start = function () {
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(step, check);
	};
	that.step = function () {
		step();
	};
	that.stop = function () {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = 0;
		}
	};
	that.isRunning = function () {
		return !!intervalId;
	};
	return that;
}
