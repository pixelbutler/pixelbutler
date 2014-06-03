/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import stats = require('../../vendor/Stats.js');

var statsA;
var statsB;

interface StatsWrap {
	(): void
	begin(): void
	end(): void
	stop(): void
}

// add stats measurement and return wrapped function
export function wrap(callback) {
	if (!statsA) {
		statsA = new Stats();
		document.body.appendChild(statsA.domElement);
	}
	statsA.setMode(0); // 0: fps, 1: ms
	statsA.domElement.style.position = 'absolute';
	statsA.domElement.style.right = '3px';
	statsA.domElement.style.top = '1px';

	if (!statsB) {
		statsB = new Stats();
		document.body.appendChild(statsB.domElement);
	}
	statsB.setMode(1); // 0: fps, 1: ms
	statsB.domElement.style.position = 'absolute';
	statsB.domElement.style.right = '3px';
	statsB.domElement.style.top = '51px';

	if (!callback) {
		// dummy
		callback = function () {
		};
	}

	var wrap: StatsWrap = <StatsWrap>function () {
		statsA.begin();
		statsB.begin();
		callback();
		statsA.end();
		statsB.end();
	};
	wrap.begin = function () {
		statsA.begin();
		statsB.begin();
	};
	wrap.end = function () {
		statsA.end();
		statsB.end();
	};
	wrap.stop = function () {
		statsA.end();
		statsB.end();
		statsA.domElement.parent.removeChild(statsA.domElement);
		statsB.domElement.parent.removeChild(statsB.domElement);
	};

	return wrap;
}
