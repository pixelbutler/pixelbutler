// UMD header from https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            return (root.RenderWebGL = factory());
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals
        root.RenderWebGL = factory();
    }
}(this, function () {
    'use strict';

    var vertexShaderSource = [
        'attribute vec2 a_position;',
        'attribute vec2 a_texCoord;',
        'varying vec2 v_texCoord;',
        'void main() {',
        '    gl_Position = vec4(a_position * vec2(1, -1), 0, 1);',
        '    v_texCoord = a_texCoord;',
        '}'
    ].join('\n');

    var fragmentShaderSource = [
        'precision mediump float;',
        'uniform sampler2D u_image;',
        'varying vec2 v_texCoord;',
        'void main() {',
        '    gl_FragColor = texture2D(u_image, v_texCoord);',
        '}'
    ].join('\n');

    // some WebGL helper code sourced & butchered from http://www.html5rocks.com/en/tutorials/webgl/webgl_fundamentals/
    function loadShader(gl, shaderSource, shaderType) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            throw new Error('error compiling shader "' + shader + '":' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    function RenderWebGL(image, canvas) {
        this.canvas = canvas;

        this.image = image;
        this.width = image.width;
        this.height = image.height;

        // use a Uint8Array view for WebGL compatibility
        this.px = new Uint8Array(image.buffer);

        if (!window.WebGLRenderingContext) {
            throw new Error('browser is not WegGL capable');
        }

        // let's not bother with alpha on main canvas
        var glOpts = {alpha: false};

        // lazy alias to local var to keep code clear, also do fancy context lookup
        var gl = this.gl = this.canvas.getContext('webgl', glOpts) || this.canvas.getContext('experimental-webgl', glOpts);
        if (!gl) {
            throw new Error('could not create WebGL context');
        }

        // clear the back buffer
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // turn off rendering to alpha
        gl.colorMask(true, true, true, false);

        // setup a GLSL program
        var program = gl.createProgram();

        // add shaders
        gl.attachShader(program, loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
        gl.attachShader(program, loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(program);

        // check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            throw new Error(('error in program linking:' + gl.getProgramInfoLog(program)));
        }
        gl.useProgram(program);

        // look up where the vertex data needs to go
        this.positionLocation = gl.getAttribLocation(program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

        // texture coordinates
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // create a texture
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // set the parameters so we can render any size image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // attach the texture to the vertices
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            1.0,  1.0
        ]), gl.STATIC_DRAW);

        // apply size
        this.resize();
    }

    RenderWebGL.prototype.resize = function (render) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        if (render) {
            this.render();
        } else {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
    };

    RenderWebGL.prototype.update = function () {
        // select the texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        // upload the image into the texture.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.px);
        // render state
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };

    return RenderWebGL;
}));
