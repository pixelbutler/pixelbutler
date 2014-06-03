import IRGB = require('./IRGB');

interface IShader {
	(x: number, y: number, col: IRGB): IRGB
}

export = IShader;
