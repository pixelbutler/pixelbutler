'use strict';

/**
 * bundle file with just the basics
 **/

// lets decorate framebufffer export
var expose = require('./core/fb');

// export usefull stuff
// TODO figure out what goes where
expose.RenderWebGL = require('./render/webgl');

module.exports = expose;
