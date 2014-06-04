import Char = require('./Char');

class Font {
	public name: string;
	public height: number;
	public chars: {[char: string]: Char};

	// TODO assert height

	constructor(name: string, height: number, data: Object) {
		this.name = name;
		this.height = height;
		this.chars = Object.create(null);

		Object.keys(data).forEach((char) => {
			this.chars[char] = new Char(char, data[char]);
		});
	}
}

export = Font;
