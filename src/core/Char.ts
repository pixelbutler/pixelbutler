class Char {
	public char: string;
	public width: number;
	public map: boolean[];

	//TODO assert line width
	constructor(char: string, map:string[]) {
		this.char = char;
		this.width = map[0].length;
		this.map = [];

		for (var i = 0; i < map.length; i++) {
			var line = map[i];
			for (var c = 0; c < line.length; c++) {
				this.map.push((line.charAt(c) === '1'));
			}
		}
	}
}

export = Char;
