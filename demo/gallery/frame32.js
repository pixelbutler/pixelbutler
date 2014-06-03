'use strict';

define(['lorez'], function (lorez) {

	// return factory
	return function (config) {
		var $fb = new lorez.Stage({
			width: 32,
			height: 32,
			scale: 8,
			center: true,
			canvas: config.canvas
		});

		var red = lorez.rgb(255, 0, 0);
		var white = lorez.rgb(255, 255, 255);
		var black = lorez.rgb(0, 0, 0);

		var sprite = new lorez.Bitmap(3, 3);
		sprite.setPixel(0, 0, red);
		sprite.setPixel(2, 0, red);
		sprite.setPixel(0, 2, red);
		sprite.setPixel(2, 2, red);
		sprite.setPixel(1, 1, white);

		var bellish = lorez.rgb(32, 32, 64);
		var purrrpl = lorez.rgb(64, 32, 64);
		var grrhey = lorez.rgb(32, 32, 32);

		var pix0 = lorez.rgb(32, 32, 64);
		var pix1 = lorez.rgb(48, 48, 164);
		var pix2 = lorez.rgb(72, 72, 200);

		var blackSize = 16;
		var purSize = 16;

		var mp2 = Math.PI * 2;

		function render() {
			$fb.clear(black);

			var factor = Math.sin(frame / 60 * mp2) * 0.5 + 1;

			$fb.fillCircle(0, 0, purSize * factor, purrrpl);
			$fb.fillCircle($fb.width, $fb.height, purSize * factor, purrrpl);

			$fb.fillCircle($fb.width, 0, blackSize, black);
			$fb.drawCircle($fb.width, 0, blackSize, bellish);

			$fb.fillCircle(0, $fb.height, blackSize, black);
			$fb.drawCircle(0, $fb.height, blackSize, bellish);

			var amount = 12;
			for (var i = 0; i < amount; i++) {
				var x = (i * 7) % $fb.width;
				//var y = (i * 10 + t) % $fb.height;
				var y = ((i ^ (i << 7)) + frame * 4) % $fb.height;
				$fb.setPixel(x, y, pix0);
				$fb.setPixel(x, y + 1, pix1);
				$fb.setPixel(x, y + 2, pix2);
			}

			for (var i = 0; i < 2; i++) {
				$fb.blit(sprite, Math.random() * $fb.width, Math.random() * $fb.height);
			}

			var col = lorez.hsv2rgb({h: 220, s: lorez.rand(100), v: 50 + lorez.rand(50)});
			$fb.text(5, 5, 'frame'.substring(0, (frame % 80 / 5)), col);
			$fb.text(5, 23, 'buffer'.substring(0, (frame % 80 / 5)), col);

			$fb.drawRect(2, 2, $fb.width - 5, $fb.height - 5, lorez.hsv2rgb({h: 220, s: lorez.rand(100), v: lorez.rand(100)}));

			$fb.blit(sprite, 1, 1);
			$fb.blit(sprite, $fb.width - 4, 1);
			$fb.blit(sprite, $fb.width - 4, $fb.height - 4);
			$fb.blit(sprite, 1, $fb.height - 4);

			$fb.render();
		}

		function destruct() {
			$fb.destruct();
		}

		// return a handle
		return {
			stage: $fb,
			destruct: destruct,
			render: render
		};
	};
});
