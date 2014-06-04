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
		var blue = lorez.rgb(64, 128, 255);
		var grey = lorez.rgb(127, 127, 127);
		var white = lorez.rgb(255, 255, 255);
		var black = lorez.rgb(0, 0, 0);

		var fps = new lorez.FPS();

		var char = new lorez.Bitmap(1, 1, true);
		char.clear(blue);

		new lorez.loader.SpriteSheetJSONLoader('assets/blocks1.json', true).load(function (err, sheet) {
			if (err) {
				console.error(err);
				return;
			}

			new lorez.loader.SpriteSheetJSONLoader('assets/runner.json', true).load(function (err, runner) {
				if (err) {
					console.error(err);
					return;
				}

				function renderContent(frame) {
					$fb.blit(sheet.getSprite(6, 5), -8, -8);
					$fb.blit(sheet.getSprite(7, 5), 8, -8);

					$fb.blit(sheet.getSprite(8, 5), 24, 8);
					$fb.blit(sheet.getSprite(9, 5), 40, 8);
					$fb.blit(sheet.getSprite(10, 5), 56, 8);

					$fb.blit(sheet.getSprite(5, 1), 0, 48);
					$fb.blit(sheet.getSprite(6, 1), 16, 48);
					$fb.blit(sheet.getSprite(7, 1), 32, 48);
					$fb.blit(sheet.getSprite(10, 1), 48, 48);

					$fb.blit(runner.getSpriteAt(Math.floor(frame / 15) % 7), (Math.floor(frame / 3) % 100) - 32, 12);
					// $fb.blit(runner.getSpriteAt(Math.floor(frame / 15) % 7), 32, 12);
				}

				// ugly swop
				renderFunc = renderContent;
			});
		});

		var renderFunc = function () {
		};

		function render(frame, delta) {
			fps.begin();
			$fb.clear(blue);

			renderFunc(frame);

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
