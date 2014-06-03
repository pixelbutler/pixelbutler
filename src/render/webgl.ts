/// <reference path="../../typings/tsd.d.ts" />

'use strict';

import IRenderer = require('../render/IRenderer');

var vertexShaderSource = [
	// refer the vertices and texture coordinates
	'attribute vec2 a_position;',
	'attribute vec2 a_texCoord;',

	// passed to fragment shader
	'varying vec2 v_texCoord;',

	'void main() {',
	// simple transform
	'    gl_Position = vec4(a_position, 0, 1);',
	// interpolated value
	'    v_texCoord = a_texCoord;',
	'}'
].join('\n');

var fragmentShaderSource = [
	// config something (cargo-cult from tutorial)
	'precision mediump float;',

	// texture sampler (number 0)
	'uniform sampler2D u_image;',

	// interpolated value from vertex shader
	'varying vec2 v_texCoord;',

	'void main() {',
	// sample texture on the interpolated value; nearest-neighbour etc was configured earlier
	'    gl_FragColor = texture2D(u_image, v_texCoord);',
	'}'
].join('\n');

function loadShader(gl, shaderSource, shaderType) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	// check if it worked (cargo-cult from tutorial)
	var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!compiled) {
		throw new Error('error compiling shader "' + shader + '":' + gl.getShaderInfoLog(shader));
	}
	return shader;
}

class WebGLRender implements IRenderer {

	private canvas: HTMLCanvasElement;
	private width: number;
	private height: number;
	private image: number;
	private px: Uint8Array;

	private gl: WebGLRenderingContext;
	private positionLocation: number;
	private texCoordLocation: number;
	private positionBuffer: WebGLBuffer;
	private texCoordBuffer: WebGLBuffer;
	private texture: WebGLTexture;

	constructor(image, canvas) {
		this.canvas = canvas;
		this.image = image;
		this.width = image.width;
		this.height = image.height;

		// use a Uint8Array view for WebGL compatibility
		this.px = new Uint8Array(image.buffer);

		// cheap check
		if (!window.WebGLRenderingContext) {
			throw new Error('browser does not support WegGL');
		}

		// let's not bother with alpha on main canvas
		var glOpts = {alpha: false};

		// lazy alias to local var to keep code clear, also do fancy context lookup
		var gl = this.gl = this.canvas.getContext('webgl', glOpts) || this.canvas.getContext('experimental-webgl', glOpts);
		if (!gl) {
			throw new Error('could not create WebGL context');
		}

		// setup a GLSL program
		var program = gl.createProgram();

		// add shaders
		gl.attachShader(program, loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
		gl.attachShader(program, loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
		gl.linkProgram(program);

		// check the link status (cargo-cult from tutorial)
		var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			throw new Error(('error in program linking:' + gl.getProgramInfoLog(program)));
		}
		gl.useProgram(program);

		// shader variables that refer to the vertices and texture coordinates
		this.positionLocation = gl.getAttribLocation(program, 'a_position');
		this.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

		// setup vertices
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		// upload vertices for 2 triangles in 2D: 3 x 2 x 2 elements
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0
		]), gl.STATIC_DRAW);

		// setup texture coordinates
		this.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);

		gl.enableVertexAttribArray(this.texCoordLocation);
		gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

		// upload texture coordinates matching the vertices
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0, 1.0,
			1.0, 1.0,
			0.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,
			1.0, 0.0
		]), gl.STATIC_DRAW);

		// create a texture
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// set the parameters so we can render any size image
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// clear the back buffer (with alpha)
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// turn off rendering to alpha
		gl.colorMask(true, true, true, false);

		// apply size
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	resize(render?: boolean): void {
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		if (render) {
			this.update();
		}
		else {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		}
	}

	update(): void {
		// upload the pixels to the texture.
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.px);
		// render state
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	}

	close(): void {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		//TODO what else? how unload WebGL?
		this.gl = null;
		this.px = null;
		this.canvas = null;
	}
}

export = WebGLRender;
