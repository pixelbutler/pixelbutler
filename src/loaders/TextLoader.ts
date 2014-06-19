/// <reference path='../../typings/tsd.d.ts' />

'use strict';

import xhr = require('xhr');

import ILoader = require('./ILoader');

class TextLoader implements ILoader {
	public url: string;

	constructor(url: string) {
		this.url = url;
	}

	load(callback: (err: Error, data: string) => void): void {
		xhr({
			uri: this.url
		}, function (err, resp, body) {
			if (err) {
				callback(err, null);
			}
			else {
				callback(null, body);
			}
		});
	}
}

export = TextLoader;
