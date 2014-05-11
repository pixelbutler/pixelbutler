'use strict';

/**
 *  hacky code to manage ui and load gallery demos
 **/
// load raw html parts (strip to body content)
define(['Framebuffer', 'text!../partial/ui.html!strip'], function (Framebuffer, uiHtml) {

    var config = {
        useWebGL: false,
        scale: {
            center: true,
            scale: 'max'
        }
    };
    var demo = null;
    var baseSize = {width: 32, height: 32};

    // micro event dispatcher
    var listener = null;

    function notify(type, data) {
        if (!listener) {
            return;
        }
        if (!data) {
            data = {type: type};
        } else {
            data.type = type;
        }
        listener(data);
    }

    function elem(id) {
        return document.getElementById(id);
    }


    function init(_config, _listener, initialiser) {
        config = _config;
        listener = _listener;

        config.useWebGL = !!config.useWebGL;

        // inject html
        var body = document.getElementsByTagName('body')[0];
        body.insertAdjacentHTML('afterbegin', uiHtml);

        elem('hud').style.display = 'none';
        elem('screen-wrap').style.display = 'none';

        // grab context
        config.canvas = (typeof config.canvas === 'string' ? elem(config.canvas) : config.canvas);
        if (!config.canvas) {
            throw new Error('cannot locate canvas ' + config.canvas);
        }
        baseSize.width = config.canvas.width;
        baseSize.height = config.canvas.height;

        // select options
        var viewRes = elem('hud-viewRes');
        viewRes.addEventListener('change', function () {
            notify('scale', {scale: viewRes.value});
        });
        viewRes.selectedIndex = 0;

        elem('hud').addEventListener('click', function (ev) {
            if (ev.target === elem('nav-next')) {
                notify('next');
            }
            else if (ev.target === elem('nav-prev')) {
                notify('prev');
            }
        });

        function initialise() {
            elem('hud').style.display = 'block';
            elem('screen-wrap').style.display = 'block';

            initialiser();
        }

        // hit it
        initialise();
    }

    function newCanvas() {
        var next = document.createElement('canvas');
        next.width = baseSize.width;
        next.height = baseSize.height;
        config.canvas.parentElement.insertBefore(next, config.canvas);
        config.canvas.parentElement.removeChild(config.canvas);
        config.canvas.width = 2;
        config.canvas.height = 2;
        config.canvas = next;
    }

    function loadDemo(demoName, callback) {
        console.log(demoName);
        // require it
        require([demoName], function (factory) {
            if (demo) {
                if (demo.ticker) {
                    demo.ticker.stop();
                }
                if (demo.autosize) {
                    demo.autosize.stop();
                }
                if (demo.stats) {
                    demo.stats.stop();
                }
                demo.close();
                newCanvas();
            }

            //make instance
            demo = factory(config);

            if (!demo.autosize) {
                demo.autosize = Framebuffer.autosize.create(demo.$fb, config.scale);
            }

            if (!demo.ticker) {
                var render = demo.render;
                if (config.stats) {
                    // wrap
                    render = Framebuffer.stats.wrap(render);
                }

                if (config.ticker === 'interval') {
                    demo.ticker = Framebuffer.ticker.interval(render, (config.fps || 30));
                }
                else if (config.ticker === 'stable') {
                    demo.ticker = Framebuffer.ticker.stable(render, (config.fps || 30));
                }
                else {//if (config.ticker === 'request') {
                    demo.ticker = Framebuffer.ticker.request(render);
                }
            }

            callback(demo);
        });
    }

    // mode export
    return {
        init: init,
        load: loadDemo
    };
});
