import IHSV = require('../types/IHSV');

class HSV implements IHSV {
	public h: number;
	public s: number;
	public v: number;

	constructor(h: number = 0, s: number = 0, v: number = 0) {
		this.h = h;
		this.s = s;
		this.v = v;
	}
}

export  = HSV;
