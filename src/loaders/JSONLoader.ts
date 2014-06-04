/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import ILoader = require('./ILoader');
import TextLoader = require('./TextLoader');

class JSONLoader implements ILoader {
	public url: string;

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
