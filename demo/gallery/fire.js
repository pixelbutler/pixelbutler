'use strict';

define(['lorez'], function (lorez) {

	// return factory
	return function (config) {
		var $fb = new lorez.Stage({
			width: 160,
			height: 120,
			scale: 4,
			center: true,
			canvas: config.canvas
		});

		// Clear the screen.
		$fb.clear([0, 0, 0]);

// Fire effect.
		var firePalette = [
			[200, 32, 32],
			[200, 200, 32],
			[200, 200, 200],
		];

		for (var i = 0; i < $fb.width; i++) {
			var col = firePalette[lorez.rand(3)];
			$fb.setPixel(i, $fb.height - 1, lorez.rgb(col[0] + lorez.rand(30) - 15, col[1] + lorez.rand(30) - 15, col[2] + lorez.rand(30) - 15));
		}

		function render(frame) {
			var tmp = lorez.rgb();
			var total = lorez.rgb();
			for (var i = 0; i < $fb.width; i++) {
				for (var j = 0; j < $fb.height - 1; j++) {
					total.r = 0;
					total.g = 0;
					total.b = 0;

					// Left.
					$fb.getPixel(i === 0 ? $fb.width - 1 : i - 1, j, tmp);
					total.r += tmp.r;
					total.g += tmp.g;
					total.b += tmp.b;

					// Right.
					$fb.getPixel(i === $fb.width - 1 ? 0 : i + 1, j, tmp);
					total.r += tmp.r;
					total.g += tmp.g;
					total.b += tmp.b;

					// Below.
					$fb.getPixel(i, j + 1, tmp);
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

					$fb.setPixel(i, j, total);
				}
			}
			$fb.render();

			if (frame % 5 === 0) {
				// for(var i=1; i < $fb.width; i++) {
				//   var col = firePalette[lorez.rand(3)];
				//   $fb.setPixel(i-1, $fb.height-1, $fb.getPixel(i, $fb.height-1));
				// }
				// var col = firePalette[lorez.rand(3)];
				// $fb.setPixel($fb.width-1, $fb.height-1, lorez.rgb(col[0] + lorez.rand(30) - 15, col[1] + lorez.rand(30) - 15, col[2] + lorez.rand(30) - 15));
				for (var i = 0; i < $fb.width; i++) {
					var col = firePalette[lorez.rand(3)];
					$fb.setPixel(i, $fb.height - 1, lorez.rgb(col[0] + lorez.rand(30) - 15, col[1] + lorez.rand(30) - 15, col[2] + lorez.rand(30) - 15));
				}
			}
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
