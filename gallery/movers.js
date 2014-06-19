'use strict';

define(['pixelbutler'], function (pixelbutler) {

	// return factory
	return function (config) {
		var $pb = new pixelbutler.Stage({
			width: 32,
			height: 32,
			center: true,
			scale: 'max',
			canvas: config.canvas
		});

		var white = pixelbutler.rgb(255, 255, 255);
		var black = pixelbutler.rgb(0, 0, 0);

		var sprite = new pixelbutler.Bitmap(3, 3);
		sprite.setPixel(1, 0, white);
		sprite.setPixel(1, 2, white);
		sprite.setPixel(0, 1, white);
		sprite.setPixel(2, 1, white);

		function Particle(sprite) {
			this.sprite = sprite;
			this.x = 0;
			this.x = 0;
			this.sx = 0;
			this.sy = 0;
		}

		var particles = [];

		function addParticle(sprite, max) {
			var p = new Particle(sprite);
			p.x = $pb.width * 0.5 - 2;
			p.y = $pb.height * 0.5 - 2;

			p.sx = (Math.random() * 2 - 1) * max;
			p.sy = (Math.random() * 2 - 1) * max;
			particles.push(p);
		}

		function render() {
			if (particles.length < 50) {
				addParticle(sprite, 0.1);
			}
			$pb.clear(black);
			for (var i = 0; i < particles.length; i++) {
				var p = particles[i];
				p.x = (p.x + p.sx) % $pb.width;
				p.y = (p.y + p.sy) % $pb.height;
				$pb.blit(p.sprite, p.x, p.y);
			}
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
