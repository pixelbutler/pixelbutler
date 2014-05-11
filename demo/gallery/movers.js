'use strict';

define(['Framebuffer'], function (Framebuffer) {

    // return factory
    return function (config) {
        var $fb = new Framebuffer({
            width: 32,
            height: 32,
            canvas: config.canvas,
            renderer: (config.useWebGL ? Framebuffer.RenderWebGL : null)
        });
        Framebuffer.autosize.create($fb, config.size);

        var red = [255, 0, 0];
        var white = [255, 255, 255];
        var black = [0, 0, 0];

        var sprite = $fb.makesprite(3, 3);
        sprite.pixel(1, 0, white);
        sprite.pixel(1, 2, white);
        sprite.pixel(0, 1, white);
        sprite.pixel(2, 1, white);

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
            p.x = $fb.width * .5 - 2;
            p.y = $fb.height * .5 - 2;

            p.sx = (Math.random() * 2 - 1) * max;
            p.sy = (Math.random() * 2 - 1) * max;
            particles.push(p);
        }

        function render() {
            if (particles.length < 50) {
                addParticle(sprite, .1);
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

        function close() {
            $fb.close();
        }

        // return a handle
        return {
            $fb: $fb,
            close: close,
            render: render
        };
    };
});
