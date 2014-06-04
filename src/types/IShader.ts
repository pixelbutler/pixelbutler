import IRGBA = require('./IRGBA');

interface IShader {
	(x: number, y: number, col: IRGBA): IRGBA;
}

export = IShader;
