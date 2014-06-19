'use strict';

define(['pixelbutler'], function (pixelbutler) {

	// return factory
	return function (config) {
		var $pb = new pixelbutler.Stage({
			width: 64,
			height: 64,
			scale: 8,
			center: true,
			canvas: config.canvas
		});

		var red = pixelbutler.rgb(255, 0, 0);
		var blue = pixelbutler.rgb(0, 0, 255);
		var grey = pixelbutler.rgb(127, 127, 127);
		var white = pixelbutler.rgb(255, 255, 255);
		var black = pixelbutler.rgb(0, 0, 0);

		var fps = new pixelbutler.FPS();

		var doge = new pixelbutler.Bitmap(1, 1, true);
		var char = new pixelbutler.Bitmap(1, 1, true);
		char.clear(blue);

		var radial = new pixelbutler.Bitmap(1, 1, true);
		new pixelbutler.loader.BitmapLoader('assets/trollop.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			char = bitmap;
		});

		new pixelbutler.loader.BitmapLoader('assets/doge.jpg', false).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			doge = bitmap;
		});

		new pixelbutler.loader.BitmapLoader('assets/radial.png', true).load(function(err, bitmap) {
			if (err) {
				console.error(err);
				return;
			}
			radial = bitmap;
		});

		function render(frame, delta) {
			fps.begin();
			$pb.clear(grey);

			$pb.blit(doge, 0, 0);
			$pb.blit(char, 1, 1);
			$pb.blit(radial, 20, 12);

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
