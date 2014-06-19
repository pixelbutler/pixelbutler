'use strict';

define(['pixelbutler'], function (pixelbutler) {

	// return factory
	return function (config) {
		var $pb = new pixelbutler.Stage({
			width: 64,
			height: 64,
			scale: 'fit',
			center: true,
			canvas: config.canvas
		});

		var red = pixelbutler.rgb(255, 0, 0);
		var grey = pixelbutler.rgb(127, 127, 127);
		var white = pixelbutler.rgb(255, 255, 255);
		var black = pixelbutler.rgb(0, 0, 0);

		var tmp = pixelbutler.rgb(0, 0, 0);

		var fps = new pixelbutler.FPS();
		var noiseGen = new pixelbutler.PerlinNoise();

		var shaderX = 0;
		var shaderY = 0;
		var shaderArb = 0;

		var noiseShader = function (x, y, col) {
			var noiseR = noiseGen.noise(x + shaderX, y + shaderY, shaderArb);
			var noiseG = noiseGen.noise(x + shaderX + 1, y + shaderY, shaderArb);

			col.r = Math.floor(noiseR * 255);
			col.g = Math.floor(noiseG * 255);
			col.b = Math.floor(noiseR * 128) + 128;
			return col;
		};

		function render(frame, delta) {
			fps.begin();
			$pb.clear(grey);

			shaderX += .01;
			shaderY += .02;
			var fac = ((Math.sin(frame / 60) + 1) * .5);
			shaderArb = fac * .4 + .3;

			$pb.shader(noiseShader);

			// $pb.text(5, 5, fps.fps, white);

			$pb.render();
		}

		function destruct() {
			$pb.destruct();
		}

		render(0);

		// return a handle
		return {
			stage: $pb,
			destruct: destruct,
			render: render
		};
	};
});
