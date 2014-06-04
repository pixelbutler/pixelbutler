/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import TextLoader = require('./TextLoader');

class JSONLoader {
	public url: string;

	// TODO assert line width
	constructor(url: string) {
		this.url = url;
	}

	load(callback: (err: Error, json: any) => void): void {
		new TextLoader(this.url).load((err, text) => {
			if (err) {
				callback(err, null);
				return;
			}
			try {
				var obj = JSON.parse(text);
			}
			catch (e) {
				callback(e, null);
			}
			callback(null, obj);

		});
	}
}

export = JSONLoader;
