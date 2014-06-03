'use strict';

define(['lorez'], function (lorez) {

	// return factory
	return function (config) {
		var $fb = new lorez.Stage({
			width: 32,
			height: 32,
			center: true,
			scale: 'max',
			canvas: config.canvas
		});

		var white = lorez.rgb(255, 255, 255);
		var black = lorez.rgb(0, 0, 0);

		var sprite = new lorez.Bitmap(3, 3);
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
			p.x = $fb.width * 0.5 - 2;
			p.y = $fb.height * 0.5 - 2;

			p.sx = (Math.random() * 2 - 1) * max;
			p.sy = (Math.random() * 2 - 1) * max;
			particles.push(p);
		}

		function render() {
			if (particles.length < 50) {
				addParticle(sprite, 0.1);
			}
			$fb.clear(black);
			for (var i = 0; i < particles.length; i++) {
				var p = particles[i];
				p.x = (p.x + p.sx) % $fb.width;
				p.y = (p.y + p.sy) % $fb.height;
				$fb.blit(p.sprite, p.x, p.y);
			}
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
