'use strict';

/**
 *  hacky code to manage ui and load gallery demos
 **/
// load raw html parts (strip to body content)
define(['lorez', 'text!../partial/ui.html!strip'], function (lorez, uiHtml) {

	// define demo defaults
	var config = null;
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

		// inject html snippet
		var body = document.getElementsByTagName('body')[0];
		body.insertAdjacentHTML('afterbegin', uiHtml);

		elem('hud').style.display = 'none';
		elem('screen-wrap').style.display = 'none';

		// grab canvas
		config.canvas = (typeof config.canvas === 'string' ? elem(config.canvas) : config.canvas);
		if (!config.canvas) {
			throw new Error('cannot locate canvas ' + config.canvas);
		}

		// keep size for later
		baseSize.width = config.canvas.width;
		baseSize.height = config.canvas.height;

		// scaleMode selector
		var viewRes = elem('hud-viewRes');
		viewRes.addEventListener('change', function () {
			notify('scale', {scale: viewRes.value});
		});
		viewRes.selectedIndex = 0;

		// navigation
		elem('hud').addEventListener('click', function (ev) {
			switch(ev.target.id){
				case 'nav-next':
					notify('next');
					break;
				case 'nav-prev':
					notify('next');
					break;
				case 'hud-source':
					notify('source');
					break;
				default:
					console.log(ev.target.id);
					break;
			}
		});

		// when ready
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
		// is this needed?
		config.canvas.width = 1;
		config.canvas.height = 1;

		config.canvas = next;
	}

	function loadDemo(demoName, callback) {
		console.log('load demo: ' + demoName);

		// require it
		require([demoName], function (factory) {

			// get rid of previous demo
			if (demo) {
				if (demo.ticker) {
					demo.ticker.stop();
				}
				demo.destruct();

				// can only ever use one context per canvas so create new one
				newCanvas();
			}

			//make demo instance
			demo = factory(config);

			// set default helpers if the demo didn't has custom ones
			if (!demo.ticker) {
				var render = demo.render;
				if (config.ticker === 'interval') {
					demo.ticker = lorez.ticker.interval(render, (config.fps || 32));
				}
				else {//if (config.ticker === 'request') {
					demo.ticker = lorez.ticker.request(render);
				}
			}

			callback(demo);
		});
	}

	// export the handle
	return {
		init: init,
		load: loadDemo
	};
});
