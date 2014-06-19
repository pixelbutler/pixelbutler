'use strict';

define(['pixelbutler'], function (pixelbutler) {

	// return factory
	return function (config) {
		var $pb = new pixelbutler.Stage({
			width: 32,
			height: 32,
			scale: 8,
			center: true,
			canvas: config.canvas
		});

		var red = pixelbutler.rgb(255, 0, 0);
		var white = pixelbutler.rgb(255, 255, 255);
		var black = pixelbutler.rgb(0, 0, 0);

		var sprite = new pixelbutler.Bitmap(3, 3);
		sprite.setPixel(0, 0, red);
		sprite.setPixel(2, 0, red);
		sprite.setPixel(0, 2, red);
		sprite.setPixel(2, 2, red);
		sprite.setPixel(1, 1, white);

		var bellish = pixelbutler.rgb(32, 32, 64);
		var purrrpl = pixelbutler.rgb(64, 32, 64);

		var pix0 = pixelbutler.rgb(32, 32, 64);
		var pix1 = pixelbutler.rgb(48, 48, 164);
		var pix2 = pixelbutler.rgb(72, 72, 200);

		var blackSize = 16;
		var purSize = 16;

		var mp2 = Math.PI * 2;

		function render(frame) {
			$pb.clear(black);

			var factor = Math.sin(frame / 60 * mp2) * 0.5 + 1;

			$pb.fillCircle(0, 0, purSize * factor, purrrpl);
			$pb.fillCircle($pb.width, $pb.height, purSize * factor, purrrpl);

			$pb.fillCircle($pb.width, 0, blackSize, black);
			$pb.drawCircle($pb.width, 0, blackSize, bellish);

			$pb.fillCircle(0, $pb.height, blackSize, black);
			$pb.drawCircle(0, $pb.height, blackSize, bellish);

			var amount = 12;
			for (var i = 0; i < amount; i++) {
				var x = (i * 7) % $pb.width;
				//var y = (i * 10 + t) % $pb.height;
				var y = ((i ^ (i << 7)) + frame * 4) % $pb.height;
				$pb.setPixel(x, y, pix0);
				$pb.setPixel(x, y + 1, pix1);
				$pb.setPixel(x, y + 2, pix2);
			}

			for (var i = 0; i < 2; i++) {
				$pb.blit(sprite, Math.random() * $pb.width, Math.random() * $pb.height);
			}

			var col = pixelbutler.hsv(220, pixelbutler.rand(100), 50 + pixelbutler.rand(50));
			$pb.text(5, 5, 'frame'.substring(0, (frame % 80 / 5)), col);
			$pb.text(5, 23, 'buffer'.substring(0, (frame % 80 / 5)), col);

			$pb.drawRect(2, 2, $pb.width - 4, $pb.height - 4, pixelbutler.hsv(220, pixelbutler.rand(100), pixelbutler.rand(100)));

			$pb.blit(sprite, 1, 1);
			$pb.blit(sprite, $pb.width - 4, 1);
			$pb.blit(sprite, $pb.width - 4, $pb.height - 4);
			$pb.blit(sprite, 1, $pb.height - 4);

			$pb.render();
		}

		function destruct() {
			$pb.destruct();
		}

		// return a handle
		return {
			stage: $pb,
			destruct: destruct,
			render: render
		};
	};
});
