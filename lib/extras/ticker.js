'use strict';

// TODO add functionality to pass frame-number and high-precision performance.now()

// simple setInterval ticker
function frameInterval(callback, fps) {
    var intervalId = 0;

    function step() {
        callback();
    }

    var that = {};
    that.start = function() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(step, 1000 / fps);
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = 0;
        }
    };
    that.isRunning = function() {
        return !!intervalId;
    };
    return that;
}


// simple requestAnimationFrame ticker
function frameRequest(callback) {
    var running = false;

    function step() {
        callback();
        if (running) {
            requestAnimationFrame(step);
        }
    }

    var that = {};
    that.start = function() {
        if (!running) {
            running = true;
            requestAnimationFrame(step);
        }
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (running) {
            running = false;
            cancelAnimationFrame(step);
        }
    };
    that.isRunning = function() {
        return running;
    };
    return that;
}

// fancy ticker tries to find exacter frame-rate (sort-of-works for lower fps)
//TODO improve logic and try to correct for drift and GC frames
function frameStable(callback, fps) {
    var intervalId = 0;
    var check = 1;
    var next = performance.now();

    function step() {
        var start = performance.now();
        if (start > next) {
            callback();
            var dur = (start - performance.now());
            next = start + (1000 / fps) - dur ;
        }
    }

    var that = {};
    that.start = function() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(step, check);
    };
    that.step = function() {
        step();
    };
    that.stop = function() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = 0;
        }
    };
    that.isRunning = function() {
        return !!intervalId;
    };
    return that;
}

module.exports = {
    interval: frameInterval,
    request: frameRequest,
    stable: frameStable
};
