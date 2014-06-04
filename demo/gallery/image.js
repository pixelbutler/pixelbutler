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

		var doge = new lorez.Bitmap(1, 1, true);
		var char = new lorez.Bitmap(1, 1, true);
		char.clear(blue);

		var radial = new lorez.Bitmap(1, 1, true);
		new lorez.loader.Bitmap('assets/trollop.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			char = bitmap;
		});

		new lorez.loader.Bitmap('assets/doge.jpg', false).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			doge = bitmap;
		});

		new lorez.loader.Bitmap('assets/radial.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			radial = bitmap;
		});

		function render(frame, delta) {
			fps.begin();
			$fb.clear(grey);

			$fb.blit(doge, 0, 0);
			$fb.blit(char, 1, 1);
			$fb.blit(radial, 20, 12);

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
