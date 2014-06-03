/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import Stage = require('./Stage');
import browser = require('./browser');

import IAutoSize = require('./../types/IAutoSize');
import IBlock = require('./../types/IBlock');

function assertMode(scaleMode: any): void {
	if ((typeof scaleMode === 'number' && scaleMode > 0)
		|| scaleMode === 'max'
		|| scaleMode === 'fit'
		|| scaleMode === 'none') {
		return;
	}
	var int = parseInt(scaleMode);
	if (!isNaN(int) && int > 0) {
		return;
	}
	throw new Error('bad scaleMode: ' + scaleMode);
}

export interface IAutoSizeOpts {
	center?: boolean;
	scale?: any;
}

export class AutoSize implements IAutoSize {

	private stage: Stage;
	private scaleMode: any;
	private centerView: boolean;
	public update: (event?: any) => void;

	constructor(stage: Stage, opts: IAutoSizeOpts) {
		this.stage = stage;

		opts = opts || {};
		this.centerView = !!opts.center;
		this.scaleMode = opts.scale || 'none';
		assertMode(this.scaleMode);

		stage.canvas.style.position = 'absolute';

		this.update = (event?: any) => {
			var viewPort = browser.getViewport();
			if (this.scaleMode === 'fit') {
				this.scaleFit(viewPort);
			}
			else if (this.scaleMode === 'max') {
				this.scaleAspect(viewPort);
			}
			else {
				this.stage.renderer.resize();
			}

			if (this.centerView || this.scaleMode === 'max') {
				this.moveScreenCenter(viewPort);
			}
			else {
				this.moveScreenTo(0, 0);
			}
		}

		this.setMode(this.scaleMode, this.centerView);
	}

	// factory result
	scale(mode: any): void {
		this.setMode(mode, this.centerView);
	}

	center(center: boolean = true): void {
		this.setMode(this.scaleMode, center);
	}

	resize(): void {
		this.update();
	}

	stop() {
		this.unlisten();
	}

	private scaleTo(width: number, height: number): void {
		this.scaleMode = 'none';
		this.stage.canvas.width = width;
		this.stage.canvas.height = height;
		this.stage.renderer.resize();
	}

	private scaleFit(viewPort: IBlock): void {
		this.stage.canvas.width = viewPort.width;
		this.stage.canvas.height = viewPort.height;
		this.stage.renderer.resize();
	}

	private scaleAspect(viewPort: IBlock): void {
		var ratio = Math.min(viewPort.width / this.stage.width, viewPort.height / this.stage.height);
		this.stage.canvas.width = Math.floor(this.stage.width * ratio);
		this.stage.canvas.height = Math.floor(this.stage.height * ratio);
		this.stage.renderer.resize();
	}

	private moveScreenTo(x: number, y: number): void {
		this.stage.canvas.style.left = x + 'px';
		this.stage.canvas.style.top = y + 'px';
	}

	private moveScreenCenter(viewPort: IBlock): void {
		this.moveScreenTo(Math.floor((viewPort.width - this.stage.canvas.width) / 2), Math.floor((viewPort.height - this.stage.canvas.height) / 2));
	}

	private listen(): void {
		this.unlisten();
		if (this.centerView || this.scaleMode === 'fit') {
			window.addEventListener('resize', this.update);
		}
	}

	private unlisten(): void {
		window.removeEventListener('resize', this.update);
	}

	private setMode(mode: any, center: boolean): void {
		assertMode(mode);

		this.scaleMode = mode;

		var multi = parseInt(this.scaleMode);
		if (!isNaN(multi)) {
			this.scaleMode = multi;
			this.scaleTo(Math.floor(this.stage.width * multi), Math.floor(this.stage.height * multi));
			this.unlisten();
		}
		if (this.scaleMode === 'fit') {
			this.moveScreenTo(0, 0);
		}
		if (center || this.scaleMode === 'fit' || this.scaleMode === 'max') {
			this.listen();
		}
		this.update();
	}
}
