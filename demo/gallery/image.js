'use strict';

define(['lorez'], function (lorez) {

	// return factory
	return function (config) {
		var $fb = new lorez.Stage({
			width: 64,
			height: 64,
			scale: 8,
			center: true,
			canvas: config.canvas
		});

		var red = lorez.rgb(255, 0, 0);
		var blue = lorez.rgb(0, 0, 255);
		var grey = lorez.rgb(127, 127, 127);
		var white = lorez.rgb(255, 255, 255);
		var black = lorez.rgb(0, 0, 0);

		var fps = new lorez.FPS();

		var alpha = new lorez.Bitmap(4, 4, true);
		alpha.setPixel(0, 0, blue);
		alpha.setPixel(0, 1, blue);
		alpha.setPixel(1, 0, blue);

		var char = new lorez.Bitmap(1, 1, true);
		char.clear(blue);

		var radial = new lorez.Bitmap(1, 1, true);

		new lorez.BitmapLoader('assets/trollop.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			char = bitmap;
		});

		new lorez.BitmapLoader('assets/radial.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			radial = bitmap;
		});


		function render(frame, delta) {
			fps.begin();
			$fb.clear(grey);

			$fb.blit(char, 1, 1);
			$fb.blit(radial, 16, 16);
			$fb.blit(alpha, 32, 32);

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
