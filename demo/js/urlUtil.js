// simplistic hash fragment data encoder
define(function () {
	'use strict';
	function parseHash(hash) {
		var ret = {};
		if (!hash) {
			return ret;
		}
		hash.replace(/^#/, '').split(',').forEach(function (part) {
			var parts = part.split(':');
			if (parts.length === 1) {
				ret[parts[0]] = true;
			}
			else if (parts.length === 2) {
				ret[parts[0]] = getValue(parts[1]);
			}
			else {
				throw new Error('supports only simple strings');
			}
		});
		return ret;
	}

	function assertSimple(value) {
		if (value.indexOf(':') > -1 || value.indexOf(',') > -1) {
			throw new Error('supports only simple strings');
		}
	}

	function getValue(value) {
		value = unescape(value)
		var num = parseInt(value, 10);
		if (!isNaN(num)) {
			return num;
		}
		if (value === 'true') {
			return true;
		}
		if (value === 'false') {
			return false;
		}
		if (value === 'null') {
			return null;
		}
		if (value === 'undefined') {
			return undefined;
		}
		return value;
	}

	function makeHash(obj) {
		var ret = '';
		if (!obj) {
			return ret;
		}
		var keys = Object.keys(obj);
		if (keys.length === 0) {
			return ret;
		}
		ret = '#' + Object.keys(obj).map(function (key) {
			var value = escape(String(obj[key]));
			assertSimple(value);
			return key + ':' + value;
		}).join(',');
		return ret;
	}

	return {
		getValue: getValue,
		parseHash: parseHash,
		makeHash: makeHash
	};
});
