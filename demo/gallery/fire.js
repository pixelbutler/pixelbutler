'use strict';

define(['pixelbutler'], function (pixelbutler) {

	// return factory
	return function (config) {
		var $pb = new pixelbutler.Stage({
			width: 160,
			height: 120,
			scale: 4,
			center: true,
			canvas: config.canvas
		});

		// Clear the screen.
		$pb.clear([0, 0, 0]);

// Fire effect.
		var firePalette = [
			[200, 32, 32],
			[200, 200, 32],
			[200, 200, 200],
		];

		for (var i = 0; i < $pb.width; i++) {
			var col = firePalette[pixelbutler.rand(3)];
			$pb.setPixel(i, $pb.height - 1, pixelbutler.rgb(col[0] + pixelbutler.rand(30) - 15, col[1] + pixelbutler.rand(30) - 15, col[2] + pixelbutler.rand(30) - 15));
		}

		function render(frame) {
			var tmp = pixelbutler.rgb();
			var total = pixelbutler.rgb();
			for (var i = 0; i < $pb.width; i++) {
				for (var j = 0; j < $pb.height - 1; j++) {
					total.r = 0;
					total.g = 0;
					total.b = 0;

					// Left.
					$pb.getPixel(i === 0 ? $pb.width - 1 : i - 1, j, tmp);
					total.r += tmp.r;
					total.g += tmp.g;
					total.b += tmp.b;

					// Right.
					$pb.getPixel(i === $pb.width - 1 ? 0 : i + 1, j, tmp);
					total.r += tmp.r;
					total.g += tmp.g;
					total.b += tmp.b;

					// Below.
					$pb.getPixel(i, j + 1, tmp);
					total.r += tmp.r;
					total.g += tmp.g;
					total.b += tmp.b;

					total.r /= 1.5;
					total.g /= 1.5;
					total.b /= 1.5;

					var intensity = 160;
					if (total.r > intensity) {
						total.r -= intensity;
					}
					if (total.g > intensity) {
						total.g -= intensity;
					}
					if (total.b > intensity) {
						total.b -= intensity;
					}

					$pb.setPixel(i, j, total);
				}
			}
			$pb.render();

			if (frame % 5 === 0) {
				// for(var i=1; i < $pb.width; i++) {
				//   var col = firePalette[pixelbutler.rand(3)];
				//   $pb.setPixel(i-1, $pb.height-1, $pb.getPixel(i, $pb.height-1));
				// }
				// var col = firePalette[pixelbutler.rand(3)];
				// $pb.setPixel($pb.width-1, $pb.height-1, pixelbutler.rgb(col[0] + pixelbutler.rand(30) - 15, col[1] + pixelbutler.rand(30) - 15, col[2] + pixelbutler.rand(30) - 15));
				for (var i = 0; i < $pb.width; i++) {
					var col = firePalette[pixelbutler.rand(3)];
					$pb.setPixel(i, $pb.height - 1, pixelbutler.rgb(col[0] + pixelbutler.rand(30) - 15, col[1] + pixelbutler.rand(30) - 15, col[2] + pixelbutler.rand(30) - 15));
				}
			}
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
