/// <reference path="../../typings/tsd.d.ts" />

'use strict';

export function rand(max: number): number {
	return Math.floor(Math.random() * max);
}

export function clamp(value: number, min:number, max:number) {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}
	return value;
}
