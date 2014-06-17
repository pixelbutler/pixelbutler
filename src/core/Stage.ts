/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import IOptions = require('./../types/IOptions');

import Bitmap = require('./Bitmap');

import IRenderer = require('./../render/IRenderer');
import CanvasRenderer = require('./../render/CanvasRenderer');
import WebGLRenderer = require('./../render/WebGLRenderer');

import IAutoSize = require('../types/IAutoSize');
import autosize = require('./autosize');

class Stage extends Bitmap {

	public canvas: HTMLCanvasElement;
	public renderer: IRenderer;

	public autoSize: IAutoSize;

	constructor(opts: IOptions) {
		super((opts.width || 32), (opts.height || 32), false);
	
		// grab canvas stuff
		this.canvas = <HTMLCanvasElement>(typeof opts.canvas === 'string' ? document.getElementById(opts.canvas) : opts.canvas);
		if (!this.canvas) {
			throw new Error('cannot locate canvas with id "' + opts.canvas + '"');
		}

		this.clear();

		// optional renderer
		if (opts.renderer !== 'canvas') {
			try {
				this.renderer = new WebGLRenderer(this, this.canvas);
			}
			catch (e) {
				console.log(e);
				console.log('render init error, switching to fallback');
			}
		}
		// default & fallback
		if (!this.renderer) {
			this.renderer = new CanvasRenderer(this, this.canvas);
		}

		this.autoSize = new autosize.AutoSize(this, {
			center: opts.center,
			scale: opts.scale
		});
	}

	resizeTo(width: number, height: number): void {
		if (width === this.width && height === this.height) {
			return;
		}
		super.resizeTo(width, height);
		this.autoSize.update();
	}

	render(): void {
		this.renderer.update();
	}

	destruct(): void {
		this.autoSize.stop();
		this.autoSize = null;
		this.renderer.destruct();
		this.renderer = null;
		this.canvas = null;
	}
}

export = Stage;
