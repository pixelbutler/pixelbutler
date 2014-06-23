/// <reference path="../_ref.d.ts" />

import chai = require('chai');
var assert = chai.assert;

import helper = require('../lib/helper');
var pb = helper.pb;

describe('API', () => {

	it('defines members', () => {
		assert.isObject(pb, 'pb');
	});

	it('defines core members', () => {
		assert.isFunction(pb.Stage, 'Stage');
		assert.isFunction(pb.Bitmap, 'Stage');
		assert.isFunction(pb.RGBA, 'Stage');
		assert.isFunction(pb.HSV, 'Stage');
	});

	it('defines helpers', () => {
		assert.isFunction(pb.FPS, 'Stage');
		assert.isFunction(pb.PerlinNoise, 'Stage');

		assert.isObject(pb.loader, 'Stage');
		assert.isObject(pb.ticker, 'Stage');
	});

	it('defines utils', () => {
		assert.isFunction(pb.rand, 'rand');
		assert.isFunction(pb.rgb2hsv, 'rgb2hsv');
		assert.isFunction(pb.hsv2rgb, 'hsv2rgb');
		assert.isFunction(pb.rgb, 'rgb');
		assert.isFunction(pb.hsv, 'hsv');
	});

	it('defines loaders', () => {
		assert.isFunction(pb.loader.ImageDataLoader, 'ImageDataLoader');
		assert.isFunction(pb.loader.BitmapLoader, 'BitmapLoader');
		assert.isFunction(pb.loader.TextLoader, 'TextLoader');
		assert.isFunction(pb.loader.JSONLoader, 'JSONLoader');
		assert.isFunction(pb.loader.SpriteSheetLoader, 'SpriteSheetLoader');
		assert.isFunction(pb.loader.SpriteSheetJSONLoader, 'SpriteSheetJSONLoader');
		assert.isFunction(pb.loader.MultiLoader, 'MultiLoader');
	});

	it('defines tickers', () => {
		assert.isFunction(pb.ticker.interval, 'interval');
		assert.isFunction(pb.ticker.request, 'request');
	});
	
});
