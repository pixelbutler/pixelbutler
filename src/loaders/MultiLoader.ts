/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import ILoader = require('./ILoader');

class MultiLoader {
	private queued: ILoader[] = [];

	// TODO assert line width
	constructor(loaders?: ILoader[]) {
		if (loaders) {
			loaders.forEach((loader) => {
				this.queued.push(loader);
			});
		}
	}

	load(callback: (err: Error, results: any[]) => void): void {
		var errored = false;
		var results = new Array(this.queued.length);

		// TODO consider sanity limit?

		this.queued.forEach((loader, index) => {
			loader.load((err, res) => {
				if (errored) {
					return;
				}
				if (err) {
					console.log(loader.url);
					console.error(err);
					callback(err, null);
					errored = true;
					return;
				}
				results[index] = res;
				this.queued[index] = null;

				if (this.queued.every(loader => !loader)) {
					callback(err, results);
					this.queued = null;
				}
			});
		});
	}
}

export = MultiLoader;
