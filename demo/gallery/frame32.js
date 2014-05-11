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

        var t = 0;

        var red = [255, 0, 0];
        var white = [255, 255, 255];
        var black = [0, 0, 0];

        var sprite = $fb.makesprite(3, 3);
        sprite.pixel(0, 0, red);
        sprite.pixel(2, 0, red);
        sprite.pixel(0, 2, red);
        sprite.pixel(2, 2, red);
        sprite.pixel(1, 1, white);

        var bellish = [32, 32, 64];
        var purrrpl = [64, 32, 64];
        var grrhey = [32, 32, 32];

        var pix0 = [32, 32, 64];
        var pix1 = [48, 48, 164];
        var pix2 = [72, 72, 200];

        var blackSize = 16;
        var purSize = 16;

        var mp2 = Math.PI * 2;

        function render() {
            t++;

            $fb.clear(black);

            var factor = Math.sin(t / 60 * mp2) * 0.5 + 1;

            $fb.fillcircle(0, 0, purSize * factor, purrrpl);
            $fb.fillcircle($fb.width, $fb.height, purSize * factor, purrrpl);

            $fb.fillcircle($fb.width, 0, blackSize, black);
            $fb.circle($fb.width, 0, blackSize, bellish);

            $fb.fillcircle(0, $fb.height, blackSize, black);
            $fb.circle(0, $fb.height, blackSize, bellish);

            var amount = 12;
            for (var i = 0; i < amount; i++) {
                var x = (i * 7) % $fb.width;
                //var y = (i * 10 + t) % $fb.height;
                var y = ((i ^ (i << 7)) + t * 4) % $fb.height;
                $fb.pixel(x, y, pix0);
                $fb.pixel(x, y + 1, pix1);
                $fb.pixel(x, y + 2, pix2);
            }

            for (var i = 0; i < 2; i++) {
                $fb.blit(sprite, Math.random() * $fb.width, Math.random() * $fb.height);
            }

            var col = $fb.hsv2rgb([220, $fb.rand(100), 50 + $fb.rand(50)]);
            $fb.text(5, 5, "frame".substring(0, (t % 80 / 5)), col);
            $fb.text(5, 23, "buffer".substring(0, (t % 80 / 5)), col);

            $fb.rect(2, 2, $fb.width - 4, $fb.height - 4, $fb.hsv2rgb([220, $fb.rand(100), $fb.rand(100)]));

            $fb.blit(sprite, 1, 1);
            $fb.blit(sprite, $fb.width - 4, 1);
            $fb.blit(sprite, $fb.width - 4, $fb.height - 4);
            $fb.blit(sprite, 1, $fb.height - 4);

            $fb.render();
        }

        function close() {
            $fb.close();
        }

        // return a handle
        return {
            $fb: $fb,
            autosize: Framebuffer.autosize.create($fb, {scale: 8, center: true}),
            close: close,
            render: render
        };
    };
});
