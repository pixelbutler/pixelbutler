'use strict';

// helper ripped from https://stackoverflow.com/questions/15451321/how-can-i-make-html5-javascript-canvas-fill-window-screen
function getViewport() {
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {width: e[a + 'Width'], height: e[a + 'Height']};
}

module.exports = {
    getViewport: getViewport
};

