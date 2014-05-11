'use strict';

var Stats = require('../../vendor/Stats');

var statsA;
var statsB;

// add stats measurement and return wrapped function
function wrapCallback(callback) {
    if (!statsA) {
        statsA = new Stats();
        document.body.appendChild(statsA.domElement);
    }
    statsA.setMode(0); // 0: fps, 1: ms
    statsA.domElement.style.position = 'absolute';
    statsA.domElement.style.right = '3px';
    statsA.domElement.style.top = '1px';

    if (!statsB) {
        statsB = new Stats();
        document.body.appendChild(statsB.domElement);
    }
    statsB.setMode(1); // 0: fps, 1: ms
    statsB.domElement.style.position = 'absolute';
    statsB.domElement.style.right = '3px';
    statsB.domElement.style.top = '51px';

    if (!callback) {
        // dummy
        callback = function () {};
    }

    var wrap = function () {
        statsA.begin();
        statsB.begin();
        callback();
        statsA.end();
        statsB.end();
    };
    wrap.begin = function () {
        statsA.begin();
        statsB.begin();
    };
    wrap.end = function () {
        statsA.end();
        statsB.end();
    };
    wrap.stop = function () {
        statsA.end();
        statsB.end();
        statsA.domElement.parent.removeChild(statsA.domElement);
        statsB.domElement.parent.removeChild(statsB.domElement);
    };

    return wrap;
}

// exported value
module.exports = {
    wrap: wrapCallback
};
