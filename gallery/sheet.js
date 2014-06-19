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
		var blue = pixelbutler.rgb(64, 128, 255);
		var grey = pixelbutler.rgb(127, 127, 127);
		var white = pixelbutler.rgb(255, 255, 255);
		var black = pixelbutler.rgb(0, 0, 0);

		var fps = new pixelbutler.FPS();

		new pixelbutler.loader.MultiLoader([
			new pixelbutler.loader.SpriteSheetJSONLoader('assets/blocks1.json', true),
			new pixelbutler.loader.SpriteSheetJSONLoader('assets/runner.json', true)
		]).load(function (err, results) {
			if (err) {
				console.error(err);
				return;
			}
			var sheet = results[0];
			var runner = results[1];

			function renderContent(frame) {
				$pb.blit(sheet.getSprite(6, 5), -8, -8);
				$pb.blit(sheet.getSprite(7, 5), 8, -8);

				$pb.blit(sheet.getSprite(8, 5), 24, 8);
				$pb.blit(sheet.getSprite(9, 5), 40, 8);
				$pb.blit(sheet.getSprite(10, 5), 56, 8);

				$pb.blit(sheet.getSprite(5, 1), 0, 48);
				$pb.blit(sheet.getSprite(6, 1), 16, 48);
				$pb.blit(sheet.getSprite(7, 1), 32, 48);
				$pb.blit(sheet.getSprite(10, 1), 48, 48);

				$pb.blit(runner.getSpriteAt(Math.floor(frame / 10) % 7), (Math.floor(frame / 3) % 100) - 32, 12);
				// $pb.blit(runner.getSpriteAt(Math.floor(frame / 15) % 7), 32, 12);
			}

			// ugly swop
			renderFunc = renderContent;
		});

		var renderFunc = function () {
		};

		function render(frame, delta) {
			fps.begin();
			$pb.clear(blue);

			renderFunc(frame);

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
