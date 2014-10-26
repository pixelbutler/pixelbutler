/// <reference path="../_ref.d.ts" />

import chai = require('chai');
var assert = chai.assert;

import helper = require('../lib/helper');
var pb = helper.pb;

describe('Stage', () => {

	helper.runit({
		label: 'create default',
		width: 64,
		height: 64
	}, (info, done) => {
		var stage = new pb.Stage({
			canvas: info.canvas,
			renderer: 'canvas',
			width: 32,
			height: 32
		});
		stage.render();

		// var data = helper.encodeBitmapData(stage);

		// console.log(helper.decodeBitmapData(data));
		done();
	});

	helper.runit({
		label: 'create red',
		width: 64,
		height: 64
	}, (info, done) => {
		var stage = new pb.Stage({
			canvas: info.canvas,
			renderer: 'canvas',
			width: 32,
			height: 32
		});
		stage.clear({r: 255, g: 0, b: 0});
		stage.render();
		done();
	});
});

