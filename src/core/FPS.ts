/// <reference path="../../typings/tsd.d.ts" />

'use strict';

class FPS {
	private previous: number;
	private smoothFPS: number;
	private smoothDelta: number;
	private tickHistory: number[] = [0];
	private deltaHistory: number[] = [0];
	private tickI: number = 0;
	private deltaI: number = 0;

	constructor(smoothFPS: number = 30, smoothDelta: number = 2) {
		this.smoothFPS = smoothFPS;
		this.smoothDelta = smoothDelta;
		this.previous = performance.now();
	}

	begin(): void {
		var now = performance.now();
		var delta = now - this.previous;
		this.tickHistory[this.tickI % this.smoothFPS] = delta;
		this.tickI++;
		this.previous = now;
	}

	end(): void {
		var now = performance.now();
		var delta = now - this.previous;
		this.deltaHistory[this.deltaI % this.smoothDelta] = delta;
		this.deltaI++;
	}

	/* tslint:disable: no-duplicate-variable */
	get fps(): number {
		var tot = 0;
		for (var i = 0; i < this.tickHistory.length; i++) {
			tot += this.tickHistory[i];
		}
		return Math.ceil(1000 / (tot / this.tickHistory.length));
	}

	get redraw(): number {
		var tot = 0;
		for (var i = 0; i < this.deltaHistory.length; i++) {
			tot += this.deltaHistory[i];
		}
		return Math.ceil(tot / this.deltaHistory.length);
	}

	/* tslint:enable: no-duplicate-variable */
}

export = FPS;
