/// <reference path='../../typings/tsd.d.ts' />

'use strict';

import ILoader = require('./ILoader');

// https://en.wikipedia.org/wiki/XMLHttpRequest
function getXHR() {
	if (XMLHttpRequest) {
		return new XMLHttpRequest();
	}
	try {
		return new ActiveXObject('Msxml2.XMLHTTP.6.0');
	}
	catch (e) {
	}
	try {
		return new ActiveXObject('Msxml2.XMLHTTP.3.0');
	}
	catch (e) {
	}
	try {
		return new ActiveXObject('Microsoft.XMLHTTP');
	}
	catch (e) {
	}
	throw new Error('This browser does not support XMLHttpRequest.');
}

class TextLoader implements ILoader {
	public url: string;

	// TODO assert line width
	constructor(url: string) {
		this.url = url;
	}

	load(callback: (err: Error, data: string) => void): void {
		try {
			var xhr = getXHR();
		}
		catch (e) {
			callback(e, null);
			return;
		}
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				callback(null, xhr.responseText);
			}
		};
		// TODO add more errors? what if bad url?
		xhr.open('GET', this.url, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send(null);
	}
}

export = TextLoader;
