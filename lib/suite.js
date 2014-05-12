'use strict';

// decorate the basic export
var expose = require('./basic');

expose.autosize = require('./extras/autosize');
expose.ticker = require('./extras/ticker');
expose.stats = require('./extras/stats');

module.exports = expose;
