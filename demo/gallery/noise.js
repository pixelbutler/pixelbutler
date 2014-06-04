'use strict';

define(['lorez'], function (lorez) {

	// return factory
	return function (config) {
		var $fb = new lorez.Stage({
			width: 128,
			height: 128,
			scale: 'fit',
			center: true,
			canvas: config.canvas
		});

		var red = lorez.rgb(255, 0, 0);
		var grey = lorez.rgb(127, 127, 127);
		var white = lorez.rgb(255, 255, 255);
		var black = lorez.rgb(0, 0, 0);

		var tmp = lorez.rgb(0, 0, 0);

		var fps = new lorez.FPS();
		var noiseGen = new lorez.PerlinNoise();

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
			$fb.clear(grey);

			shaderX += .01;
			shaderY += .02;
			var fac = ((Math.sin(frame / 60) + 1) * .5);
			shaderArb = fac * .4 + .3;

			$fb.shader(noiseShader);

			// $fb.text(5, 5, fps.fps, white);

			$fb.render();
		}

		function destruct() {
			$fb.destruct();
		}

		render(0);

		// return a handle
		return {
			stage: $fb,
			destruct: destruct,
			render: render
		};
	};
});
